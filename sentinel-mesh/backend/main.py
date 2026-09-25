"""
main.py — Sentinel Mesh backend

Wires the whole pipeline together:
  simulator POSTs events -> /events
    -> stored in memory
    -> fusion_engine.fuse() groups flagged events into incidents
    -> forecast_module.forecast() adds matched_attack_pattern / predicted_next_step
    -> groq_client.enrich_incident() adds summary / recommended_action
  dashboard polls -> /incidents to display them

Run from inside backend/:
    python -m uvicorn main:app --reload --port 8000
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import fusion_engine
import forecast_module
import groq_client

app = FastAPI(title="Sentinel Mesh Backend")

# Allow the React dashboard (Vite default: http://localhost:5173,
# CRA default: http://localhost:3000) to call this API from the browser.
# Wide open for hackathon speed — tighten this before showing it to anyone
# outside your laptop.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- request schema, matches schemas/event.schema.json -----------------
# Using Pydantic here (instead of accepting a raw dict) means a malformed
# event from the simulator gets a clear 422 error telling you exactly which
# field is wrong, instead of silently failing or crashing deeper in the
# pipeline.
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


# --- in-memory state -----------------------------------------------------
# No database for a 24hr hackathon — plain lists/dicts, wiped on restart.
_events: List[Dict] = []                # every event ever received, raw dicts
_events_by_id: Dict[str, Dict] = {}     # event_id -> event dict, for quick lookup
_incidents_by_group: Dict[frozenset, Dict] = {}   # frozenset(linked_event_ids) -> incident dict
_incident_id_counter = 0


def _next_incident_id() -> str:
    global _incident_id_counter
    _incident_id_counter += 1
    return f"inc_{_incident_id_counter:05d}"


def _process_pipeline() -> None:
    """
    Re-runs fusion + forecast + Groq over the current event set.

    Incidents are cached by their exact set of linked_event_ids:
      - an EXACT repeat of a group already processed is skipped entirely
        (no wasted Groq calls on every single new unrelated event)
      - a group that's a SUPERSET of an already-cached group (i.e. the same
        incident just gained another linked event, which is exactly what
        happens as your simulator's attack sequence plays out one event at
        a time) reuses that incident's stable ID and replaces the old,
        less-complete version — instead of creating a confusing duplicate
        incident on the dashboard
    """
    fused = fusion_engine.fuse(_events)

    for incident in fused:
        group_key = frozenset(incident["linked_event_ids"])

        if group_key in _incidents_by_group:
            continue  # exact same group already fused, forecasted, and summarized

        # does this group extend (grow) an incident we've already assigned an ID to?
        superseded_key = None
        stable_id = None
        for existing_key, existing_incident in _incidents_by_group.items():
            if existing_key < group_key:  # existing_key is a proper subset of group_key
                superseded_key = existing_key
                stable_id = existing_incident["incident_id"]
                break

        incident["incident_id"] = stable_id or _next_incident_id()
        incident["updated_at"] = datetime.utcnow().isoformat(timespec="seconds") + "Z"

        linked_events = [_events_by_id[eid] for eid in incident["linked_event_ids"]]

        forecast_module.forecast(incident, linked_events)
        groq_client.enrich_incident(incident, linked_events)

        if superseded_key is not None:
            del _incidents_by_group[superseded_key]
        _incidents_by_group[group_key] = incident


# --- routes ----------------------------------------------------------------

@app.get("/health")
def health():
    """Quick smoke test — hit this in a browser or curl before running the
    simulator, to confirm the server's actually up and reachable."""
    return {"status": "ok", "events_received": len(_events), "incidents": len(_incidents_by_group)}


@app.post("/events")
def receive_event(event: RawEvent):
    event_dict = event.model_dump()

    if event_dict["event_id"] in _events_by_id:
        raise HTTPException(status_code=409, detail=f"event_id {event_dict['event_id']} already received")

    _events.append(event_dict)
    _events_by_id[event_dict["event_id"]] = event_dict

    _process_pipeline()

    return {"received": event_dict["event_id"], "flagged": event_dict["flagged"]}


@app.get("/events")
def list_events(flagged_only: bool = False):
    """For debugging — see everything the simulator has sent so far."""
    if flagged_only:
        return [e for e in _events if e["flagged"]]
    return _events


@app.get("/incidents")
def list_incidents():
    """What the dashboard polls. Newest incident first."""
    incidents = list(_incidents_by_group.values())
    incidents.sort(key=lambda i: i["created_at"], reverse=True)
    return incidents


@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    for incident in _incidents_by_group.values():
        if incident["incident_id"] == incident_id:
            return incident
    raise HTTPException(status_code=404, detail="incident not found")


@app.patch("/incidents/{incident_id}/status")
def update_incident_status(incident_id: str, status: str):
    """Dashboard calls this when an operator marks an incident reviewed/
    dismissed/escalated."""
    valid_statuses = {"new", "reviewed", "dismissed", "escalated"}
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"status must be one of {valid_statuses}")

    for incident in _incidents_by_group.values():
        if incident["incident_id"] == incident_id:
            incident["status"] = status
            if status == "dismissed":
                incident["operator_feedback"] = {
                    "dismissed_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
                    "reason": "operator dismissed via dashboard",
                }
            return incident
    raise HTTPException(status_code=404, detail="incident not found")


@app.post("/reset")
def reset():
    """Wipes all in-memory state. Call this between demo rehearsals so you're
    not staring at yesterday's incidents."""
    global _incident_id_counter
    _events.clear()
    _events_by_id.clear()
    _incidents_by_group.clear()
    _incident_id_counter = 0
    return {"status": "reset"}  