# backend_integration_example.py
from fastapi import FastAPI, File, UploadFile, Form
import shutil
import os
import uuid
from detect_wrapper import predict_one

app = FastAPI()

UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
CONF_FALLBACK_THRESHOLD = 0.5  # if YOLO best confidence < this, use user label

@app.post("/api/ocr/scan")
async def scan_image(file: UploadFile = File(...), userLabel: str | None = Form(None)):
    # save upload
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    # 1) run YOLO
    yolo_res = predict_one(file_path)
    best = yolo_res.get("best")
    detected_name = None
    detected_conf = 0.0
    if best:
        detected_name = best["label"]
        detected_conf = best["confidence"]
    # 2) decide final item name
    if detected_name and detected_conf >= CONF_FALLBACK_THRESHOLD:
        item_name = detected_name
        ocr_source = "yolo"
    else:
        item_name = userLabel or detected_name or "unknown"
        ocr_source = "user_label" if userLabel else "yolo_low_conf"
    # 3) now call your OCR expiry detector (not shown here) to get expiryDate
    expiryDate = None  # placeholder: call your get_expiry_date(file_path)
    return {
        "itemName": item_name,
        "expiryDate": expiryDate,
        "yolo_confidence": detected_conf,
        "ocrSource": ocr_source
    }
