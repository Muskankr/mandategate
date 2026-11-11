# MandateGate

**Autonomous AI Spending Governance Platform** — AI agents shop on your behalf, deterministic policy engines enforce hard spending boundaries, and human operators maintain oversight through a real PayPal checkout pipeline.

## What Is MandateGate?

MandateGate solves a critical problem: **how do you let an AI agent spend money on your behalf while maintaining deterministic control?**

1. A **Spending Mandate** defines the rules: budget cap, allowed categories, auto-approval threshold, expiry date
2. An **AI Shopping Agent** (powered by Google Gemini) discovers products matching natural-language requests
3. A **Deterministic Policy Engine** evaluates every purchase against hard constraints — no AI in the decision loop
4. Purchases below threshold proceed to **PayPal Sandbox checkout** automatically
5. Purchases above threshold are routed to a **Human Approval Center** for sign-off before money moves

## Project Structure

```
mandategate/
├── frontend/           # Next.js 14 + TypeScript + Tailwind CSS
│   ├── app/            # Pages: Dashboard, Shopping, Mandates, Approvals, Transactions, Settings
│   ├── components/     # React components
│   ├── lib/            # API client, utilities, demo data
│   └── types/          # TypeScript interfaces
│
├── backend/            # FastAPI + Python
│   ├── routers/        # API endpoints (11 routes)
│   ├── services/       # Gemini AI, Policy Engine, PayPal
│   ├── models.py       # SQLAlchemy ORM
│   ├── schemas.py      # Pydantic validation
│   └── main.py         # App entrypoint
│
└── README.md           # This file
```

## Quick Start (Full Stack)

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- (Optional) Google Gemini API key
- (Optional) PayPal Sandbox developer credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Muskankr/mandategate.git
cd mandategate
```

### 2. Start the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure (optional — works without API keys)
copy .env.example .env
# Edit .env to add GEMINI_API_KEY and/or PAYPAL credentials

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** — Swagger docs at **/docs**

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env.local
# Ensure NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# Set NEXT_PUBLIC_DEMO_MODE=false to use live backend

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**

### 4. Switch to Live Backend Mode

In the frontend UI, go to **Settings** and click **"Switch to Live API"** to toggle from demo mode to the real backend. Alternatively, set `NEXT_PUBLIC_DEMO_MODE=false` in your `.env.local`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mandates` | List all spending mandates |
| POST | `/api/mandates` | Create a new mandate |
| POST | `/api/mandates/{id}/revoke` | Revoke an active mandate |
| POST | `/api/agent/execute` | AI shopping agent product search |
| POST | `/api/policy/evaluate` | Deterministic policy engine evaluation |
| GET | `/api/approvals` | List human approval requests |
| POST | `/api/approvals/{id}/approve` | Approve or reject a request |
| POST | `/api/paypal/create-order` | Create PayPal sandbox order |
| POST | `/api/paypal/capture-order` | Capture PayPal order after buyer approval |
| GET | `/api/transactions` | Full audit trail ledger |
| GET | `/api/dashboard/metrics` | Dashboard KPIs and aggregates |

## End-to-End Flow

```
User types "Find me an ergonomic keyboard"
    │
    ▼
AI Shopping Agent (Gemini) → returns product recommendations
    │
    ▼
User clicks "Run Policy Evaluation" on a product
    │
    ▼
Policy Engine checks mandate rules:
    ├── Category allowed?     → No  → BLOCKED
    ├── Within budget?        → No  → BLOCKED
    ├── Under threshold?      → Yes → ALLOWED → PayPal Checkout
    └── Over threshold?       → Yes → APPROVAL_REQUIRED
                                        │
                                        ▼
                                  Human Approval Center
                                  ├── Approve → PayPal Order Created → Checkout
                                  └── Reject  → Logged as blocked
```

## Graceful Degradation

The system is designed to work at **three levels**:

| Level | Gemini Key | PayPal Keys | Behavior |
|-------|-----------|-------------|----------|
| **Minimal** | ✗ | ✗ | Fallback product catalog + stub PayPal orders |
| **AI Only** | ✓ | ✗ | Real Gemini product discovery + stub PayPal |
| **Full** | ✓ | ✓ | Real AI + real PayPal Sandbox checkout |

No API keys are required to run and test the full flow.

## Configuration Reference

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./mandategate.db` | Database connection string |
| `GEMINI_API_KEY` | (empty) | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model ID |
| `PAYPAL_CLIENT_ID` | (empty) | PayPal sandbox client ID |
| `PAYPAL_CLIENT_SECRET` | (empty) | PayPal sandbox secret |
| `PAYPAL_BASE_URL` | `https://api-m.sandbox.paypal.com` | PayPal API base URL |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | `false` to use live backend |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, AG Grid |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| AI | Google Gemini (gemini-2.0-flash) |
| Payments | PayPal Orders API v2 (Sandbox) |
| Database | SQLite (dev) / PostgreSQL (prod-ready) |

## Team

| Role | Responsibility |
|------|---------------|
| **Muskan** — Frontend & Product Lead | Next.js UI, dashboard, responsive design, deployment |
| **Member 2** — AI & Backend Lead | FastAPI, Gemini AI, policy engine, approval logic |
| **Member 3** — PayPal & Payment Lead | PayPal sandbox, Orders API, payment verification |
