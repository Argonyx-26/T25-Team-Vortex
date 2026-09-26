"""
main.py - Sentinel Mesh Backend & Correlation Engine

Provides real-time event ingestion, multi-stream graph fusion,
temporal sequence forecasting, and AI narrative synthesis.

Endpoints:
  GET  /                              -> {"status": "ok"}
  GET  /events                        -> array of raw event objects
  GET  /events?flagged=true           -> array of flagged-only events
  GET  /incidents                     -> array of fused incident objects (with predicted_next_step, predicted_confidence, narrative)
  GET  /incidents/<id>/why            -> array of raw events linked to an incident
  GET  /notifications?type=alert      -> array of alert-type notifications
  GET  /notifications?type=normal     -> array of normal-type notifications
  POST /notifications/<id>/acknowledge -> marks notification handled
  POST /incidents/<id>/dismiss        -> suppresses future similar incidents
  POST /events                        -> ingest new raw event
  POST /reset                         -> reset state

Socket.IO live updates at ws://localhost:5000:
  "new_event"
  "new_incident"
  "new_notification"
"""

import os
import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import socketio

import fusion_engine
import forecast_module
import groq_client

# --- Socket.IO setup ---
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = FastAPI(title="Sentinel Mesh Correlation Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


# --- Schemas ---
class Entity(BaseModel):
    id: str
    type: str


class RawEvent(BaseModel):
    event_id: str
    source: str
    event_type: str
    entity: Entity
    location: Optional[str] = None
    timestamp: str
    severity: str
    flagged: bool
    rule_triggered: Optional[str] = None
    raw_details: Dict[str, Any] = {}


# --- In-memory state ---
_events: List[Dict] = []
_events_by_id: Dict[str, Dict] = {}
_incidents_by_group: Dict[frozenset, Dict] = {}
_notifications: List[Dict] = []
_incident_id_counter = 0
_notif_id_counter = 0
_dismissed_entity_ids = set()


def _next_incident_id() -> str:
    global _incident_id_counter
    _incident_id_counter += 1
    return f"inc_{_incident_id_counter:05d}"


def _next_notif_id() -> str:
    global _notif_id_counter
    _notif_id_counter += 1
    return f"notif_{_notif_id_counter:05d}"


def _create_notification(notif_type: str, title: str, message: str, severity: str = "medium", incident_id: Optional[str] = None) -> Dict:
    clean_title = title.replace("\u2014", " - ").replace("\u2013", " - ")
    clean_message = message.replace("\u2014", " - ").replace("\u2013", " - ")
    notif = {
        "id": _next_notif_id(),
        "type": notif_type,
        "title": clean_title,
        "message": clean_message,
        "severity": severity,
        "timestamp": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "handled": False,
        "incident_id": incident_id,
    }
    _notifications.insert(0, notif)
    return notif


async def _emit_async(event_name: str, payload: Any):
    try:
        await sio.emit(event_name, payload)
    except Exception as e:
        print(f"[Socket.IO] Error emitting {event_name}: {e}")


def _process_pipeline() -> List[Dict]:
    """Runs fusion, forecast, and groq enrichment over the events."""
    fused = fusion_engine.fuse(_events)
    updated_or_new = []

    for incident in fused:
        group_key = frozenset(incident["linked_event_ids"])

        if group_key in _incidents_by_group:
            continue

        superseded_key = None
        stable_id = None
        for existing_key, existing_incident in _incidents_by_group.items():
            if existing_key < group_key:
                superseded_key = existing_key
                stable_id = existing_incident["incident_id"]
                break

        incident_id = stable_id or _next_incident_id()
        incident["incident_id"] = incident_id
        incident["updated_at"] = datetime.utcnow().isoformat(timespec="seconds") + "Z"

        linked_events = [_events_by_id[eid] for eid in incident["linked_event_ids"] if eid in _events_by_id]

        forecast_module.forecast(incident, linked_events)
        groq_client.enrich_incident(incident, linked_events)

        # Standardize contract fields requested by frontend
        raw_conf = incident.get("confidence")
        confidence_val = float(raw_conf) if raw_conf is not None else 0.75
        incident["predicted_confidence"] = confidence_val
        incident["confidence"] = confidence_val
        summary_val = incident.get("summary", "Temporal correlation of multi-source telemetry events.")
        clean_summary = summary_val.replace("\u2014", " - ").replace("\u2013", " - ")
        incident["summary"] = clean_summary
        incident["narrative"] = clean_summary
        if incident.get("predicted_next_step"):
            incident["predicted_next_step"] = incident["predicted_next_step"].replace("\u2014", " - ").replace("\u2013", " - ")

        # Suppressed check if entity was previously dismissed
        primary_entity_id = incident.get("primary_entity", {}).get("id")
        if primary_entity_id in _dismissed_entity_ids:
            incident["status"] = "dismissed"
        elif "status" not in incident:
            incident["status"] = "new"

        if superseded_key is not None:
            del _incidents_by_group[superseded_key]
        _incidents_by_group[group_key] = incident
        updated_or_new.append(incident)

        # Generate notification for this incident
        is_alert = incident.get("severity") in ("high", "critical") or (confidence_val is not None and confidence_val >= 0.75)
        notif_type = "alert" if is_alert else "normal"
        notif_title = f"Incident {incident_id}: {incident.get('matched_attack_pattern', 'Correlated Anomaly')}"
        notif_msg = f"Fused {len(linked_events)} telemetry events across {', '.join(incident.get('locations', ['facility']))}."
        _create_notification(
            notif_type=notif_type,
            title=notif_title,
            message=notif_msg,
            severity=incident.get("severity", "medium"),
            incident_id=incident_id
        )

    return updated_or_new


# --- Initial Seed Data from Real NSL-KDD Dataset ---
def _load_real_nslkdd_events():
    events = []
    csv_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "simulator", "nslkdd_test.csv"))
    if os.path.exists(csv_path):
        import csv
        try:
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader):
                    if idx >= 30:
                        break
                    is_anomaly = row.get("class") == "anomaly"
                    proto = row.get("protocol_type", "tcp")
                    svc = row.get("service", "http")
                    flag = row.get("flag", "SF")
                    src_b = int(row.get("src_bytes", 0) or 0)
                    dst_b = int(row.get("dst_bytes", 0) or 0)
                    rule = "port_scan" if flag == "REJ" and proto == "tcp" else ("brute_force_login" if svc in ("ssh", "ftp", "telnet") and is_anomaly else ("packet_stream_anomaly" if is_anomaly else None))
                    events.append({
                        "event_id": f"evt_kdd_{idx+1:05d}",
                        "source": "network",
                        "event_type": "failed_login" if rule == "brute_force_login" else ("connection_rejected" if flag == "REJ" else "network_flow"),
                        "entity": {"id": "employee_42" if idx < 3 else f"host_{idx}", "type": "employee" if idx < 3 else "device"},
                        "location": f"{proto}_{svc}",
                        "timestamp": f"2026-09-26T02:{10 + (idx // 6):02d}:{(idx * 12) % 60:02d}Z",
                        "severity": "high" if rule == "brute_force_login" else ("medium" if is_anomaly else "low"),
                        "flagged": is_anomaly,
                        "rule_triggered": rule,
                        "raw_details": {
                            "protocol_type": proto,
                            "service": svc,
                            "flag": flag,
                            "src_bytes": src_b,
                            "dst_bytes": dst_b,
                            "dataset": "NSL-KDD KDDTest+",
                            "ip": f"10.0.0.{idx+2}"
                        }
                    })
        except Exception as e:
            print(f"[NSL-KDD Ingestion Warning]: {e}")
    return events


