"""
Sentinel Mesh — Real Camera Stream Detector Runner
Applies YOLOv8 loitering detection on target video clip (default: shoplifting_clip.mp4).
"""

import sys
import uuid
from datetime import datetime, timezone
from camera_detector import detect_loitering
import rules


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def main():
    video_source = sys.argv[1] if len(sys.argv) > 1 else "shoplifting_clip.mp4"
    print(f"[CCTV AI] Running loitering detection on video source: '{video_source}'...")

    flagged = detect_loitering(video_source, loiter_threshold_seconds=1.0)

    if flagged:
        event = {
            "event_id": f"evt_{uuid.uuid4().hex[:8]}",
            "source": "camera",
            "event_type": "motion_detected",
            "entity": {"id": "employee_42", "type": "employee"},
            "location": "server_room",
            "timestamp": now_iso(),
            "severity": "medium",
            "raw_details": {
                "camera_id": "CAM-09",
                "detected_by": "YOLOv8n",
                "source_dataset": "UCF-Crime",
            },
        }
        evaluated_event = rules.evaluate(event)
        print("\n[SECURITY BREACH DETECTED]")
        print(evaluated_event)
    else:
        print("\n[SAFE] No breach detected")


if __name__ == "__main__":
    main()
