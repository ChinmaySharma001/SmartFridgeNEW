# detect_wrapper.py
from ultralytics import YOLO
import cv2
import numpy as np
from typing import List, Dict

MODEL_PATH = "models/grocery_yolov8n.pt"
# Confidence threshold for keeping predictions
CONF_THRESH = 0.35
IOU_THRESH = 0.45
IMG_SIZE = 640  # inference size (square). 640 is default; keep for accuracy.

# Load model once
_model = None
_names = None

def load_model():
    global _model
    if _model is None:
        _model = YOLO("yolov8n.pt")  # Downloads automatically on first run
    return _model

def _preprocess_image(img_path: str):
    # read with OpenCV (BGR)
    img = cv2.imdecode(np.fromfile(img_path, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(img_path)
    return img

def predict_one(img_path: str, conf_thresh: float = CONF_THRESH) -> Dict:
    """
    Returns:
      {
        "predictions": [
          {"class_id": int, "label": "milk", "confidence": 0.92, "bbox": [x1,y1,x2,y2]}
          ...
        ],
        "best": {"label":..., "confidence":..., "bbox":...} or None
      }
    """
    load_model()
    img = _preprocess_image(img_path)
    # model.predict returns Results objects
    res = _model.predict(source=img, imgsz=IMG_SIZE, conf=conf_thresh, iou=IOU_THRESH, device='cpu', verbose=False)
    # ultralytics returns a list; take first
    r = res[0]
    predictions = []
    best = None
    if r.boxes is not None and len(r.boxes) > 0:
        for box in r.boxes:
            conf = float(box.conf.cpu().numpy())
            cls = int(box.cls.cpu().numpy())
            x1, y1, x2, y2 = map(float, box.xyxy.cpu().numpy()[0])
            label = _names[cls] if _names and cls < len(_names) else str(cls)
            pred = {
                "class_id": cls,
                "label": label,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            }
            predictions.append(pred)
        # choose highest confidence as best
        best = max(predictions, key=lambda x: x["confidence"])
    return {"predictions": predictions, "best": best}