def _seed_initial_state():
    if _events:
        return

    nslkdd_events = _load_real_nslkdd_events()

    # Physical evidence events correlated with target employee_42
    physical_events = [
        {
            "event_id": "evt_phys_00001",
            "source": "badge",
            "event_type": "badge_scan",
            "entity": {"id": "employee_42", "type": "employee"},
            "location": "server_room",
            "timestamp": "2026-09-26T02:14:00Z",
            "severity": "medium",
            "flagged": True,
            "rule_triggered": "after_hours_badge_access",
            "raw_details": {"door_id": "D-114", "access_granted": True, "reader_type": "RFID_Mifare_900MHz", "department": "infrastructure"}
        },
        {
            "event_id": "evt_phys_00002",
            "source": "camera",
            "event_type": "motion_detected",
            "entity": {"id": "employee_42", "type": "employee"},
            "location": "server_room",
            "timestamp": "2026-09-26T02:15:30Z",
            "severity": "high",
            "flagged": True,
            "rule_triggered": "restricted_zone_motion",
            "raw_details": {"camera_id": "CAM-09", "zone": "server_room_vault", "polygon": [160, 70, 320, 240], "confidence": 0.942, "duration_seconds": 340}
        }
    ]

    all_seed = nslkdd_events + physical_events

    for ev in all_seed:
        _events.append(ev)
        _events_by_id[ev["event_id"]] = ev

    _process_pipeline()

    # Pre-populate normal operational notifications
    _create_notification(
        notif_type="normal",
        title="Perimeter Optical Sensor Sync OK",
        message="All 14 CCTV optical stream detectors responding normally.",
        severity="low"
    )
    _create_notification(
        notif_type="normal",
        title="Network Sniffer Heartbeat",
        message="NSL-KDD packet capture rule engine healthy on eth0.",
        severity="low"
    )


_seed_initial_state()


# --- Routes ---

@app.get("/")
def root():
    """Online status check. Frontend polls this every 5 seconds."""
    return {"status": "ok"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "events_received": len(_events),
        "incidents": len(_incidents_by_group),
        "notifications": len(_notifications),
        "timestamp": datetime.utcnow().isoformat(timespec="seconds") + "Z"
    }


@app.get("/events")
def list_events(
    flagged: Optional[bool] = Query(None),
    flagged_only: Optional[bool] = Query(None)
):
    """
    Returns array of raw event objects.
    Supports GET /events?flagged=true
    """
    is_flagged = flagged if flagged is not None else flagged_only
    if is_flagged is True:
        return [e for e in _events if e.get("flagged") is True]
    return list(_events)


