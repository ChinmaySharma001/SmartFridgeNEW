# SmartFridge Frontend

Premium glassmorphism React frontend for the SmartFridge AI application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v11 |
| HTTP | Axios |
| Toasts | react-hot-toast |
| Icons | lucide-react |
| Markdown | react-markdown + remark-gfm |
| Fonts | Syne (display) + DM Sans (body) |

## Quick Start

### Option A — Standalone HTML (zero setup)
Open `index.html` directly in a browser. Demo data is shown automatically when the backend is offline.

### Option B — Vite Dev Server (full setup)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (proxies /api → http://127.0.0.1:8000)
npm run dev

# 3. Build for production
npm run build
```

Rename `index-vite.html` → `index.html` for the Vite version.

## Project Structure

```
Frontend/
|-- index.html          # Standalone browser app and production Vite entry
|-- api.ts              # Central Axios API layer used by the TS React app
|-- App.tsx             # Shell + tab navigation
|-- useInventory.ts     # Inventory state + API logic
|-- expiry.ts           # Date helpers and item icons
|-- ItemCard.tsx        # Fridge item card
|-- ConfirmDialog.tsx   # Delete confirmation modal
|-- InventoryView.tsx   # Dashboard
|-- ScannerView.tsx     # AI scanner
|-- ChefView.tsx        # Recipe chat
```

## Backend API Endpoints

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

## Design System

- **Background**: Deep charcoal `#050810` with glassmorphism panels
- **Accent Mint** `#00e5a0` — fresh items, CTAs, success states
- **Accent Amber** `#f59e0b` — expiring soon (2–5 days)
- **Accent Coral** `#ff4d6d` — expired / critical alerts
- **Accent Blue** `#639dff` — interactive elements, navigation
- **Fonts**: Syne (display/headings) + DM Sans (body)

## Features

- ✅ Inventory grid with animated cards + expiry badges
- ✅ Search + sort (expiry / name / recently added)
- ✅ Optimistic quantity +/- updates
- ✅ Delete with confirmation dialog
- ✅ Drag-and-drop image scanner with live AI scan animation
- ✅ Camera capture on mobile
- ✅ Zero-Waste Chef chat with Gemini AI
- ✅ Recipe suggestions with skeleton loaders
- ✅ Markdown rendering in chat
- ✅ Toast notifications (success / error / info)
- ✅ Demo mode when backend is offline
- ✅ Responsive — mobile bottom tab nav
- ✅ Animated page transitions
