import threading
import time
from cv_detector import run_cctv_detector
from replay_events import replay

def run_camera_stream():
    time.sleep(15)  # let the network anomaly land first
    run_cctv_detector(video_source="shoplifting_clip.mp4", loiter_threshold_sec=1.0, entity_id="employee_42")

def run_network_stream():
    replay(delay_seconds=1.0, limit=50)

t1 = threading.Thread(target=run_network_stream)
t2 = threading.Thread(target=run_camera_stream, daemon=True)
t1.start()
t2.start()
t1.join()
