import re
import dateparser
from datetime import datetime, timedelta

# --------------------------------------------------------
# 1. ALL OLD PATTERNS + NEW EXTRA PATTERNS MERGED TOGETHER
# --------------------------------------------------------
PATTERNS = [
    # EXP
    r'(EXP[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
    r'(EXP\s+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
    r'(EXP\s+\d{1,2}[\/\-]\d{4})',

    # Expires On
    r'(Expires On[:\s]*\d{1,2}\s+[A-Za-z]{3,}\s+\d{4})',
    r'(Expires On[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',

    # Use Before
    r'(Use Before[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',
    r'(Use Before[:\s]*\d{1,2}\s+[A-Za-z]{3,}\s+\d{4})',

    # Best Before (old)
    r'(Best Before[:\s]*\d{1,2}[\/\-]\d{4})',
    r'(Best Before[:\s]*[A-Za-z]{3,}\s+\d{4})',
    r'(Best Before[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',

    # Duration-based (old)
    r'(Use within\s+(\d+)\s+days)',
    r'(Best before\s+(\d+)\s+months)',

    # Manufacturing
    r'(MFG[:\s]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})',

    # -------------------------------------------------------
    # NEW EXTRA PATTERNS (merged)
    # -------------------------------------------------------
    r'(Good for\s+(\d+)\s+months)',
    r'(Good for\s+(\d+)\s+years?)',
    r'(Shelf life[:\s]*(\d+)\s+months?)',
    r'(Use within\s+(\d+)\s+months)',
    r'(Use within\s+(\d+)\s+years?)',
]


# --------------------------------------------------------
# 2. Extract the matched phrase from text
# --------------------------------------------------------
def extract_date_phrase(text):
    text = text or ""
    for pattern in PATTERNS:
        m = re.search(pattern, text, flags=re.IGNORECASE)
        if m:
            return m.group(0)
    return None


# --------------------------------------------------------
# 3. Parse an explicit date from inside a phrase
# --------------------------------------------------------
def parse_explicit_date(date_str):
    """Handles natural dates like:
    - 23 Nov 2024
    - 15-11-2027
    - 8/1/2026
    - 9/2026 (MM/YYYY)
    """
    if not date_str:
        return None

    # Word month
    m = re.search(r'\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}', date_str)
    if m:
        return dateparser.parse(m.group(0), settings={'DATE_ORDER': 'DMY'})

    # dd/mm/yyyy
    m = re.search(r'\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}', date_str)
    if m:
        return dateparser.parse(m.group(0), settings={'DATE_ORDER': 'DMY'})

    # mm/yyyy → assume day = 1
    m = re.search(r'(\d{1,2})[\/\-](\d{4})', date_str)
    if m:
        mm, yyyy = m.groups()
        return datetime(int(yyyy), int(mm), 1)

    return None


# --------------------------------------------------------
# 4. Duration parser (days, months, years)
# --------------------------------------------------------
def parse_duration(text, mfg_date=None):
    raw = text.lower()

    # --- days ---
    m = re.search(r'(\d+)\s+days', raw)
    if m:
        days = int(m.group(1))
        base = mfg_date or datetime.now()
        return base + timedelta(days=days)

    # --- months ---
    m = re.search(r'(\d+)\s+months?', raw)
    if m:
        months = int(m.group(1))
        base = mfg_date or datetime.now()
        return base + timedelta(days=30 * months)

    # --- years ---
    m = re.search(r'(\d+)\s+years?', raw)
    if m:
        years = int(m.group(1))
        base = mfg_date or datetime.now()
        return base + timedelta(days=365 * years)

    return None


# --------------------------------------------------------
# 5. Normalize any phrase → date
# --------------------------------------------------------
def normalize_date(raw_phrase, full_text=None):
    if not raw_phrase:
        return None, None, None

    raw = raw_phrase.lower()
    full_text = full_text or ""

    # ---------------------------
    # Manufacturing date detection
    # ---------------------------
    if raw.startswith("mfg"):
        dm = re.findall(r'\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}', raw)
        if dm:
            mfg_date = dateparser.parse(dm[0], settings={'DATE_ORDER': 'DMY'})
        else:
            mfg_date = None

        # Look for "Best before X months" or similar IN FULL TEXT
        duration_date = parse_duration(full_text, mfg_date)
        if duration_date:
            return duration_date, "duration_from_mfg", raw_phrase

        return mfg_date, "manufacturing_only", raw_phrase

    # --------------------------------------
    # Pure duration cases (use within X days)
    # --------------------------------------
    direct_duration = parse_duration(raw_phrase)
    if direct_duration:
        return direct_duration, "duration", raw_phrase

    # ------------------------
    # Explicit calendar date
    # ------------------------
    dt = parse_explicit_date(raw_phrase)
    if dt:
        return dt, "explicit_date", raw_phrase

    return None, None, raw_phrase


# --------------------------------------------------------
# 6. Main public function
# --------------------------------------------------------
def extract_and_normalize(text):
    phrase = extract_date_phrase(text)
    final_date, source, matched = normalize_date(phrase, text)

    # Compute days left
    if final_date:
        days_left = (final_date - datetime.now()).days
    else:
        days_left = None

    return {
        "matched_phrase": matched,
        "final_date": final_date,
        "days_left": days_left,
        "source": source
    }
