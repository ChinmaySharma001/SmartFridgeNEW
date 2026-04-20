# scripts/test_paddle_single.py
from paddleocr import PaddleOCR
from PIL import Image, ImageOps
from pathlib import Path
import io

ocr = PaddleOCR(use_textline_orientation=True, lang='en')

path = Path("/mnt/data/c8017d77-ba9d-4f35-949c-71a371a41b6a.png")
img = Image.open(path).convert("RGB")
img = ImageOps.autocontrast(img, cutoff=1)
tmp = "tmp_test.jpg"
img.save(tmp, quality=90)

print("Using PaddleOCR (legacy .ocr):")
try:
    r = ocr.ocr(tmp)
    for block in r:
        if len(block) >= 2:
            print(block[1][0])
except Exception as e:
    print("Paddle legacy failed:", e)

try:
    print("\nTrying predict():")
    r2 = ocr.predict(tmp)
    for block in r2:
        if len(block) >= 2:
            print(block[1][0] if isinstance(block[1], (list, tuple)) else block[1])
except Exception as e:
    print("predict() failed:", e)
