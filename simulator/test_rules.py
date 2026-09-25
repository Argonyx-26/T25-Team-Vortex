from rules import evaluate

test_event = {
    "event_id": "evt_test1",
    "source": "network",
    "event_type": "failed_login",
    "entity": {"id": "employee_42", "type": "employee"},
    "location": None,
    "timestamp": "2026-09-26T02:10:05Z",
    "severity": "low",
    "raw_details": {"attempt_count": 3, "ip": "10.0.0.5"},
}

print(evaluate(test_event))
# expect: {'flagged': True, 'rule_triggered': 'brute_force_login', ...}