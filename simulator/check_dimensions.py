import cv2 
import os 
path = "shoplifting_clip.mp4" 
print("File exists:", os.path.exists(path)) 
cap = cv2.VideoCapture(path) 
print("Opened successfully:", cap.isOpened()) 
print(cap.get(cv2.CAP_PROP_FRAME_WIDTH), cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) 
