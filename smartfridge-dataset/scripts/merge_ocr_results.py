# scripts/merge_ocr_results.py
import os
import json
from pathlib import Path
from scripts.parse_dates import extract_and_normalize

GOOGLE_DIR = Path("ocr_runs/google")
PADDLE_DIR = Path("ocr_runs/paddle")
OUTPUT_FILE = Path("ocr_runs/merged_results.json")

def load_json(folder: Path, image_name: str):
    p = folder / (image_name + ".json")
    if not p.exists():
        return {"text": "", "avg_conf": None, "max_conf": None}
    try:
        return json.load(open(p, "r", encoding="utf-8"))
    except Exception:
        return {"text": "", "avg_conf": None, "max_conf": None}

def conf_score(val):
    if val is None:
        return -1.0
    try:
        return float(val)
    except Exception:
        return -1.0

def choose_best(g, p):
    """Return tuple (chosen_source, reason, final_conf)"""
    g_conf = conf_score(g.get("avg_conf"))
    p_conf = conf_score(p.get("avg_conf"))
    g_text = (g.get("text") or "").strip()
    p_text = (p.get("text") or "").strip()

    # Cases
    if g_text and not p_text:
        return "google", "paddle empty; chosen google", g_conf
    if p_text and not g_text:
        return "paddle", "google empty; chosen paddle", p_conf

    # both empty
    if not g_text and not p_text:
        return "none", "both engines empty", None

    # both non-empty -> compare avg conf
    if g_conf > p_conf:
        return "google", f"google avg_conf {g_conf} > paddle avg_conf {p_conf}", g_conf
    if p_conf > g_conf:
        return "paddle", f"paddle avg_conf {p_conf} > google avg_conf {g_conf}", p_conf

    # tie/conf equal -> fallback to max_conf
    g_max = conf_score(g.get("max_conf"))
    p_max = conf_score(p.get("max_conf"))
    if g_max > p_max:
        return "google", f"avg tie; google max_conf {g_max} > paddle max_conf {p_max}", g_max
    if p_max > g_max:
        return "paddle", f"avg tie; paddle max_conf {p_max} > google max_conf {g_max}", p_max

    # still tie -> choose longer text (heuristic)
    if len(g_text) >= len(p_text):
        return "google", "tie on conf; chosen google by longer text", g_conf
    else:
        return "paddle", "tie on conf; chosen paddle by longer text", p_conf

def main():
    # gather image list from both dirs
    all_files = set()
    for d in (GOOGLE_DIR, PADDLE_DIR):
        if d.exists():
            for p in d.iterdir():
                if p.suffix.lower() == ".json":
                    name = p.name.replace(".json", "")
                    all_files.add(name)

    merged = []
    for name in sorted(all_files):
        g = load_json(GOOGLE_DIR, name)
        p = load_json(PADDLE_DIR, name)

        g_text = (g.get("text") or "").strip()
        p_text = (p.get("text") or "").strip()

        # parse dates for both
        g_phrase, g_date = extract_and_normalize(g_text)
        p_phrase, p_date = extract_and_normalize(p_text)

        chosen_source, reason, final_conf = choose_best(g, p)

        if chosen_source == "google":
            final_phrase = g_phrase
            final_date = g_date
            chosen_text = g_text
        elif chosen_source == "paddle":
            final_phrase = p_phrase
            final_date = p_date
            chosen_text = p_text
        else:
            final_phrase = None
            final_date = None
            chosen_text = ""

        merged.append({
            "file": name,
            "google_text": g_text,
            "google_avg_conf": g.get("avg_conf"),
            "google_max_conf": g.get("max_conf"),
            "paddle_text": p_text,
            "paddle_avg_conf": p.get("avg_conf"),
            "paddle_max_conf": p.get("max_conf"),
            "chosen_source": chosen_source,
            "decision_reason": reason,
            "final_phrase": final_phrase,
            "final_date": str(final_date) if final_date is not None else None,
            "final_conf": final_conf
        })

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    print("Merged results written to", OUTPUT_FILE)

if __name__ == "__main__":
    main()
