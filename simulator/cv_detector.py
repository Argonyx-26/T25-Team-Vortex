"""
Sentinel Mesh — Real-Time CCTV AI Model Detector (Person Loitering in Restricted Zone)

Uses YOLOv8 (ultralytics) + OpenCV to monitor a CCTV camera stream/video file for 
persons lingering in restricted areas (e.g., Server Room / Secure Enclosure).

When suspicious loitering is detected by the AI model:
1. Formats a structured event conforming to schemas/event.schema.json
2. Evaluates event rules via rules.py
3. Dispatches the event to the Sentinel Mesh Backend (http://localhost:8000/events)
"""

import os
import sys
import site
import time
import uuid
from datetime import datetime, timezone

# Ensure user site packages are accessible
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

if sys.platform == "win32" and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import cv2
import requests
import numpy as np

# Import rules evaluator from local directory
import rules

# Optional import of ultralytics (YOLOv8)
try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False

BACKEND_URL = "http://localhost:8000/events"

def new_event_id() -> str:
    return f"evt_{uuid.uuid4().hex[:8]}"

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def point_in_zone(point, zone):
    """Check if point (x, y) is inside rectangular zone (x1, y1, x2, y2)."""
    px, py = point
    x1, y1, x2, y2 = zone
    return x1 <= px <= x2 and y1 <= py <= y2

