import os
import pandas as pd
import json
import time
import random
import requests
from datetime import datetime, timezone, timedelta

script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, 'nslkdd_test.csv')

df = pd.read_csv(csv_path)
df = df.rename(columns={'class': 'label'})

BACKEND_URL = os.environ.get("SENTINEL_BACKEND_URL", "http://localhost:5000/events")

def severity_from_class(row_label):
    if row_label == 'normal':
        return 'low'
    return 'high' if row_label in ['neptune', 'portsweep', 'satan'] else 'medium'

def to_event(row, event_id, sim_time):
    is_anomaly = row['label'] != 'normal'
    return {
        "event_id": f"evt_net_{event_id:05d}",
        "source": "network",
        "event_type": "failed_login" if is_anomaly else "connection_log",
        "entity": {
            "id": "employee_42" if is_anomaly else f"host_{random.randint(1, 10)}",
            "type": "employee" if is_anomaly else "device"
        },
        "location": f"{row['protocol_type']}_{row['service']}",
        "timestamp": sim_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "severity": severity_from_class(row['label']),
        "flagged": is_anomaly,
        "rule_triggered": "brute_force_login" if is_anomaly else None,
        "raw_details": {
            "protocol_type": str(row['protocol_type']),
            "service": str(row['service']),
            "flag": str(row['flag']),
            "src_bytes": int(row['src_bytes']),
            "dst_bytes": int(row['dst_bytes']),
            "label": str(row['label']),
            "attempt_count": 4 if is_anomaly else 1
        }
    }

def replay(delay_seconds=1.0, limit=None):
    sim_time = datetime.now(timezone.utc)
    event_id = 1
    rows = df.itertuples(index=False)

    print(f"[Network Replay] Streaming NSL-KDD telemetry to {BACKEND_URL} (delay={delay_seconds}s, limit={limit})...")

    for row in rows:
        if limit and event_id > limit:
            break

        row_dict = row._asdict()
        event = to_event(row_dict, event_id, sim_time)

        try:
            res = requests.post(BACKEND_URL, json=event, timeout=2)
            status = res.status_code
        except Exception as e:
            status = f"ERR ({e})"

        tag = "[FLAGGED ANOMALY]" if event["flagged"] else "[NORMAL]"
        print(f" {tag} #{event['event_id']} {event['raw_details']['protocol_type']}/{event['raw_details']['service']} -> Backend HTTP {status}")

        event_id += 1
        sim_time += timedelta(seconds=delay_seconds)
        time.sleep(delay_seconds)

if __name__ == "__main__":
    replay(delay_seconds=0.5, limit=50)