# MandateGate Frontend

> **"Give AI the power to purchase, not the power to overspend."**

MandateGate is an AI-powered spending-control and trusted PayPal payment gateway for autonomous shopping agents, built for the **PayPal AI Agent Hackathon**.

The frontend provides a venture-backed fintech SaaS experience where users define spending mandates (budgets, permitted categories, expiry dates, and auto-approval thresholds). An autonomous shopping agent searches and recommends products, while a deterministic backend policy engine enforces rules before routing approved transactions to PayPal Sandbox checkout.

---

## 🚀 Key Features & Pages

| Route | Page | Purpose |
|---|---|---|
| `/` | **Product Landing Page** | High-impact product overview, AI spending mandate explanation, step-by-step workflow, and security architecture. |
| `/dashboard` | **Autonomous Dashboard** | Real-time budget tracking, spending velocity chart (Recharts), category breakdown, pending approvals, and live AI agent activity logs. |
| `/mandates` | **Spending Mandates** | View active and expired mandates, budget progress indicators, category restrictions, approval caps, and revocation actions. |
| `/mandates/new` | **Create Mandate** | Validated form to define budgets, natural-language directives, permitted categories, and human approval thresholds. Includes preset templates. |
| `/shopping` | **AI Shopping Assistant** | Interactive conversational agent interface with prompt chips, merchant verification, and real-time policy evaluation (ALLOWED / APPROVAL REQUIRED / BLOCKED). |
| `/approvals` | **Human Approval Center** | Queue of purchases that exceed mandate thresholds, detailing product info, mandate context, and AI rationale with Approve/Reject actions that initiate PayPal order flows. |
| `/transactions` | **Audit Ledger** | High-performance AG Grid Community table featuring search, column filters, multi-column sorting, and CSV export. |
| `/settings` | **Platform Governance** | Runtime environment switch (Demo Mode vs Live API), backend URL settings, and policy management. |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom fintech dark theme (deep navy `#080c16`, dark charcoal `#0f1629`, electric violet `#8b5cf6`, and blue `#3b82f6`)
- **Ledger Tables**: AG Grid Community (`ag-grid-react` v31 with Quartz Dark theme)
- **Analytics Charts**: Recharts (Area charts for spending velocity, Pie charts for category breakdown)
- **Icons**: Lucide React
- **Notifications**: Custom glassmorphic Toast notification provider

---

## 🔒 Security & PayPal Architecture

1. **Deterministic Policy Guard**: LLMs are never granted direct write access to money. Every agent purchase recommendation must pass deterministic backend verification.
2. **Zero Credential Exposure**: The frontend and AI agents never receive or store raw credit card numbers or PayPal client secrets.
3. **Official PayPal Sandbox Redirection**: Approved purchases trigger backend order creation (`/api/paypal/create-order`) and direct users to official PayPal approval URLs.
4. **No Fake Captures**: The frontend distinguishes between application-level approval and confirmed PayPal capture status.

---

## 🕹️ Demo Mode vs Live API Mode

MandateGate includes a switchable Demo Mode (`NEXT_PUBLIC_DEMO_MODE=true`):
- **Demo Mode**: Uses deterministic in-memory simulation with realistic sample mandates, products, and transactions. Allows judges to explore every feature without deploying the backend.
- **Live API Mode**: Connects directly to `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`). Displays actionable error states if the backend service is offline.
- **Instant Switch**: Toggle anytime via the top header banner or in `/settings`.

---

## ⚙️ Environment Variables

Create `frontend/.env.local` (or copy from `frontend/.env.example`):

```bash
# Backend REST API base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Enable standalone deterministic demo mode (true/false)
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 📦 Installation & Running

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:3000 in your browser

# Run TypeScript check
npx tsc --noEmit

# Run production build
npm run build

# Start production server
npm start
```

---

## 🔌 Centralized API Contracts (`frontend/lib/api.ts`)

| HTTP Method | Route | Description |
|---|---|---|
| `GET` | `/api/mandates` | Fetch all active and expired spending mandates |
| `POST` | `/api/mandates` | Create a new mandate policy |
| `POST` | `/api/mandates/{id}/revoke` | Revoke a mandate |
| `POST` | `/api/agent/execute` | Run AI shopping query to retrieve candidate products |
| `POST` | `/api/policy/evaluate` | Deterministic policy evaluation (`ALLOWED`, `APPROVAL_REQUIRED`, `BLOCKED`) |
| `GET` | `/api/approvals` | List pending approval requests |
| `POST` | `/api/approvals/{id}/approve` | Human operator approval / rejection |
| `GET` | `/api/transactions` | Fetch full transaction audit trail |
| `POST` | `/api/paypal/create-order` | Backend creates PayPal Sandbox Order and returns `approval_url` |
| `POST` | `/api/paypal/capture-order` | Backend captures payment after user authorization |