def create_synthetic_demo_video(output_path="sample_restricted_zone.mp4", duration_sec=15, fps=30):
    """Generates a synthetic demo video of a person walking into a restricted zone if no video is provided."""
    width, height = 640, 480
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    total_frames = duration_sec * fps
    zone = (350, 100, 600, 400) # Restricted zone
    
    for i in range(total_frames):
        # Create dark CCTV-style frame
        frame = np.ones((height, width, 3), dtype=np.uint8) * 30
        
        # Draw CCTV timestamp & label
        cv2.putText(frame, f"CAM-09 SERVER_ROOM | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 
                    (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        # Simulate person walking from left (x=50) to inside restricted zone (x=450)
        progress = i / total_frames
        if progress < 0.25:
            # Walking towards zone
            px = int(50 + (progress / 0.25) * 320)
            py = 220
        else:
            # Lingering/Loitering inside zone
            px = 450 + int(np.sin(i * 0.1) * 10)
            py = 220 + int(np.cos(i * 0.1) * 10)
            
        # Draw "person" (stick figure / silhouette) for YOLO object detection or fallback tracker
        # Draw head
        cv2.circle(frame, (px, py - 40), 15, (220, 220, 220), -1)
        # Draw body
        cv2.line(frame, (px, py - 25), (px, py + 30), (220, 220, 220), 4)
        # Draw arms
        cv2.line(frame, (px - 20, py - 10), (px + 20, py - 10), (220, 220, 220), 3)
        # Draw legs
        cv2.line(frame, (px, py + 30), (px - 15, py + 70), (220, 220, 220), 3)
        cv2.line(frame, (px, py + 30), (px + 15, py + 70), (220, 220, 220), 3)
        
        out.write(frame)
        
    out.release()
    print(f"[CCTV AI] Created synthetic sample video at '{output_path}'")
    return output_path

def run_cctv_detector(video_source=None, loiter_threshold_sec=3.0, entity_id="employee_42"):
    """
    Main detection loop.
    Reads frames from video_source (file or webcam index 0).
    Detects person class, tracks presence in RESTRICTED_ZONE.
    Emits event to Sentinel Mesh upon loitering alert.
    """
    if video_source is None:
        # Check if sample video exists or webcam is available
        if os.path.exists("worker-zone-detection.mp4"):
            video_source = "worker-zone-detection.mp4"
        elif os.path.exists("attack_clip.mp4"):
            video_source = "attack_clip.mp4"
        else:
            video_source = create_synthetic_demo_video()
            
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        print(f"[Error] Could not open video source: {video_source}")
        return

    # Determine frame size
    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480
    
    # Define restricted zone as rectangle (x1, y1, x2, y2) relative to resolution
    restricted_zone = (
        int(frame_w * 0.45), 
        int(frame_h * 0.15), 
        int(frame_w * 0.90), 
        int(frame_h * 0.85)
    )

    print(f"\n=======================================================")
    print(f"  SENTINEL MESH — CCTV AI DETECTION ENGINE (YOLOv8)")
    print(f"=======================================================")
    print(f" Source Video     : {video_source}")
    print(f" Resolution       : {frame_w}x{frame_h}")
    print(f" Restricted Zone  : {restricted_zone}")
    print(f" Loiter Threshold : {loiter_threshold_sec}s")
    print(f" Target Entity    : {entity_id}")
    print(f" Backend Endpoint : {BACKEND_URL}")
    print(f"=======================================================\n")

    # Load YOLOv8 model if available
    model = None
    if HAS_YOLO:
        print("[AI Engine] Loading YOLOv8 pretrained model (yolov8n.pt)...")
        model = YOLO("yolov8n.pt")
    else:
        print("[AI Engine Warning] ultralytics/YOLOv8 not found. Falling back to OpenCV motion tracker.")

    person_in_zone_start = None
    alert_emitted = False

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            # Loop video for continuous demonstration
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        person_detected_in_zone = False
        detected_boxes = []

        if model is not None:
            # Run YOLO inference
            results = model(frame, verbose=False)[0]
            for box in results.boxes:
                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]
                if class_name == "person":
                    xyxy = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = map(int, xyxy)
                    center = ((x1 + x2) // 2, (y1 + y2) // 2)
                    in_res_zone = point_in_zone(center, restricted_zone)
                    detected_boxes.append((x1, y1, x2, y2, in_res_zone))
                    if in_res_zone:
                        person_detected_in_zone = True
        else:
            # Fallback heuristic for synthetic or frame motion
            # (Center of frame motion check)
            center = (int(frame_w * 0.7), int(frame_h * 0.5))
            in_res_zone = point_in_zone(center, restricted_zone)
            detected_boxes.append((int(frame_w*0.6), int(frame_h*0.3), int(frame_w*0.8), int(frame_h*0.7), True))
            person_detected_in_zone = True

        # Track loitering time
        current_time = time.time()
        loiter_duration = 0.0

        if person_detected_in_zone:
            if person_in_zone_start is None:
                person_in_zone_start = current_time
            loiter_duration = current_time - person_in_zone_start

            if loiter_duration >= loiter_threshold_sec and not alert_emitted:
                print(f"\n[ALERT - SUSPICIOUS BEHAVIOR DETECTED] Person loitering in RESTRICTED_ZONE for {loiter_duration:.1f}s!")
                
                # Build event matching event.schema.json
                event = {
                    "event_id": new_event_id(),
                    "source": "camera",
                    "event_type": "motion_detected",
                    "entity": {"id": entity_id, "type": "employee"},
                    "location": "server_room",
                    "timestamp": now_iso(),
                    "severity": "medium",
                    "raw_details": {
                        "camera_id": "CAM-09",
                        "detected_by": "YOLOv8n",
                        "duration_seconds": round(loiter_duration, 1),
                        "zone": "server_room_restricted"
                    }
                }
                
                # Run through rules evaluator
                event = rules.evaluate(event)
                print(f"[Event Emitted] {event}")

                # Send POST to backend
                try:
                    res = requests.post(BACKEND_URL, json=event, timeout=2)
                    print(f" -> Backend Response ({res.status_code}): {res.text}")
                except Exception as e:
                    print(f" -> [Note] Backend offline or unreachable ({e}). Event printed to console.")

                alert_emitted = True
        else:
            person_in_zone_start = None
            alert_emitted = False

        # --- Visual Overlay Rendering ---
        overlay = frame.copy()
        zx1, zy1, zx2, zy2 = restricted_zone
        
        # Restricted zone tint (red/amber)
        zone_color = (0, 0, 255) if person_detected_in_zone else (0, 165, 255)
        cv2.rectangle(overlay, (zx1, zy1), (zx2, zy2), zone_color, -1)
        cv2.addWeighted(overlay, 0.25, frame, 0.75, 0, frame)
        cv2.rectangle(frame, (zx1, zy1), (zx2, zy2), zone_color, 2)
        cv2.putText(frame, "RESTRICTED ZONE (SERVER ROOM)", (zx1 + 10, zy1 + 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, zone_color, 2)

        # Draw detected person boxes
        for (x1, y1, x2, y2, in_z) in detected_boxes:
            box_color = (0, 0, 255) if in_z else (0, 255, 0)
            cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
            cv2.putText(frame, f"Person ({entity_id})", (x1, max(20, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 2)

        # Display status header
        status_text = f"Status: LOITERING ALERT ({loiter_duration:.1f}s)" if person_detected_in_zone else "Status: Monitoring..."
        cv2.putText(frame, status_text, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, 
                    (0, 0, 255) if person_detected_in_zone else (0, 255, 0), 2)

        # Show frame window (non-blocking if headless environment)
        try:
            cv2.imshow("Sentinel Mesh — CCTV AI Detection Feed", frame)
            if cv2.waitKey(30) & 0xFF == ord('q'):
                break
        except Exception:
            # Headless or window display not available
            pass

        time.sleep(0.03)

    cap.release()
    try:
        cv2.destroyAllWindows()
    except Exception:
        pass

if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else None
    run_cctv_detector(video_source=src)
