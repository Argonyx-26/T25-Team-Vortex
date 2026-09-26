import os
import sys
import threading
import time
from cv_detector import run_cctv_detector
from replay_events import replay

script_dir = os.path.dirname(os.path.abspath(__file__))
video_file = os.path.join(script_dir, "shoplifting_clip.mp4")

def run_camera_stream():
    """Waits for initial network probing to simulate multi-stage attack, then runs CCTV AI detection."""
    print("\n[SIMULATION STAGE 2] Camera stream will initiate in 5 seconds...")
    time.sleep(5)
    print(f"\n[SIMULATION STAGE 2 ACTIVATED] Launching CCTV Optical Loitering Detection on {os.path.basename(video_file)}...")
    run_cctv_detector(video_source=video_file, loiter_threshold_sec=1.0, entity_id="employee_42")

def run_network_stream():
    """Streams NSL-KDD network packets to Sentinel Mesh backend on port 5000."""
    print("\n[SIMULATION STAGE 1 ACTIVATED] Replaying NSL-KDD network packet stream...")
    replay(delay_seconds=0.6, limit=30)

if __name__ == "__main__":
    print("=" * 65)
    print("  SENTINEL MESH - MULTI-VECTOR COMBINED ATTACK SIMULATION")
    print("  Vector 1: NSL-KDD Network Stream (Brute Force / Scan)")
    print("  Vector 2: CCTV Optical YOLOv8 Detector (Restricted Vault Entry)")
    print(f"  Target Entity: employee_42")
    print("=" * 65)

    t1 = threading.Thread(target=run_network_stream)
    t2 = threading.Thread(target=run_camera_stream, daemon=True)

    t1.start()
    t2.start()

    t1.join()
    print("\n[SIMULATION COMPLETE] Network vector finished. Camera detection daemon active.")
