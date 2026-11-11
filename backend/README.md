# MandateGate Backend

FastAPI backend powering the MandateGate autonomous AI spending governance platform.

## Architecture

```
backend/
├── main.py                    # FastAPI app, CORS, startup seeding
├── config.py                  # Pydantic settings from .env
├── database.py                # SQLAlchemy engine + session
├── models.py                  # ORM: Mandate, Product, ApprovalRequest, Transaction
├── schemas.py                 # Pydantic request/response schemas
├── routers/
│   ├── mandates.py            # CRUD for spending mandates
│   ├── agent.py               # Gemini AI shopping agent
│   ├── policy.py              # Deterministic policy engine
│   ├── approvals.py           # Human approval workflow
│   ├── paypal.py              # PayPal sandbox orders
│   ├── transactions.py        # Audit ledger
│   └── dashboard.py           # Aggregated metrics
├── services/
│   ├── gemini_service.py      # Google Gemini integration + fallback
│   ├── policy_engine.py       # Budget/category/threshold checks
│   └── paypal_service.py      # PayPal Orders API v2 + stub
├── requirements.txt
└── .env.example
```

## Quick Start

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your API keys (optional — works without them)

# Start server
uvicorn main:app --reload --port 8000
```

The server starts at `http://localhost:8000` with Swagger docs at `/docs`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mandates` | List all spending mandates |
| POST | `/api/mandates` | Create a new mandate |
| POST | `/api/mandates/{id}/revoke` | Revoke an active mandate |
| POST | `/api/agent/execute` | AI shopping agent search |
| POST | `/api/policy/evaluate` | Run deterministic policy check |
| GET | `/api/approvals` | List approval requests |
| POST | `/api/approvals/{id}/approve` | Approve or reject a request |
| POST | `/api/paypal/create-order` | Create PayPal sandbox order |
| POST | `/api/paypal/capture-order` | Capture approved PayPal order |
| GET | `/api/transactions` | Full transaction audit ledger |
| GET | `/api/dashboard/metrics` | Aggregated dashboard KPIs |

## Configuration

All configuration is via environment variables (`.env` file):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | SQLite default; supports PostgreSQL |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI agent. Fallback demo products used when empty |
| `GEMINI_MODEL` | No | Gemini model ID (default: `gemini-2.0-flash`) |
| `PAYPAL_CLIENT_ID` | No | PayPal sandbox client ID. Stub orders generated when empty |
| `PAYPAL_CLIENT_SECRET` | No | PayPal sandbox secret |
| `PAYPAL_BASE_URL` | No | PayPal API base (default: sandbox) |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: `http://localhost:3000`) |

## Graceful Degradation

The backend works at **three levels** depending on what credentials you provide:

1. **No API keys** — Full functionality with deterministic fallback products and PayPal stub orders
2. **Gemini key only** — Real AI-powered product discovery + PayPal stubs
3. **All keys** — Full AI + real PayPal sandbox checkout flow

## Database

- SQLite by default (auto-created on first run)
- Auto-seeds with demo data matching the frontend's demo dataset
- Delete `mandategate.db` to reset to fresh seed state

## Policy Engine Rules

The deterministic policy engine evaluates purchases in this order:

1. **Mandate status** — Must be `ACTIVE`
2. **Category check** — Product category must be in mandate's `allowed_categories`
3. **Budget check** — Amount must not exceed `remaining_budget`
4. **Threshold check** — Amount above `approval_threshold` requires human approval

Decisions: `ALLOWED` → PayPal checkout, `APPROVAL_REQUIRED` → queued for human, `BLOCKED` → denied.
