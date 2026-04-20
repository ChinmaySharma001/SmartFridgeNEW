# yolo

Small project layout for running YOLOv8 inference on grocery images.

Structure
- `models/grocery_yolov8n.pt`         # pretrained model (downloaded)
- `labels.txt`                        # class names; one per line (index = line no)
- `detect_wrapper.py`                 # simple wrapper: load model + predict_one(image)
- `test_inference.py`                 # test script: run folder of images -> results.csv
- `backend_integration_example.py`    # snippet showing how to call wrapper from FastAPI

Quick start
1. Place the real YOLOv8 model at `models/grocery_yolov8n.pt`.
   If you have `ultralytics` installed you can load it directly.

2. (Optional) Create a virtual env and install dependencies:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install ultralytics fastapi uvicorn
```

3. Run inference on a folder of images:

```powershell
python test_inference.py --images path\to\images --output results.csv
```

4. Run FastAPI example server:

```powershell
uvicorn backend_integration_example:app --reload --port 8000
```

Notes
- `models/grocery_yolov8n.pt` in this repo is a placeholder. Download the real `.pt` file
  and replace the placeholder before running inference.
- `detect_wrapper.py` has a graceful fallback: if `ultralytics` is not installed or the model file
  is missing, `predict_one` will return an empty list of detections rather than crashing.

