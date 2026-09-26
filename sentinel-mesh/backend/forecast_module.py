"""
Forecast Module — Person B

Matches a fused incident's rule_triggered sequence against a library of known
attack patterns and predicts the attacker's likely next step.

Depends on fusion_engine.fuse() having already run — forecast() takes the
incident dict fuse() produced plus the raw linked events, and mutates the
incident in place with matched_attack_pattern / predicted_next_step /
confidence, and escalates severity if the matched pattern warrants it.
"""

from typing import List, Dict, Optional

SEVERITY_RANK = {"low": 0, "medium": 1, "high": 2, "critical": 3}

# Each pattern is an ORDERED sequence of rule_triggered names. The events don't
# need to be back-to-back in the incident — just appear in this relative order.
#
# NOTE: only "recon_then_brute_force" is guaranteed to fire out of the box,
# since it's the only one whose rule_triggered names exist in the example
# (brute_force_login / after_hours_badge_access / restricted_zone_motion,
# from rules.py). The other three are seeded ahead of time per the plan —
# they'll only match once Person A's rules.py actually emits rule_triggered
# values with these exact names (tailgating, data_transfer_spike,
# access_denied, port_scan). Rename to match rules.py if they land differently.
ATTACK_PATTERNS = [
    {
        "name": "recon_then_brute_force",
        "sequence": ["brute_force_login", "after_hours_badge_access", "restricted_zone_motion"],
        "predicted_next_step": "Likely attempt to access or copy data from a server within the next 10 minutes",
        "base_confidence": 0.82,
        "escalate_to": "high",
    },
    {
        "name": "badge_tailgate_then_server_access",
        "sequence": ["tailgating", "after_hours_badge_access", "restricted_zone_motion"],
        "predicted_next_step": "Likely unauthorized handling of server room equipment or data extraction",
        "base_confidence": 0.75,
        "escalate_to": "high",
    },
    {
        "name": "stolen_badge_then_exfiltration",
        "sequence": ["after_hours_badge_access", "restricted_zone_motion", "data_transfer_spike"],
        "predicted_next_step": "Likely data exfiltration in progress - expect a large outbound transfer",
        "base_confidence": 0.88,
        "escalate_to": "critical",
    },
    {
        "name": "unauthorized_visitor_network_join",
        "sequence": ["access_denied", "restricted_zone_motion", "port_scan"],
        "predicted_next_step": "Likely reconnaissance of the internal network from an unregistered device",
        "base_confidence": 0.70,
        "escalate_to": "high",
    },
]

# Minimum fraction of a pattern's steps that must be present (in order) before
# we're willing to report it as a partial/in-progress match at all.
MIN_PARTIAL_COVERAGE = 0.5


def _is_subsequence(pattern_seq: List[str], rule_sequence: List[str]) -> bool:
    """True if pattern_seq appears as an ordered subsequence of rule_sequence
    (not necessarily contiguous)."""
    it = iter(rule_sequence)
    return all(step in it for step in pattern_seq)


def _partial_coverage(pattern_seq: List[str], rule_sequence: List[str]) -> float:
    """Fraction of pattern_seq's steps found, in order, within rule_sequence.
    Used to score an incident that's still forming (attack in progress,
    not yet complete)."""
    it = iter(rule_sequence)
    matched = sum(1 for step in pattern_seq if step in it)
    return matched / len(pattern_seq)


def forecast(incident: Dict, linked_events: List[Dict]) -> Dict:
    """
    incident: an incident dict from fusion_engine.fuse().
    linked_events: the raw event dicts (event.schema.json) whose event_id is
                    in incident["linked_event_ids"]. Order doesn't matter —
                    this function sorts by timestamp itself.

    Returns the same incident dict, mutated in place.
    """
    ordered = sorted(linked_events, key=lambda e: e["timestamp"])
    rule_sequence = [e["rule_triggered"] for e in ordered if e.get("rule_triggered")]

    best_pattern = None
    best_score = 0.0

    for pattern in ATTACK_PATTERNS:
        if _is_subsequence(pattern["sequence"], rule_sequence):
            coverage = 1.0
        else:
            coverage = _partial_coverage(pattern["sequence"], rule_sequence)
            if coverage < MIN_PARTIAL_COVERAGE:
                continue

        score = pattern["base_confidence"] * coverage
        if score > best_score:
            best_score = score
            best_pattern = pattern

    if best_pattern is None:
        incident["matched_attack_pattern"] = None
        incident["predicted_next_step"] = None
        incident["confidence"] = None
        return incident

    incident["matched_attack_pattern"] = best_pattern["name"]
    incident["predicted_next_step"] = best_pattern["predicted_next_step"]
    incident["confidence"] = round(best_score, 2)

    if SEVERITY_RANK[best_pattern["escalate_to"]] > SEVERITY_RANK[incident["severity"]]:
        incident["severity"] = best_pattern["escalate_to"]

    return incident


# --- quick standalone test using schemas/examples.json ---
if __name__ == "__main__":
    import json
    import os
    from fusion_engine import fuse

    examples_path = os.path.join(os.path.dirname(__file__), "..", "schemas", "examples.json")
    with open(examples_path) as f:
        data = json.load(f)

    events = data["example_events"]
    incidents = fuse(events)

    events_by_id = {e["event_id"]: e for e in events}
    for inc in incidents:
        linked = [events_by_id[eid] for eid in inc["linked_event_ids"]]
        forecast(inc, linked)

    print(json.dumps(incidents, indent=2))

    if incidents:
        got = incidents[0]
        expected = data["example_incident"]
        print("\n--- sanity check vs example_incident ---")
        print("matched_attack_pattern match:", got["matched_attack_pattern"] == expected["matched_attack_pattern"])
        print("severity match:", got["severity"] == expected["severity"]) 