import argparse, json, os
from pathlib import Path

from PIL import Image
import pytesseract
import numpy as np

# set the tesseract exe path (adjust if different)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def sanitize(obj):
    import json as _json
    # numpy arrays / scalars
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, np.generic):
        return obj.item()
    # pathlib.Path
    if isinstance(obj, Path):
        return str(obj)
    # dict / list / tuple -> recurse
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [sanitize(v) for v in obj]
    # bytes -> decode
    if isinstance(obj, bytes):
        try:
            return obj.decode("utf-8")
        except Exception:
            return str(obj)
    # quick JSON-check, otherwise fallback to str()
    try:
        _json.dumps(obj)
        return obj
    except Exception:
        return str(obj)

def run(p_in, p_out, use_paddle=True, use_tesseract=True):
    p_in = Path(p_in)
    p_out = Path(p_out)
    p_out.mkdir(parents=True, exist_ok=True)

    paddle_ocr = None
    if use_paddle:
        try:
            from paddleocr import PaddleOCR
            paddle_ocr = PaddleOCR(use_textline_orientation=False, lang='en')
        except Exception as e:
            print("paddleocr init failed:", e)
            paddle_ocr = None

    for img_path in sorted(p_in.glob("*")):
        if not img_path.is_file():
            continue
        name = img_path.stem
        # skip if already processed
        if (p_out / f"{name}.json").exists():
            print("Skipping (already done):", img_path.name)
            continue
        print("Processing", img_path.name)
        result = {"file": str(img_path), "paddle": None, "tesseract": None}

        if paddle_ocr is not None:
            try:
                res = paddle_ocr.predict(str(img_path))
                # keep minimal readable output
                rec_texts = []
                for page in res:
                    rec_texts.extend(page.get("rec_texts", []))
                result["paddle"] = {"raw": sanitize(res), "texts": rec_texts}
            except Exception as e:
                result["paddle"] = {"error": str(e)}

        if use_tesseract:
            try:
                txt = pytesseract.image_to_string(Image.open(img_path))
                result["tesseract"] = txt
            except Exception as e:
                result["tesseract"] = {"error": str(e)}

        # save JSON + plain text files
        (p_out / f"{name}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        if result.get("paddle") and isinstance(result["paddle"], dict) and result["paddle"].get("texts"):
            (p_out / f"{name}.paddle.txt").write_text("\n".join(result["paddle"]["texts"]), encoding="utf-8")
        if result.get("tesseract") and isinstance(result["tesseract"], str):
            (p_out / f"{name}.tesseract.txt").write_text(result["tesseract"], encoding="utf-8")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", "-i", default="synthetic/imgs")
    ap.add_argument("--out", "-o", default="ocr_runs")
    ap.add_argument("--no-paddle", dest="paddle", action="store_false")
    ap.add_argument("--no-tesseract", dest="tesseract", action="store_false")
    args = ap.parse_args()
    run(args.input, args.out, use_paddle=args.paddle, use_tesseract=args.tesseract)
    