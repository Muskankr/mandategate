# MandateGate — Project Status & Remaining Work

> **Last updated:** 2026-11-11
> **Branch:** `main`
> **Status:** Feature-complete — all planned modules implemented, tested, and verified

---

## What Is Done (Completed Modules)

### Frontend (Member 1 — Muskan)

| Module | Status | Route / File |
|--------|--------|-------------|
| Landing Page | Done | `app/page.tsx` |
| Dashboard (KPI cards, charts, activity feed) | Done | `app/dashboard/page.tsx` |
| Mandate List & Cards | Done | `app/mandates/page.tsx` |
| Create Mandate Form (with templates) | Done | `app/mandates/new/page.tsx` |
| AI Shopping Interface (chat + product cards) | Done | `app/shopping/page.tsx` |
| Policy Decision Banner (ALLOWED/BLOCKED/APPROVAL) | Done | `components/shopping/DecisionBanner.tsx` |
| Human Approval Center (approve/reject + PayPal) | Done | `app/approvals/page.tsx` |
| Transaction History (AG Grid, CSV export) | Done | `app/transactions/page.tsx` |
| Settings & Governance Page | Done | `app/settings/page.tsx` |
| Navigation (Sidebar, Header, Footer, AppShell) | Done | `components/navigation/` |
| Reusable UI (StatusBadge, MetricCard, Toast, DemoBanner) | Done | `components/ui/` |
| API Client with Demo/Live mode toggle | Done | `lib/api.ts` |
| Demo data seed (mandates, products, approvals, txns) | Done | `lib/demo-data.ts` |
| Responsive design | Done | All pages |
| PayPal return URL auto-capture | Done | `app/transactions/page.tsx` |
| Dynamic header notifications from API | Done | `components/navigation/Header.tsx` |
| `next/image` optimization (ProductCard, ApprovalCard) | Done | `components/shopping/ProductCard.tsx`, `components/approvals/ApprovalCard.tsx` |
| Inter font via `next/font/google` | Done | `app/layout.tsx` |
| Live mode `.env.local` | Done | `.env.local` |
| Vercel deployment config | Done | `vercel.json` |

**Build status:** `npm run build` passes with zero errors, all 9 routes prerendered.

---

### Backend (Member 2 — AI & Backend)

| Module | Status | File |
|--------|--------|------|
| FastAPI app with CORS + lifespan seeding | Done | `main.py` |
| Config from `.env` (Pydantic Settings) | Done | `config.py` |
| SQLAlchemy ORM (Mandate, Product, Approval, Transaction, User) | Done | `models.py` |
| Pydantic schemas (all request/response models) | Done | `schemas.py` |
| SQLite database with auto-seed demo data | Done | `database.py` + `main.py` |
| Auto-expire mandates on startup | Done | `main.py` (lifespan) |
| **GET /api/mandates** — List mandates | Done | `routers/mandates.py` |
| **POST /api/mandates** — Create mandate | Done | `routers/mandates.py` |
| **PUT /api/mandates/{id}** — Update mandate | Done | `routers/mandates.py` |
| **DELETE /api/mandates/{id}** — Soft-delete mandate | Done | `routers/mandates.py` |
| **POST /api/mandates/{id}/revoke** — Revoke mandate | Done | `routers/mandates.py` |
| **POST /api/agent/execute** — Gemini AI shopping agent | Done | `routers/agent.py` |
| **POST /api/policy/evaluate** — Deterministic policy engine | Done | `routers/policy.py` |
| **GET /api/approvals** — List approval requests | Done | `routers/approvals.py` |
| **POST /api/approvals/{id}/approve** — Approve/reject | Done | `routers/approvals.py` |
| **GET /api/transactions** — Audit ledger | Done | `routers/transactions.py` |
| **GET /api/dashboard/metrics** — Dashboard KPIs | Done | `routers/dashboard.py` |
| **POST /api/auth/register** — User registration | Done | `routers/auth.py` |
| **POST /api/auth/login** — JWT login | Done | `routers/auth.py` |
| **GET /api/auth/me** — Current user info | Done | `routers/auth.py` |
| Gemini AI service (with fallback catalog) | Done | `services/gemini_service.py` |
| Deterministic policy engine | Done | `services/policy_engine.py` |
| JWT authentication service | Done | `services/auth_service.py` |
| Rate limiting (slowapi, 60/min default) | Done | `main.py` |
| PostgreSQL driver ready | Done | `requirements.txt` (psycopg2-binary) |
| Deployment configs | Done | `Procfile`, `render.yaml` |

**All 16 API endpoints tested and verified.** Backend works with zero API keys (graceful degradation).

**Test suite:** 23 pytest tests covering mandates, policy, PayPal, auth — all passing.

---

### PayPal Integration (Member 3 — Payments)

| Module | Status | File |
|--------|--------|------|
| PayPal sandbox service (OAuth2 token, create, capture) | Done | `services/paypal_service.py` |
| **POST /api/paypal/create-order** — Orders API v2 | Done | `routers/paypal.py` |
| **POST /api/paypal/capture-order** — Capture after buyer approval | Done | `routers/paypal.py` |
| **POST /api/paypal/webhook** — Webhook handler (CAPTURE.COMPLETED/DENIED) | Done | `routers/paypal.py` |
| Stub fallback when PayPal keys not configured | Done | `services/paypal_service.py` |
| Budget deduction at capture time (not order creation) | Done | `routers/paypal.py` |

---

## What Remains (Optional Enhancements)

All 17 originally planned tasks have been implemented. The only items left are configuration steps:

