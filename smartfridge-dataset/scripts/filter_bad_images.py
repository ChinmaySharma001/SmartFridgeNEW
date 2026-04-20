# scripts/filter_bad_images.py
import json
from pathlib import Path
import cv2
import numpy as np
import shutil

MERGED_FILE = Path("ocr_runs/merged_results.json")
IMG_DIR = Path("synthetic/imgs")
GOOD_DIR = Path("filtered/good_imgs")
BAD_DIR = Path("filtered/bad_imgs")

GOOD_DIR.mkdir(parents=True, exist_ok=True)
BAD_DIR.mkdir(parents=True, exist_ok=True)

# ---------- Helper functions ----------

def is_blurry(img, threshold=80):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    return fm < threshold, fm

def brightness_score(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    return hsv[...,2].mean()   # value channel

def is_too_dark(val):
    return val < 35

def is_too_bright(val):
    return val > 245

def conf_score(val):
    if val is None:
        return 0.0
    try:
        return float(val)
    except:
        return 0.0


# ---------- MAIN FILTERING LOGIC ----------

def main():
    data = json.load(open(MERGED_FILE, "r", encoding="utf-8"))

    good_list = []
    bad_list = []

    for item in data:
        fname = item["file"].replace(".google.txt", "")
        img_path = IMG_DIR / fname

        if not img_path.exists():
            item["filter_reason"] = "image_missing"
            bad_list.append(item)
            continue

        img = cv2.imread(str(img_path))
        if img is None:
            item["filter_reason"] = "cv2_failed"
            bad_list.append(item)
            continue

        # OCR text checks
        google_text = item["google_text"].strip()
        paddle_text = item["paddle_text"].strip()

        both_empty = (google_text == "" and paddle_text == "")

        # Confidence checks
        google_conf = conf_score(item["google_avg_conf"])
        paddle_conf = conf_score(item["paddle_avg_conf"])

        low_conf_both = google_conf < 0.25 and paddle_conf < 0.25

        # Blur check
        blur_flag, blur_val = is_blurry(img)

        # Brightness check
        bright_val = brightness_score(img)
        too_dark = is_too_dark(bright_val)
        too_bright = is_too_bright(bright_val)

        # Decide
        if both_empty:
            item["filter_reason"] = "no_text"
            bad_list.append(item)
            shutil.copy(img_path, BAD_DIR / img_path.name)
            continue

        if low_conf_both:
            item["filter_reason"] = "low_confidence"
            bad_list.append(item)
            shutil.copy(img_path, BAD_DIR / img_path.name)
            continue

        if blur_flag:
            item["filter_reason"] = f"blurry ({blur_val:.1f})"
            bad_list.append(item)
            shutil.copy(img_path, BAD_DIR / img_path.name)
            continue

        if too_dark or too_bright:
            reason = "too_dark" if too_dark else "too_bright"
            item["filter_reason"] = reason
            bad_list.append(item)
            shutil.copy(img_path, BAD_DIR / img_path.name)
            continue

        # If none of the bad conditions matched:
        item["filter_reason"] = "good"
        good_list.append(item)
        shutil.copy(img_path, GOOD_DIR / img_path.name)

    # Save results
    json.dump(good_list, open("filtered/good_images.json","w",encoding="utf-8"), indent=2)
    json.dump(bad_list, open("filtered/bad_images.json","w",encoding="utf-8"), indent=2)

    print("Filtering done:")
    print("Good images:", len(good_list))
    print("Bad images:", len(bad_list))
    print("Check filtered/ folders.")
    

if __name__ == "__main__":
    main()
