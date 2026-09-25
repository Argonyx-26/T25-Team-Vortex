import pandas as pd
import json
import time
import random
from datetime import datetime, timedelta

df = pd.read_csv('nslkdd_test.csv')
df = df.rename(columns={'class': 'label'})

def severity_from_class(row_label):
    if row_label == 'normal':
        return 'low'
    return random.choice(['medium', 'high'])

def to_event(row, event_id, sim_time):
    return {
        "event_id": event_id,
        "source": "network",
        "entity": f"host_{random.randint(1, 15)}",  # simulated "person/device" id
        "location": f"{row['protocol_type']}_{row['service']}",
        "timestamp": sim_time.isoformat(),
        "severity": severity_from_class(row['label']),
        "raw": {
            "protocol_type": row['protocol_type'],
            "service": row['service'],
            "flag": row['flag'],
            "src_bytes": int(row['src_bytes']),
            "dst_bytes": int(row['dst_bytes']),
            "label": row['label']
        }
    }

def replay(delay_seconds=1.0, limit=None):
    sim_time = datetime.now()
    event_id = 1
    rows = df.itertuples(index=False)

    for row in rows:
        if limit and event_id > limit:
            break

        row_dict = row._asdict()
        event = to_event(row_dict, event_id, sim_time)

        print(json.dumps(event))
        # TODO: replace this print with your real ingestion call, e.g.:
        # requests.post("http://localhost:8000/events", json=event)

        event_id += 1
        sim_time += timedelta(seconds=delay_seconds)
        time.sleep(delay_seconds)

if __name__ == "__main__":
    replay(delay_seconds=1.0, limit=200)  # adjust speed/count for your demo