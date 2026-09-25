"""
Sentinel Mesh — Rule-Based Detector (Person A)

Given a raw event dict (matching schemas/event.schema.json minus the
'flagged'/'rule_triggered' fields), decide whether it's suspicious.
Returns the same event dict with 'flagged' and 'rule_triggered' filled in.
"""

from datetime import datetime

RESTRICTED_ZONES = {"server_room"}


def after_hours_badge_access(event: dict) -> bool:
    """Badge scans outside roughly 9am-6pm are suspicious."""
    if event["source"] != "badge":
        return False
    timestamp = event["timestamp"].replace("Z", "+00:00")
    hour = datetime.fromisoformat(timestamp).hour
    return hour < 9 or hour > 18


def brute_force_login(event: dict) -> bool:
    """3 or more failed network logins counts as brute force."""
    if event["source"] != "network" or event["event_type"] != "failed_login":
        return False
    attempt_count = event.get("raw_details", {}).get("attempt_count", 0)
    return attempt_count >= 3


def restricted_zone_motion(event: dict) -> bool:
    """Camera motion in a restricted zone is always suspicious."""
    if event["source"] != "camera":
        return False
    return event.get("location") in RESTRICTED_ZONES


RULES = {
    "after_hours_badge_access": after_hours_badge_access,
    "brute_force_login": brute_force_login,
    "restricted_zone_motion": restricted_zone_motion,
}


def evaluate(event: dict) -> dict:
    """Run event through RULES, set flagged + rule_triggered."""
    event["flagged"] = False
    event["rule_triggered"] = None
    for rule_name, rule_fn in RULES.items():
        if rule_fn(event):
            event["flagged"] = True
            event["rule_triggered"] = rule_name
            break
    return event