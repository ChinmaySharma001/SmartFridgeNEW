from PIL import Image
import sys, subprocess, os

ocr = None

try:
    import cv2, numpy as np, pandas as pd, pytesseract
    print("cv2", cv2.__version__, "numpy", np.__version__, "pandas", pd.__version__)
except Exception as e:
    print("import error (cv2/numpy/pandas/pytesseract):", e)

paddle_ok = False
try:
    import paddle
    print("paddle", paddle.__version__)
    paddle_ok = True
except Exception as e:
    print("import error (paddle):", e)

try:
    from paddleocr import PaddleOCR
    if paddle_ok:
        # use predict (no 'cls' kw in newer versions)
        ocr = PaddleOCR(use_textline_orientation=False, lang='en')
        print("paddleocr OK")
    else:
        print("paddleocr installed but paddle not available; skip init")
except Exception as e:
    print("import error (paddleocr):", e)

try:
    out = subprocess.run(["tesseract", "--version"], capture_output=True, text=True, check=True)
    print("tesseract:", out.stdout.splitlines()[0])
except Exception as e:
    print("tesseract not found or error:", e)

import pytesseract
# use the real installed path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if len(sys.argv) > 1:
    img_path = sys.argv[1]
    if not os.path.exists(img_path):
        print("image not found:", img_path)
    else:
        try:
            if ocr is None:
                print("Skipping paddleocr run because ocr is not initialized.")
            else:
                print("Running paddleocr on", img_path)
                res = ocr.predict(img_path)
                print("OCR result (first entry):", res[:1])
        except Exception as e:
            print("OCR run error:", e)