| # | Task | Owner | Details |
|---|------|-------|---------|
| 1 | **Add PayPal Sandbox credentials** | Member 3 | Go to [developer.paypal.com](https://developer.paypal.com), create a Sandbox app, copy `Client ID` and `Secret` into `backend/.env`. Without this, stub orders are generated (demo still works). |
| 2 | **Add Gemini API key** | Member 2 | Go to [aistudio.google.com](https://aistudio.google.com/apikey), generate a key, put it in `backend/.env` as `GEMINI_API_KEY`. Without this, the fallback product catalog is used. |
| 3 | **End-to-end walkthrough** | All | With both servers running, walk through all paths: ALLOWED, APPROVAL_REQUIRED, BLOCKED, PayPal checkout. |

---

## Integration Checklist

Use this checklist when connecting frontend ↔ backend ↔ PayPal for the first time:

```
[ ] Backend running on http://localhost:8000 (uvicorn main:app --reload --port 8000)
[ ] Frontend running on http://localhost:3000 (npm run dev)
[ ] frontend/.env.local has NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
[ ] frontend/.env.local has NEXT_PUBLIC_DEMO_MODE=false (or toggle in Settings page)
[ ] backend/.env has GEMINI_API_KEY=<your-key> (optional)
[ ] backend/.env has PAYPAL_CLIENT_ID=<your-id> (optional)
[ ] backend/.env has PAYPAL_CLIENT_SECRET=<your-secret> (optional)
[ ] backend/.env has JWT_SECRET_KEY=<your-secret> (change for production)
[ ] Open http://localhost:8000/docs — Swagger UI loads, all 16 endpoints listed
[ ] Open http://localhost:3000/dashboard — KPI cards show live data from backend
[ ] Create a mandate → appears in /mandates list
[ ] AI Shopping → products returned (fallback or Gemini)
[ ] Policy evaluate on a product → correct ALLOWED/BLOCKED/APPROVAL_REQUIRED
[ ] PayPal checkout → order created, approval URL works
[ ] PayPal return → auto-capture triggers on /transactions?paypal=success
[ ] Approval center → approve creates PayPal order, reject logs transaction
[ ] Transactions page → all operations reflected in audit ledger
[ ] Register user → login → JWT token returned
```

---

## API Endpoint Quick Reference

```
BASE = http://localhost:8000

GET    /api/mandates
POST   /api/mandates                          {"name","instruction","total_budget","currency","allowed_categories","approval_threshold","expiry_date"}
PUT    /api/mandates/{id}                     {"name?","instruction?","total_budget?","currency?","allowed_categories?","approval_threshold?","expiry_date?"}
DELETE /api/mandates/{id}
POST   /api/mandates/{id}/revoke

POST   /api/agent/execute                     {"query","mandate_id?"}
POST   /api/policy/evaluate                   {"product_id","mandate_id","amount","category"}

GET    /api/approvals
POST   /api/approvals/{id}/approve            {"action": "approve"|"reject"}

POST   /api/paypal/create-order               {"product_id","mandate_id","amount","currency","description"}
POST   /api/paypal/capture-order              {"order_id"}
POST   /api/paypal/webhook                    {"id","event_type","resource","summary?"}

GET    /api/transactions
GET    /api/dashboard/metrics

POST   /api/auth/register                     {"username","email","password"}
POST   /api/auth/login                        {"username","password"}
GET    /api/auth/me                           [Authorization: Bearer <token>]
```

---

## File Tree

```
mandategate/
├── README.md                         # Project overview + full setup guide
├── PROJECT_STATUS.md                 # THIS FILE — status + remaining work
│
├── frontend/                         # Next.js 14 + TypeScript + Tailwind
│   ├── app/                          # 7 page routes
│   ├── components/                   # 15 React components
│   ├── lib/                          # API client, utils, demo data
│   ├── types/                        # TypeScript interfaces
│   ├── package.json
│   ├── vercel.json                   # Vercel deployment config
│   ├── .env.local                    # Live mode config
│   └── .env.example
│
└── backend/                          # FastAPI + Python
    ├── main.py                       # App entrypoint + DB seeding + rate limiting
    ├── config.py                     # Environment config (incl. JWT settings)
    ├── database.py                   # SQLAlchemy setup
    ├── models.py                     # 5 ORM models (incl. User)
    ├── schemas.py                    # 22+ Pydantic schemas
    ├── routers/                      # 8 API routers (16 endpoints)
    │   ├── mandates.py               # CRUD + revoke
    │   ├── agent.py                  # Gemini AI agent
    │   ├── policy.py                 # Policy engine
    │   ├── approvals.py              # Human approval workflow
    │   ├── paypal.py                 # PayPal orders + webhook
    │   ├── transactions.py           # Audit ledger
    │   ├── dashboard.py              # Dashboard KPIs
    │   └── auth.py                   # JWT auth (register/login/me)
    ├── services/                     # 4 services
    │   ├── gemini_service.py         # Gemini AI + fallback
    │   ├── policy_engine.py          # Deterministic policy
    │   ├── paypal_service.py         # PayPal Orders API v2
    │   └── auth_service.py           # JWT + bcrypt
    ├── tests/                        # 23 pytest tests
    │   ├── conftest.py               # Test fixtures
    │   ├── test_mandates.py          # Mandate CRUD tests
    │   ├── test_policy.py            # Policy engine tests
    │   ├── test_paypal.py            # PayPal + webhook tests
    │   └── test_auth.py              # Auth flow tests
    ├── requirements.txt              # All Python dependencies
    ├── Procfile                      # Railway/Render deployment
    ├── render.yaml                   # Render blueprint
    └── .env.example
```
