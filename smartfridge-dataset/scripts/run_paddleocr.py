# scripts/run_paddleocr.py
import os
import json
from pathlib import Path
from paddleocr import PaddleOCR
import cv2

INPUT_DIR = Path("synthetic/imgs")
OUTPUT_DIR = Path("ocr_runs/paddle")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Initialize PaddleOCR (no extra flags to maximize compatibility)
ocr = PaddleOCR(lang="en")

def parse_paddle_result(res):
    """
    Accept either legacy `ocr.ocr(image_path)` output or newer `.predict()` output.
    Return (text, confidences_list)
    """
    lines = []
    confs = []

    if not res:
        return "", []

    # Two common shapes:
    # 1) legacy: [ [bbox, (text, score)], ... ]
    # 2) newer: [ [ [ (text, score), ... ] ], ... ] or predict: [((xy...), (text, score)), ...]
    try:
        # Try to handle nested shapes: iterate recursively
        for block in res:
            # block can be tuple/list of lines
            if isinstance(block, (list, tuple)) and len(block) > 0:
                # block may be like [ [bbox, (text, score)], ... ] or like [ [(text,score), ...] ]
                first = block[0]
                if isinstance(first, (list, tuple)) and len(first) >= 2 and isinstance(first[1], (list, tuple)):
                    # Likely legacy: [ [bbox, (text, score)], ... ]
                    for item in block:
                        try:
                            txt = item[1][0]
                            sc = float(item[1][1])
                        except Exception:
                            # sometimes different nesting
                            try:
                                txt = item[1]
                                sc = None
                            except Exception:
                                continue
                        lines.append(txt)
                        if sc is not None:
                            confs.append(sc)
                else:
                    # other shape: each element may be (text, score)
                    for item in block:
                        try:
                            if isinstance(item, (list, tuple)) and len(item) >= 2:
                                txt = item[1][0] if isinstance(item[1], (list, tuple)) else item[1]
                                sc = item[1][1] if isinstance(item[1], (list, tuple)) and len(item[1]) > 1 else None
                            else:
                                # fallback if item is string-like
                                txt = str(item)
                                sc = None
                        except Exception:
                            continue
                        lines.append(txt)
                        if sc is not None:
                            try:
                                confs.append(float(sc))
                            except Exception:
                                pass
            else:
                # fallback: block is a single (text, score)
                try:
                    txt = block[1][0] if isinstance(block[1], (list, tuple)) else block[1]
                    sc = block[1][1] if isinstance(block[1], (list, tuple)) and len(block[1]) > 1 else None
                    lines.append(txt)
                    if sc is not None:
                        confs.append(float(sc))
                except Exception:
                    continue
    except Exception:
        # last resort attempt: flatten text entries
        try:
            for b in res:
                for e in b:
                    if isinstance(e, (list, tuple)) and len(e) > 1:
                        txt = e[1][0] if isinstance(e[1], (list, tuple)) else e[1]
                        try:
                            sc = float(e[1][1])
                        except Exception:
                            sc = None
                        lines.append(txt)
                        if sc is not None:
                            confs.append(sc)
        except Exception:
            pass

    combined = "\n".join([l for l in lines if l]).strip()
    return combined, confs

def run_one(path: Path):
    name = path.name
    out = {"file": name, "text": "", "avg_conf": None, "max_conf": None}
    try:
        # reading with cv2 to pass into both legacy and predict API safely
        img = cv2.imread(str(path))
        if img is None:
            raise RuntimeError("cv2.imread returned None")

        # Try new API first (predict); fall back to ocr()
        res = None
        try:
            res = ocr.predict(img)
        except Exception:
            try:
                res = ocr.ocr(img)
            except Exception as e2:
                raise e2

        text, confs = parse_paddle_result(res)
        out["text"] = text
        if confs:
            out["avg_conf"] = sum(confs) / len(confs)
            out["max_conf"] = max(confs)
    except Exception as e:
        out["text"] = ""
        out["error"] = str(e)

    json_path = OUTPUT_DIR / (name + ".json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    return out

def run_all():
    images = sorted([p for p in INPUT_DIR.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png")])
    summary = {}
    for p in images:
        print("PaddleOCR:", p.name)
        res = run_one(p)
        summary[p.name] = {"text": res["text"], "avg_conf": res["avg_conf"], "max_conf": res["max_conf"]}
    with open(OUTPUT_DIR / "summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print("PaddleOCR finished. Outputs in", OUTPUT_DIR)

if __name__ == "__main__":
    run_all()
