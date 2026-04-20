# scripts/run_google_vision.py
import os
import io
import json
from pathlib import Path
from google.cloud import vision

INPUT_DIR = Path("synthetic/imgs")
OUTPUT_DIR = Path("ocr_runs/google")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

client = vision.ImageAnnotatorClient()

def extract_confidences_from_response(resp):
    """Try to gather numeric confidences from document_text_detection response.
    If not present, return empty list."""
    confs = []
    try:
        pages = resp.full_text_annotation.pages
        for page in pages:
            for block in page.blocks:
                for para in block.paragraphs:
                    for word in para.words:
                        # word symbols often have confidence; word may have confidence attribute too
                        try:
                            if hasattr(word, "confidence"):
                                confs.append(float(word.confidence))
                            else:
                                # collect symbols confidence if present
                                for sym in word.symbols:
                                    if hasattr(sym, "confidence"):
                                        confs.append(float(sym.confidence))
                        except Exception:
                            continue
    except Exception:
        pass
    return confs

def run_one(path: Path):
    name = path.name
    out = {"file": name, "text": "", "avg_conf": None, "max_conf": None}
    try:
        with io.open(path, 'rb') as image_file:
            content = image_file.read()
        image = vision.Image(content=content)

        # Use document_text_detection for word-level confidences when available
        resp = client.document_text_detection(image=image)

        # full text
        full_text = ""
        try:
            full_text = resp.full_text_annotation.text or ""
        except Exception:
            # fallback to text_annotations if full_text_annotation missing
            if resp.text_annotations:
                full_text = resp.text_annotations[0].description
        out["text"] = full_text.strip()

        # try to extract confidences (word/symbol level) if present
        confs = extract_confidences_from_response(resp)
        if confs:
            out["avg_conf"] = sum(confs) / len(confs)
            out["max_conf"] = max(confs)
        else:
            # if no granular confidences, try response text_annotations score field (rare)
            try:
                scores = []
                for ta in getattr(resp, "text_annotations", []):
                    if hasattr(ta, "confidence"):
                        scores.append(float(ta.confidence))
                if scores:
                    out["avg_conf"] = sum(scores) / len(scores)
                    out["max_conf"] = max(scores)
            except Exception:
                pass

    except Exception as e:
        out["text"] = ""
        out["error"] = str(e)

    # save JSON per image
    json_path = OUTPUT_DIR / (name + ".json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    return out

def run_all():
    images = sorted([p for p in INPUT_DIR.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png")])
    summary = {}
    for p in images:
        print("GoogleOCR:", p.name)
        res = run_one(p)
        summary[p.name] = {"text": res["text"], "avg_conf": res["avg_conf"], "max_conf": res["max_conf"]}
    with open(OUTPUT_DIR / "summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print("Google Vision OCR finished. Outputs in", OUTPUT_DIR)

if __name__ == "__main__":
    run_all()
