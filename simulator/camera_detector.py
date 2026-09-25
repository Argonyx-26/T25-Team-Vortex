"""
Sentinel Mesh - Real CV detection for the camera stream (one flagship scenario)
"""
import cv2
from ultralytics import YOLO
import time

model = YOLO("yolov8n.pt")

RESTRICTED_ZONE = (160, 70, 320, 240)

def in_zone(box, zone):
    x1, y1, x2, y2 = box
    zx1, zy1, zx2, zy2 = zone
    center_x, center_y = (x1 + x2) / 2, (y1 + y2) / 2
    return zx1 <= center_x <= zx2 and zy1 <= center_y <= zy2

def detect_loitering(video_path, loiter_threshold_seconds=3.0):
    cap = cv2.VideoCapture(video_path)
    person_in_zone_since = None

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame, verbose=False)[0]
        person_detected_in_zone = False

        for box in results.boxes:
            cls_id = int(box.cls[0])
            if model.names[cls_id] == "person" and in_zone(box.xyxy[0].tolist(), RESTRICTED_ZONE):
                person_detected_in_zone = True

        if not person_detected_in_zone:
            person_in_zone_since = None
            continue

        if person_in_zone_since is None:
            person_in_zone_since = time.time()
            continue

        elapsed = time.time() - person_in_zone_since
        if elapsed >= loiter_threshold_seconds:
            cap.release()
            return True

    cap.release()
    return False
