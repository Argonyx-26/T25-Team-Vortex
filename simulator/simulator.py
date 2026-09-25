"""
Sentinel Mesh — Event Simulator (Person A)

Emits events matching schemas/event.schema.json for camera, badge, and
network sources. Mixes random benign noise with one scripted attack
sequence (see schemas/examples.json -> example_events for the target shape).

POSTs each event to the backend's /events endpoint as it's generated.
"""

import time
import uuid 
import random
import requests
from datetime import datetime, timezone, timedelta

import rules

BACKEND_URL = "http://localhost:8000/events"

SOURCES = ["camera", "badge", "network"]
LOCATIONS = ["lobby", "floor_2", "cafeteria", "server_room"]
EMPLOYEES = ["employee_1", "employee_7", "employee_15"]


def new_event_id() -> str:
    return f"evt_{uuid.uuid4().hex[:8]}"


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def to_iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def make_benign_event() -> dict:
    source = random.choice(SOURCES)
    if source == "camera":
        event_type = "motion_detected"
    elif source == "badge":
        event_type = "badge_scan"
    else:
        event_type = "normal_traffic"

    return {
        "event_id": new_event_id(),
        "source": source,
        "event_type": event_type,
        "entity": {"id": random.choice(EMPLOYEES), "type": "employee"},
        "location": random.choice(LOCATIONS) if source != "network" else None,
        "timestamp": now_iso(),
        "severity": "low",
        "raw_details": {},
    }


def make_attack_sequence() -> list[dict]:
    t0 = datetime.now(timezone.utc)

    return [
        {
            "event_id": new_event_id(),
            "source": "network",
            "event_type": "failed_login",
            "entity": {"id": "employee_42", "type": "employee"},
            "location": None,
            "timestamp": to_iso(t0),
            "severity": "low",
            "raw_details": {"attempt_count": 3, "ip": "10.0.0.5"},
        },
        {
            "event_id": new_event_id(),
            "source": "badge",
            "event_type": "badge_scan",
            "entity": {"id": "employee_42", "type": "employee"},
            "location": "server_room",
            "timestamp": to_iso(t0 + timedelta(minutes=4)),
            "severity": "medium",
            "raw_details": {"door_id": "D-114", "access_granted": True},
        },
        {
            "event_id": new_event_id(),
            "source": "camera",
            "event_type": "motion_detected",
            "entity": {"id": "employee_42", "type": "employee"},
            "location": "server_room",
            "timestamp": to_iso(t0 + timedelta(minutes=5, seconds=30)),
            "severity": "medium",
            "raw_details": {"camera_id": "CAM-09", "duration_seconds": 340},
        },
    ]


def send_event(event: dict):
    print(event)
    try:
        requests.post(BACKEND_URL, json=event, timeout=2)
    except requests.exceptions.RequestException:
        pass  # backend not up yet — fine while testing standalone


def run():
    event_count = 0
    while True:
        event = rules.evaluate(make_benign_event())
        send_event(event)
        event_count += 1

        if event_count == 10:
            for attack_event in make_attack_sequence():
                attack_event = rules.evaluate(attack_event)
                send_event(attack_event)     
                time.sleep(1)

        time.sleep(1.5) 


if __name__ == "__main__":
    run()