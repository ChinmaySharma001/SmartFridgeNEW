# test_inference.py
import os
import csv
from detect_wrapper import predict_one

IMG_DIR = "test_images"
OUT_CSV = "results.csv"

def run_all():
    rows = []
    for fname in os.listdir(IMG_DIR):
        if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        path = os.path.join(IMG_DIR, fname)
        res = predict_one(path)
        best = res.get("best")
        if best:
            rows.append([fname, best["label"], best["confidence"]])
        else:
            rows.append([fname, "", 0.0])
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["filename", "predicted_label", "confidence"])
        writer.writerows(rows)
    print("Wrote", OUT_CSV)

if __name__ == "__main__":
    run_all()
