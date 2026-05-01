<div align="center">

# 🧊 SmartFridge

**AI-powered smart fridge inventory, scanning, and recipe assistant**

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Gemini](https://img.shields.io/badge/Gemini-Recipes-8E75B2?style=flat&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

<br />

Scan groceries, extract labels with OCR, track expiry, and ask the AI chef for ideas.  
FastAPI powers the API, YOLOv8 + OCR handle scanning, and a premium React UI runs the client.

[Overview](#-overview) · [Getting Started](#-getting-started) · [API Reference](#-api-endpoints) · [Project Structure](#-project-structure)

</div>

---

## 🌟 Overview

SmartFridge helps reduce food waste by combining inventory tracking with AI-assisted scanning and recipes. Upload a label photo or use the camera on mobile, let OCR parse items, and keep everything in a clean dashboard with expiry alerts and quick edits.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🧺 | **Inventory Management** | Track items with expiry alerts, quantity updates, and fast search/sort |
| 📷 | **AI Scanner** | Drag-and-drop or camera capture with OCR-based item detection |
| 🧠 | **Smart OCR** | PaddleOCR + optional Google Vision for robust text extraction |
| 🧪 | **YOLOv8 Detection** | Image-based detection for groceries and labels |
| 👩‍🍳 | **AI Chef** | Gemini-powered recipe suggestions and Q&A |
| 📱 | **Mobile Friendly** | Responsive UI with bottom-tab navigation |
| ⚡ | **Real-Time UI** | Optimistic updates and toast notifications |

---

## 🧭 Architecture At A Glance

```
Frontend (React + Vite)
	|
	v
FastAPI backend  ---> MongoDB
   |     |\
   |     | \__ YOLOv8
   |     \____ OCR (PaddleOCR / Google Vision)
   \__________ Gemini (recipes + Q&A)
```

---

## 🏗️ Tech Stack

<table>
<tr>
<td align="center" width="50%">

**Backend**

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-111111?style=for-the-badge&logo=opensearch&logoColor=white)

</td>
<td align="center" width="50%">

**Frontend**

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</td>
</tr>
<tr>
<td align="center">

**AI / OCR**

![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![PaddleOCR](https://img.shields.io/badge/PaddleOCR-0057B7?style=for-the-badge&logo=paddlepaddle&logoColor=white)
![Google Vision](https://img.shields.io/badge/Google_Vision-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

</td>
<td align="center">

**Infrastructure**

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

| Tool | Notes |
|------|-------|
| Python | For backend local development |
| Node.js | For frontend local development |
| Docker | Optional, recommended for full stack |

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/SmartFridge.git
cd SmartFridge
```

### 2. Configure Environment

Copy the env files and fill in required values:

```bash
# Root env (Gemini + Mongo URI)
cp .env.example .env

# Backend env
cp backend/.env.example backend/.env
```

If using Google Vision OCR, place credentials at:

```text
backend/google-credentials.json
```

### 3. Run (Docker Compose)

```bash
# Frontend + backend + MongoDB
docker compose up --build
```

### 4. Run (Local Dev)

```bash
# Backend
cd backend
python -m venv .venv
. .venv/bin/activate  # or .venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd Frontend
npm install
npm run dev
```

The frontend dev server proxies `/api` to `http://127.0.0.1:8000`.

### 5. Verify

Open the app at `http://localhost:3000` and the API docs at `http://localhost:8000/docs`.

---

## 🔐 Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | Yes | AI recipes and chef Q&A |
| `MONGO_URI` | Yes | MongoDB connection string |
| `GOOGLE_APPLICATION_CREDENTIALS` | No | Google Vision OCR credentials path |
| `DB_NAME` | No | Override Mongo database name |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items/all?sortBy=expiry` | Fetch all fridge items |
| GET | `/api/items/all?sortBy=name` | Fetch items sorted A-Z |
| GET | `/api/items/all?sortBy=createdAt` | Fetch recently added items |
| PATCH | `/api/items/{id}` | Update item quantity |
| DELETE | `/api/items/{id}` | Remove item |
| POST | `/api/ocr/scan` | Scan image (multipart, field: `file`) |
| GET | `/api/recipes/suggest` | Get AI recipe suggestions |
| POST | `/api/recipes/ask` | Ask chef a question `{ question: string }` |

---

## 📂 Project Structure

```
SmartFridge/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   ├── llm/
│   │   ├── ml/
│   │   ├── ocr/
│   │   ├── routes/
│   │   └── utils/
│   ├── static/uploads/
│   ├── temp_uploads/
│   ├── requirements.txt
│   └── Dockerfile
├── Frontend/
│   ├── App.tsx
│   ├── ScannerView.tsx
│   ├── InventoryView.tsx
│   ├── ChefView.tsx
│   ├── index.css
│   ├── index.html
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── smartfridge-dataset/
```

---

## 🐳 Docker

```bash
docker compose up --build
docker compose down
docker compose down -v
```

---

## 🧰 Notes

- Uploads are stored in `backend/static/uploads`. Avoid committing these.
- Model weights (YOLO `.pt`) are not tracked in Git. Add them locally or mount into Docker.
- For OCR fallback, set `GOOGLE_APPLICATION_CREDENTIALS` to a valid JSON file path.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and setup notes.

---

<div align="center">

**Built to reduce food waste and simplify kitchen life**

[Report a Bug](../../issues/new) · [Request a Feature](../../issues/new)

</div>
