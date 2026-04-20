smartfridge-dataset
=====================

Workspace layout:

- `synthetic/` — generated synthetic images
  - `imgs/`
  - `labels/` — optional bookkeeping
- `ocr_runs/` — outputs from OCR (JSON / text)
- `notebooks/` — Jupyter notebooks for experiments
- `scripts/` — helper scripts to generate data and run OCR
- `fonts/` — place any .ttf fonts you need (e.g. DejaVuSans, arial.ttf)

Quickstart
---------

1. Create a Python venv and install requirements:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

2. Generate a few synthetic images:

```powershell
python .\scripts\generate_synthetic.py --out synthetic\imgs --count 20
```

3. Run an OCR script (example):

```powershell
python .\scripts\run_paddleocr.py --image synthetic\imgs\synthetic_000.png --out ocr_runs\paddle_output.json
```

Notes
-----
- Put any required `.ttf` files into the `fonts/` directory.
- Update scripts with your cloud credentials where necessary.
