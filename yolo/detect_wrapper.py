# detect_wrapper.py
"""
Standalone YOLO detection wrapper for the yolo/ module.
Used by test_inference.py and backend_integration_example.py.
"""
from ultralytics import YOLO
import cv2
import numpy as np
from typing import Dict

# Confidence threshold for keeping predictions
CONF_THRESH = 0.35
IOU_THRESH = 0.45
IMG_SIZE = 640  # inference size (square)

# Load model once
_model = None


def load_model():
    global _model
    if _model is None:
        # Use the standard YOLOv8n model (auto-downloads if missing)
        _model = YOLO("yolov8n.pt")
    return _model


def _preprocess_image(img_path: str):
    """Read an image from disk, handling unicode paths on Windows."""
    img = cv2.imdecode(np.fromfile(img_path, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(f"Cannot read image: {img_path}")
    return img


def predict_one(img_path: str, conf_thresh: float = CONF_THRESH) -> Dict:
    """
    Run YOLO on a single image.

    Returns:
      {
        "predictions": [
          {"class_id": int, "label": "milk", "confidence": 0.92, "bbox": [x1,y1,x2,y2]}
          ...
        ],
        "best": {"label":..., "confidence":..., "bbox":...} or None
      }
    """
    model = load_model()
    img = _preprocess_image(img_path)

    res = model.predict(
        source=img,
        imgsz=IMG_SIZE,
        conf=conf_thresh,
        iou=IOU_THRESH,
        device="cpu",
        verbose=False,
    )

    r = res[0]
    predictions = []
    best = None

    if r.boxes is not None and len(r.boxes) > 0:
        # Get class names from the model itself
        names = model.names  # dict: {0: "person", 1: "bicycle", ...}

        for box in r.boxes:
            conf = float(box.conf.cpu().numpy())
            cls = int(box.cls.cpu().numpy())
            x1, y1, x2, y2 = map(float, box.xyxy.cpu().numpy()[0])
            label = names.get(cls, str(cls))

            pred = {
                "class_id": cls,
                "label": label,
                "confidence": round(conf, 4),
                "bbox": [x1, y1, x2, y2],
            }
            predictions.append(pred)

        # choose highest confidence as best
        best = max(predictions, key=lambda x: x["confidence"])

    return {"predictions": predictions, "best": best}
