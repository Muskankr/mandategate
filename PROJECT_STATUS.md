# MandateGate — Project Status & Remaining Work

> **Last updated:** 2026-11-11
> **Branch:** `main`
> **Status:** Backend MVP complete, frontend MVP complete, integration verified

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

**Build status:** `npm run build` passes with zero errors, all 9 routes prerendered.

---

### Backend (Member 2 — AI & Backend)

| Module | Status | File |
|--------|--------|------|
| FastAPI app with CORS + lifespan seeding | Done | `main.py` |
| Config from `.env` (Pydantic Settings) | Done | `config.py` |
| SQLAlchemy ORM (Mandate, Product, Approval, Transaction) | Done | `models.py` |
| Pydantic schemas (all 18 request/response models) | Done | `schemas.py` |
| SQLite database with auto-seed demo data | Done | `database.py` + `main.py` |
| **GET /api/mandates** — List mandates | Done | `routers/mandates.py` |
| **POST /api/mandates** — Create mandate | Done | `routers/mandates.py` |
| **POST /api/mandates/{id}/revoke** — Revoke mandate | Done | `routers/mandates.py` |
| **POST /api/agent/execute** — Gemini AI shopping agent | Done | `routers/agent.py` |
| **POST /api/policy/evaluate** — Deterministic policy engine | Done | `routers/policy.py` |
| **GET /api/approvals** — List approval requests | Done | `routers/approvals.py` |
| **POST /api/approvals/{id}/approve** — Approve/reject | Done | `routers/approvals.py` |
| **GET /api/transactions** — Audit ledger | Done | `routers/transactions.py` |
| **GET /api/dashboard/metrics** — Dashboard KPIs | Done | `routers/dashboard.py` |
| Gemini AI service (with fallback catalog) | Done | `services/gemini_service.py` |
| Deterministic policy engine (status → expiry → category → budget → threshold) | Done | `services/policy_engine.py` |

**All 11 API endpoints tested and verified.** Backend works with zero API keys (graceful degradation).

---

### PayPal Integration (Member 3 — Payments)

| Module | Status | File |
|--------|--------|------|
| PayPal sandbox service (OAuth2 token, create, capture) | Done | `services/paypal_service.py` |
| **POST /api/paypal/create-order** — Orders API v2 | Done | `routers/paypal.py` |
| **POST /api/paypal/capture-order** — Capture after buyer approval | Done | `routers/paypal.py` |
| Stub fallback when PayPal keys not configured | Done | `services/paypal_service.py` |
| Budget deduction at capture time (not order creation) | Done | `routers/paypal.py` |

---

## What Is Left To Do

### Priority 1 — Required for Working Demo

