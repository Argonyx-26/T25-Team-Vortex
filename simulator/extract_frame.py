import cv2

cap = cv2.VideoCapture("shoplifting_clip.mp4")

total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2)

ret, frame = cap.read()
if ret:
    cv2.imwrite("sample_frame.png", frame)
    print("Saved sample_frame.png")
else:
    print("Could not read frame")

cap.release()
