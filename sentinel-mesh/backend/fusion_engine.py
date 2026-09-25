"""
Fusion Engine — Person B (Ragavendhar's teammate slot)

Groups flagged events that share the same entity, location, or time window
into single "incident" objects matching schemas/incident.schema.json.

Only events with flagged == True are ever considered — unflagged noise
never reaches here (or if it does, should_fuse() silently rejects it).
"""

from datetime import datetime, timedelta
from collections import Counter
from typing import List, Dict
import itertools

# --- tuning knob -------------------------------------------------------
# How close together (in minutes) two flagged events need to be to even be
# considered for fusion. Widen this if your attack sequence in the
# simulator is spread out more than ~10 minutes.
TIME_WINDOW_MINUTES = 10

SEVERITY_RANK = {"low": 0, "medium": 1, "high": 2, "critical": 3}

_incident_counter = itertools.count(1)


def _parse_ts(ts: str) -> datetime:
    # handles the trailing "Z" that Python's fromisoformat doesn't like pre-3.11
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def _new_incident_id() -> str:
    return f"inc_{next(_incident_counter):05d}"


def should_fuse(event_a: Dict, event_b: Dict, time_window_minutes: int = TIME_WINDOW_MINUTES) -> bool:
    """
    Core correlation rule. Two flagged events fuse if they're within the
    time window AND share either the same entity or the same location.
    """
    if not event_a.get("flagged") or not event_b.get("flagged"):
        return False

    ts_a, ts_b = _parse_ts(event_a["timestamp"]), _parse_ts(event_b["timestamp"])
    if abs(ts_a - ts_b) > timedelta(minutes=time_window_minutes):
        return False

    same_entity = event_a["entity"]["id"] == event_b["entity"]["id"]
    same_location = (
        event_a.get("location") is not None
        and event_a.get("location") == event_b.get("location")
    )
    return same_entity or same_location


def _correlation_reason(group_events: List[Dict]) -> str:
    entities = {e["entity"]["id"] for e in group_events}
    locations = {e.get("location") for e in group_events if e.get("location")}
    same_entity = len(entities) == 1
    same_location = len(locations) == 1

    if same_entity and same_location:
        return "same_entity_and_location"
    if same_entity:
        return "same_entity"
    if same_location:
        return "same_location"
    return "same_time_window"


def _incident_severity(group_events: List[Dict]) -> str:
    return max(group_events, key=lambda e: SEVERITY_RANK[e["severity"]])["severity"]


def _primary_entity(group_events: List[Dict]) -> Dict:
    # pick the entity that appears most often in the group (handles the rare
    # case of two different entity ids linked only by shared location)
    counts = Counter(e["entity"]["id"] for e in group_events)
    top_id = counts.most_common(1)[0][0]
    return next(e["entity"] for e in group_events if e["entity"]["id"] == top_id)


def fuse(events: List[Dict], time_window_minutes: int = TIME_WINDOW_MINUTES) -> List[Dict]:
    """
    events: list of raw event dicts (event.schema.json), flagged + unflagged mixed is fine.
    Returns: list of incident dicts (incident.schema.json) with the forecast/Claude
             fields (matched_attack_pattern, predicted_next_step, confidence, summary,
             recommended_action) left as None — forecast_module.forecast() and
             claude_client fill those in afterward.
    """
    flagged = [e for e in events if e.get("flagged")]
    flagged.sort(key=lambda e: e["timestamp"])

    # Union-Find so that A-links-to-B and B-links-to-C end up in ONE incident,
    # even if A and C alone wouldn't have fused directly.
    parent = {e["event_id"]: e["event_id"] for e in flagged}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        rx, ry = find(x), find(y)
        if rx != ry:
            parent[rx] = ry

    for a, b in itertools.combinations(flagged, 2):
        if should_fuse(a, b, time_window_minutes):
            union(a["event_id"], b["event_id"])

    groups: Dict[str, List[Dict]] = {}
    for e in flagged:
        groups.setdefault(find(e["event_id"]), []).append(e)

    incidents = []
    now = datetime.utcnow().isoformat(timespec="seconds") + "Z"

    for group_events in groups.values():
        if len(group_events) < 2:
            continue  # schema requires minItems 2 — a lone flagged event isn't an incident yet

        group_events.sort(key=lambda e: e["timestamp"])
        locations = sorted({e["location"] for e in group_events if e.get("location")})

        incidents.append({
            "incident_id": _new_incident_id(),
            "created_at": now,
            "updated_at": None,
            "linked_event_ids": [e["event_id"] for e in group_events],
            "primary_entity": _primary_entity(group_events),
            "locations": locations,
            "time_window": {
                "start": group_events[0]["timestamp"],
                "end": group_events[-1]["timestamp"],
            },
            "correlation_reason": _correlation_reason(group_events),
            "severity": _incident_severity(group_events),
            "matched_attack_pattern": None,
            "predicted_next_step": None,
            "confidence": None,
            "summary": None,
            "recommended_action": None,
            "status": "new",
            "operator_feedback": None,
        })   

    return incidents


# --- quick standalone test, per the plan: "test in isolation using examples.json" ---
if __name__ == "__main__":
    import json
    import os

    examples_path = os.path.join(os.path.dirname(__file__), "..", "schemas", "examples.json")
    with open(examples_path) as f:
        data = json.load(f)

    result = fuse(data["example_events"])
    print(json.dumps(result, indent=2))

    if result:
        got = result[0]
        expected = data["example_incident"]
        print("\n--- sanity check vs example_incident ---")
        print("linked_event_ids match:", got["linked_event_ids"] == expected["linked_event_ids"])
        print("correlation_reason match:", got["correlation_reason"] == expected["correlation_reason"])
        print("severity match:", got["severity"] == expected["severity"])
    else:
        print("No incidents produced — check TIME_WINDOW_MINUTES or examples.json path")