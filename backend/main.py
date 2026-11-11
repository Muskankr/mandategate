from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings
from database import engine, SessionLocal, Base
from models import Mandate, Product, ApprovalRequest, Transaction, generate_id

from routers import mandates, agent, policy, approvals, paypal, transactions, dashboard, auth

settings = get_settings()
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


def expire_stale_mandates():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        active = db.query(Mandate).filter(Mandate.status == "ACTIVE").all()
        for m in active:
            try:
                exp = datetime.fromisoformat(m.expiry_date.replace("Z", "+00:00"))
                if exp < now:
                    m.status = "EXPIRED"
            except (ValueError, AttributeError):
                pass
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    expire_stale_mandates()
    yield


app = FastAPI(
    title="MandateGate Backend API",
    description=(
        "FastAPI backend for MandateGate — autonomous AI spending governance. "
        "Provides mandate CRUD, Gemini-powered shopping agent, deterministic policy engine, "
        "human approval workflow, PayPal sandbox checkout, and transaction audit ledger."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mandates.router)
app.include_router(agent.router)
app.include_router(policy.router)
app.include_router(approvals.router)
app.include_router(paypal.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "service": "MandateGate Backend API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


def seed_database():
    """Create tables and seed demo data on first run."""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Mandate).count() > 0:
            return

        now = datetime.now(timezone.utc)

        # Seed mandates
        seed_mandates = [
            Mandate(
                id="mnd_8829a",
                name="Engineering Hardware & Accessories",
                instruction="Procure developer workstation peripherals, cables, and ergonomic equipment under strict price limits.",
                total_budget=1500.0,
                spent_amount=684.5,
                remaining_budget=815.5,
                currency="USD",
                allowed_categories=["Computer Hardware", "Electronics", "Office Equipment"],
                approval_threshold=150.0,
                expiry_date="2026-12-31T23:59:59Z",
                status="ACTIVE",
                created_at="2026-10-01T10:00:00Z",
            ),
            Mandate(
                id="mnd_4102b",
                name="SaaS Dev Tools & API Subscriptions",
                instruction="Subscribe to vetted developer cloud services, CI/CD tools, and monitoring APIs up to monthly budget cap.",
                total_budget=800.0,
                spent_amount=320.0,
                remaining_budget=480.0,
                currency="USD",
                allowed_categories=["Software & SaaS", "Cloud Infrastructure"],
                approval_threshold=75.0,
                expiry_date="2026-11-30T23:59:59Z",
                status="ACTIVE",
                created_at="2026-10-15T14:30:00Z",
            ),
            Mandate(
                id="mnd_9921c",
                name="Home Office Ergonomics Refresh",
                instruction="Autonomous agent allowed to order certified ergonomic accessories and lighting.",
                total_budget=600.0,
                spent_amount=540.0,
                remaining_budget=60.0,
                currency="USD",
                allowed_categories=["Office Equipment", "Furniture"],
                approval_threshold=100.0,
                expiry_date="2026-11-20T23:59:59Z",
                status="ACTIVE",
                created_at="2026-09-10T08:15:00Z",
            ),
            Mandate(
                id="mnd_3304d",
                name="Q3 AI Hackathon Fast-Track Cloud",
                instruction="Compute credits and GPU server burst allocation for hackathon prototyping.",
                total_budget=1000.0,
                spent_amount=1000.0,
                remaining_budget=0.0,
                currency="USD",
                allowed_categories=["Cloud Infrastructure"],
                approval_threshold=200.0,
                expiry_date="2026-10-01T00:00:00Z",
                status="EXPIRED",
                created_at="2026-09-01T09:00:00Z",
            ),
        ]
        db.add_all(seed_mandates)

        # Seed products
        seed_products = [
            Product(
                id="prd_101",
                title="Logitech MX Master 3S Wireless Performance Mouse",
                price=99.99, currency="USD", category="Computer Hardware",
                merchant="BestBuy Verified", rating=4.8, reviews_count=1420,
                image_url="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60",
                explanation="Best-in-class ergonomics and silent electromagnetic scroll wheel matching developer peripheral mandate.",
                specs=["8K DPI sensor", "Quiet clicks", "USB-C Quick Charging", "Multi-OS"],
                in_stock=1,
            ),
            Product(
                id="prd_102",
                title="Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
                price=199.0, currency="USD", category="Computer Hardware",
                merchant="Keychron Direct", rating=4.9, reviews_count=860,
                image_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
                explanation="CNC aluminum body with QMK/VIA programmable hot-swappable keys. Exceeds $150 threshold, requires human approval.",
                specs=["Full aluminum frame", "Hot-swappable K Pro switches", "Bluetooth 5.1 & Type-C", "Double-gasket"],
                in_stock=1,
            ),
            Product(
                id="prd_103",
                title="Anker PowerExpand 8-in-1 USB-C Data & PD Hub",
                price=49.99, currency="USD", category="Electronics",
                merchant="Anker Official", rating=4.7, reviews_count=3100,
                image_url="https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=60",
                explanation="4K 60Hz HDMI and 100W Power Delivery. Under $150 threshold and fully within Electronics category.",
                specs=["85W Pass-Through Charging", "4K HDMI", "10Gbps USB-C & USB-A", "microSD/SD"],
                in_stock=1,
            ),
            Product(
                id="prd_104",
                title="Sony PlayStation 5 DualSense Edge Controller",
                price=199.99, currency="USD", category="Gaming & Entertainment",
                merchant="Sony Direct", rating=4.6, reviews_count=940,
                image_url="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60",
                explanation="Gaming console controller detected. Category 'Gaming & Entertainment' is explicitly NOT in allowed list.",
                specs=["Customizable controls", "Replaceable stick modules", "Haptic feedback"],
                in_stock=1,
            ),
            Product(
                id="prd_105",
                title="BenQ ScreenBar Halo LED Monitor Light Bar",
                price=179.0, currency="USD", category="Office Equipment",
                merchant="BenQ Store", rating=4.8, reviews_count=530,
                image_url="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60",
                explanation="Asymmetric optical design prevents screen glare. Category allowed, but exceeds approval threshold of $150.",
                specs=["Wireless controller", "Curved & flat monitor fit", "Auto-dimming sensor"],
                in_stock=1,
            ),
        ]
        db.add_all(seed_products)
        db.flush()

        # Seed approval requests
        seed_approvals = [
            ApprovalRequest(
                id="app_701",
                product_id="prd_102",
                amount=199.0, currency="USD",
                mandate_id="mnd_8829a",
                mandate_name="Engineering Hardware & Accessories",
                mandate_remaining_budget=815.5,
                ai_recommendation="AI identified this keyboard as optimal for ergonomic code drafting. Cost ($199.00) exceeds auto-approval threshold of $150.00.",
                status="PENDING",
                created_at="2026-11-10T14:22:00Z",
                policy_trigger="PRICE_EXCEEDS_THRESHOLD ($199.00 > $150.00)",
            ),
            ApprovalRequest(
                id="app_702",
                product_id="prd_105",
                amount=179.0, currency="USD",
                mandate_id="mnd_8829a",
                mandate_name="Engineering Hardware & Accessories",
                mandate_remaining_budget=815.5,
                ai_recommendation="AI suggested light bar for eye strain reduction during night shifts. Price exceeds threshold of $150.00.",
                status="PENDING",
                created_at="2026-11-11T09:15:00Z",
                policy_trigger="PRICE_EXCEEDS_THRESHOLD ($179.00 > $150.00)",
            ),
        ]
        db.add_all(seed_approvals)

        # Seed transactions
        seed_transactions = [
            Transaction(
                id="txn_90118", product_title="Logitech MX Master 3S Wireless Mouse",
                amount=99.99, currency="USD", category="Computer Hardware",
                mandate_name="Engineering Hardware & Accessories", mandate_id="mnd_8829a",
                payment_status="COMPLETED", date="2026-11-08T16:45:00Z",
                decision_reason="Pre-approved: Under $150.00 limit and category permitted",
                paypal_order_id="PAYID-MN7X8Q1230",
            ),
            Transaction(
                id="txn_90117", product_title="Anker PowerExpand 8-in-1 USB-C Hub",
                amount=49.99, currency="USD", category="Electronics",
                mandate_name="Engineering Hardware & Accessories", mandate_id="mnd_8829a",
                payment_status="COMPLETED", date="2026-11-06T11:20:00Z",
                decision_reason="Auto-approved: Within Electronics mandate envelope",
                paypal_order_id="PAYID-MN6Y2A8901",
            ),
            Transaction(
                id="txn_90116", product_title="CalDigit TS4 Thunderbolt 4 Dock",
                amount=399.99, currency="USD", category="Computer Hardware",
                mandate_name="Engineering Hardware & Accessories", mandate_id="mnd_8829a",
                payment_status="COMPLETED", date="2026-11-04T09:30:00Z",
                decision_reason="Approved by Human Operator (Exceeded $150 threshold)",
                paypal_order_id="PAYID-MN5Z4B4412",
            ),
            Transaction(
                id="txn_90115", product_title="GitHub Copilot Enterprise Monthly",
                amount=39.0, currency="USD", category="Software & SaaS",
                mandate_name="SaaS Dev Tools & API Subscriptions", mandate_id="mnd_4102b",
                payment_status="COMPLETED", date="2026-11-01T00:01:00Z",
                decision_reason="Recurring dev tool mandate rule matched",
                paypal_order_id="PAYID-MN4W1C7721",
            ),
            Transaction(
                id="txn_90114", product_title="PlayStation Plus 12-Month Premium",
                amount=159.99, currency="USD", category="Gaming & Entertainment",
                mandate_name="Engineering Hardware & Accessories", mandate_id="mnd_8829a",
                payment_status="BLOCKED", date="2026-10-28T14:10:00Z",
                decision_reason="BLOCKED: Category 'Gaming & Entertainment' disallowed by mandate policy",
            ),
            Transaction(
                id="txn_90113", product_title="Anthropic Claude API Pre-Paid Credit",
                amount=100.0, currency="USD", category="Cloud Infrastructure",
                mandate_name="SaaS Dev Tools & API Subscriptions", mandate_id="mnd_4102b",
                payment_status="COMPLETED", date="2026-10-25T17:05:00Z",
                decision_reason="Approved: Human authorized over-threshold API reload",
                paypal_order_id="PAYID-MN3V9D1124",
            ),
            Transaction(
                id="txn_90112", product_title="Autonomous Trading Bot Subscription",
                amount=250.0, currency="USD", category="Financial Services",
                mandate_name="Engineering Hardware & Accessories", mandate_id="mnd_8829a",
                payment_status="BLOCKED", date="2026-10-22T20:15:00Z",
                decision_reason="BLOCKED: Restricted category and exceeds mandate ceiling",
            ),
        ]
        db.add_all(seed_transactions)

        db.commit()
        print("[MandateGate] Database seeded with demo data.")
    finally:
        db.close()
