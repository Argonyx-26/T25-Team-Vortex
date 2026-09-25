from camera_detector import detect_loitering

result = detect_loitering("shoplifting_clip.mp4", loiter_threshold_seconds=1.0)
print("Flagged:", result)