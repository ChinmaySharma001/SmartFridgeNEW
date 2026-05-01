# SmartFridge

Central repo for the SmartFridge AI project (backend + frontend + datasets).

This repository provides a FastAPI backend with YOLOv8/PaddleOCR/Google Vision integration and a React + Vite frontend for scanning and inventory management.

Quick links:
- Frontend: `Frontend/README.md`
- Backend: `backend/README.md`

Getting started (Docker Compose — recommended):

```bash
# build and run services (from repo root)
docker compose up --build
```

Local development (backend):

```bash
# from backend/
python -m venv .venv
. .venv/bin/activate  # or .venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Local development (frontend):

```bash
cd Frontend
npm install
npm run dev
```

Environment variables:
- See `.env.example` at repo root and `backend/.env.example` for required keys (e.g. `GEMINI_API_KEY`).

Repository hygiene notes:
- `node_modules/`, `dist/`, `backend/static/uploads/` and other large or generated files are ignored via `.gitignore`.
- Do not commit large model weights (`*.pt`) unless necessary — use external storage and update paths.

If you want, I can open a PR with these cleanup changes and a checklist for further polishing (CI, CONTRIBUTING, license).
