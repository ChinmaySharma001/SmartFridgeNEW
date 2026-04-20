import os, json
from scripts.parse_dates import extract_and_normalize

OCR_DIR = "ocr_runs/google"
OUT_FILE = "ocr_runs/eval_results.json"

results = []

for filename in os.listdir(OCR_DIR):
    if not filename.endswith(".txt"):
        continue

    path = os.path.join(OCR_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    phrase, dt = extract_and_normalize(text)

    results.append({
        "file": filename,
        "ocr_text": text.strip(),
        "matched_phrase": phrase,
        "parsed_date": str(dt)
    })

with open(OUT_FILE, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Evaluation stored in:", OUT_FILE)