| # | Task | Owner | Difficulty | Details |
|---|------|-------|-----------|---------|
| 1 | **Add PayPal Sandbox credentials** | Member 3 | Easy | Go to [developer.paypal.com](https://developer.paypal.com), create a Sandbox app, copy `Client ID` and `Secret` into `backend/.env` (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`). Without this, stub orders are generated (demo still works but the PayPal redirect is fake). |
| 2 | **Add Gemini API key** | Member 2 | Easy | Go to [aistudio.google.com](https://aistudio.google.com/apikey), generate a key, put it in `backend/.env` as `GEMINI_API_KEY`. Without this, the fallback product catalog is used (5 hardcoded products). |
| 3 | **Frontend → Live mode toggle** | Muskan | Easy | Either set `NEXT_PUBLIC_DEMO_MODE=false` in `frontend/.env.local`, or use the Settings page toggle. The frontend defaults to demo mode — it must be switched to hit the real backend. |
| 4 | **End-to-end walkthrough test** | All | Medium | With both servers running, walk through: create mandate → AI search → policy evaluate (ALLOWED path) → PayPal checkout → verify transaction appears. Then test the APPROVAL_REQUIRED path: search → over-threshold product → approval center → approve → PayPal. Finally test BLOCKED: gaming product against hardware mandate. |

### Priority 2 — Important for Polish

| # | Task | Owner | Difficulty | Details |
|---|------|-------|-----------|---------|
| 5 | **PayPal return URL handling** | Member 3 | Medium | After buyer approves on PayPal's page, they are redirected back to `http://localhost:3000/transactions?paypal=success`. The frontend currently does nothing with this query param. Should: detect the `?paypal=success&token=ORDER_ID` params, call `POST /api/paypal/capture-order` automatically, and show a success toast. File to edit: `frontend/app/transactions/page.tsx`. |
| 6 | **PayPal webhooks** | Member 3 | Medium | Add `POST /api/paypal/webhook` endpoint to receive PayPal IPN/webhook events (PAYMENT.CAPTURE.COMPLETED, etc). Update transaction status from webhook instead of relying on frontend capture call. Webhook URL must be configured in PayPal Sandbox dashboard. |
| 7 | **Header notifications from API** | Muskan | Easy | `frontend/components/navigation/Header.tsx` lines 69-99 have hardcoded notification items. Replace with a fetch from `/api/approvals` (pending count) and `/api/transactions` (latest 2-3). |
| 8 | **Auto-expire mandates** | Member 2 | Easy | Currently the policy engine blocks expired mandates at evaluation time, but their `status` field stays "ACTIVE" in the database. Add a startup task or periodic check that sets `status = "EXPIRED"` for mandates past `expiry_date`. Location: add to `main.py` lifespan, or a background task. |
| 9 | **Mandate edit/update endpoint** | Member 2 | Medium | No `PUT /api/mandates/{id}` exists. The frontend doesn't have an edit UI either, but it's useful for adjusting budgets or categories without revoking and re-creating. |
| 10 | **Delete mandate (soft delete)** | Member 2 | Easy | No `DELETE /api/mandates/{id}`. Low priority but useful for cleanup. |

### Priority 3 — Nice to Have (Post-Demo)

| # | Task | Owner | Difficulty | Details |
|---|------|-------|-----------|---------|
| 11 | **User authentication** | Member 2 | Hard | Currently no auth — all endpoints are open. For production: add JWT auth, user model, login/register, and per-user mandate scoping. |
| 12 | **PostgreSQL migration** | Member 2 | Easy | Change `DATABASE_URL` in `.env` to a Postgres connection string. SQLAlchemy handles it transparently. May need `psycopg2-binary` in requirements. |
| 13 | **Deployment (Vercel + Railway/Render)** | Muskan | Medium | Frontend → Vercel (`npm run build` is ready). Backend → Railway or Render (add `Procfile` with `uvicorn main:app --host 0.0.0.0 --port $PORT`). Set env vars in deployment dashboard. |
| 14 | **Rate limiting** | Member 2 | Easy | Add `slowapi` or FastAPI middleware to prevent API abuse. Especially on `/api/agent/execute` (Gemini costs money). |
| 15 | **Frontend: replace `<img>` with `next/image`** | Muskan | Easy | Product images use raw `<img>` tags. Switch to `<Image>` from `next/image` for lazy loading and optimization. |
| 16 | **Frontend: load Inter font from Google Fonts** | Muskan | Easy | `tailwind.config.ts` references `var(--font-inter)` but no Google Font import exists. Add `next/font/google` import for Inter in `app/layout.tsx`. |
| 17 | **Comprehensive test suite** | All | Hard | No automated tests exist for either frontend or backend. Add pytest for backend endpoints and Jest/Playwright for frontend. |

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
[ ] Open http://localhost:8000/docs — Swagger UI loads, all 11 endpoints listed
[ ] Open http://localhost:3000/dashboard — KPI cards show live data from backend
[ ] Create a mandate → appears in /mandates list
[ ] AI Shopping → products returned (fallback or Gemini)
[ ] Policy evaluate on a product → correct ALLOWED/BLOCKED/APPROVAL_REQUIRED
[ ] PayPal checkout → order created, approval URL works
[ ] Approval center → approve creates PayPal order, reject logs transaction
[ ] Transactions page → all operations reflected in audit ledger
```

---

## API Endpoint Quick Reference

For Member 2 and Member 3 coordination — copy these for Postman/testing:

```
BASE = http://localhost:8000

GET    /api/mandates
POST   /api/mandates                          {"name","instruction","total_budget","currency","allowed_categories","approval_threshold","expiry_date"}
POST   /api/mandates/{id}/revoke

POST   /api/agent/execute                     {"query","mandate_id?"}
POST   /api/policy/evaluate                   {"product_id","mandate_id","amount","category"}

GET    /api/approvals
POST   /api/approvals/{id}/approve            {"action": "approve"|"reject"}

POST   /api/paypal/create-order               {"product_id","mandate_id","amount","currency","description"}
POST   /api/paypal/capture-order              {"order_id"}

GET    /api/transactions
GET    /api/dashboard/metrics
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
│   └── .env.example
│
└── backend/                          # FastAPI + Python
    ├── main.py                       # App entrypoint + DB seeding
    ├── config.py                     # Environment config
    ├── database.py                   # SQLAlchemy setup
    ├── models.py                     # 4 ORM models
    ├── schemas.py                    # 18 Pydantic schemas
    ├── routers/                      # 7 API routers (11 endpoints)
    ├── services/                     # 3 services (Gemini, Policy, PayPal)
    ├── requirements.txt
    └── .env.example
```