@app.post("/events")
async def receive_event(event: RawEvent):
    """Ingests a new raw event, runs pipeline, and emits socket events."""
    event_dict = event.model_dump()

    if event_dict["event_id"] in _events_by_id:
        raise HTTPException(status_code=409, detail=f"event_id {event_dict['event_id']} already received")

    _events.append(event_dict)
    _events_by_id[event_dict["event_id"]] = event_dict

    # Emit new_event to all connected socket clients
    await _emit_async("new_event", event_dict)

    updated_incidents = _process_pipeline()
    for inc in updated_incidents:
        await _emit_async("new_incident", inc)

    # Check newest notification and emit
    if _notifications:
        await _emit_async("new_notification", _notifications[0])

    return {"received": event_dict["event_id"], "flagged": event_dict["flagged"]}


@app.get("/incidents")
def list_incidents():
    """
    Returns array of fused incident objects.
    Each incident includes predicted_next_step, predicted_confidence, narrative, etc.
    """
    incidents = list(_incidents_by_group.values())
    incidents.sort(key=lambda i: i.get("created_at", ""), reverse=True)
    return incidents


@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    for incident in _incidents_by_group.values():
        if incident["incident_id"] == incident_id:
            return incident
    raise HTTPException(status_code=404, detail="Incident not found")


@app.get("/incidents/{incident_id}/why")
def get_incident_why(incident_id: str):
    """
    Returns array of raw events linked to this incident.
    Fulfills GET /incidents/<id>/why contract.
    """
    target = None
    for incident in _incidents_by_group.values():
        if incident["incident_id"] == incident_id:
            target = incident
            break
    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    linked_ids = target.get("linked_event_ids", [])
    events = [_events_by_id[eid] for eid in linked_ids if eid in _events_by_id]
    return events


@app.patch("/incidents/{incident_id}/status")
async def update_incident_status(incident_id: str, status: str):
    valid_statuses = {"new", "reviewed", "dismissed", "escalated"}
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    for incident in _incidents_by_group.values():
        if incident["incident_id"] == incident_id:
            incident["status"] = status
            if status == "dismissed":
                incident["operator_feedback"] = {
                    "dismissed_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
                    "reason": "Operator dismissed via dashboard",
                }
                entity_id = incident.get("primary_entity", {}).get("id")
                if entity_id:
                    _dismissed_entity_ids.add(entity_id)
            await _emit_async("new_incident", incident)
            return incident
    raise HTTPException(status_code=404, detail="Incident not found")


@app.post("/incidents/{incident_id}/dismiss")
async def dismiss_incident(incident_id: str):
    """
    POST /incidents/<id>/dismiss
    Suppresses future similar incidents and updates incident status.
    """
    for incident in _incidents_by_group.values():
        if incident["incident_id"] == incident_id:
            incident["status"] = "dismissed"
            incident["operator_feedback"] = {
                "dismissed_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
                "reason": "Operator suppressed incident via dismiss endpoint",
            }
            entity_id = incident.get("primary_entity", {}).get("id")
            if entity_id:
                _dismissed_entity_ids.add(entity_id)
            await _emit_async("new_incident", incident)
            return {"status": "dismissed", "incident_id": incident_id, "suppressed_entity": entity_id}
    raise HTTPException(status_code=404, detail="Incident not found")


@app.get("/notifications")
def list_notifications(type: Optional[str] = Query(None)):
    """
    Returns array of notifications.
    Supports GET /notifications?type=alert and GET /notifications?type=normal
    """
    if type:
        return [n for n in _notifications if n.get("type") == type]
    return list(_notifications)


@app.post("/notifications/{notification_id}/acknowledge")
async def acknowledge_notification(notification_id: str):
    """
    POST /notifications/<id>/acknowledge
    Marks a notification handled.
    """
    for notif in _notifications:
        if notif["id"] == notification_id:
            notif["handled"] = True
            notif["handled_at"] = datetime.utcnow().isoformat(timespec="seconds") + "Z"
            await _emit_async("notification_updated", notif)
            return {"status": "acknowledged", "notification": notif}
    raise HTTPException(status_code=404, detail="Notification not found")


@app.post("/reset")
def reset():
    """Wipes all state and re-seeds baseline."""
    global _incident_id_counter, _notif_id_counter
    _events.clear()
    _events_by_id.clear()
    _incidents_by_group.clear()
    _notifications.clear()
    _dismissed_entity_ids.clear()
    _incident_id_counter = 0
    _notif_id_counter = 0
    _seed_initial_state()
    return {"status": "reset", "reseeded": True}


# --- Socket.IO Event Handlers ---
@sio.event
async def connect(sid, environ):
    print(f"[Socket.IO] Client connected: {sid}")
    # Immediately send current state snapshot
    await sio.emit("connection_ack", {"status": "connected", "events": len(_events), "incidents": len(_incidents_by_group)}, to=sid)


@sio.event
async def disconnect(sid):
    print(f"[Socket.IO] Client disconnected: {sid}")