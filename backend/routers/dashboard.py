from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Mandate, Transaction, ApprovalRequest
from schemas import (
    DashboardMetrics,
    TransactionOut,
    SpendingTrend,
    CategoryBreakdown,
    AIActivity,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

CATEGORY_COLORS = {
    "Computer Hardware": "#8b5cf6",
    "Cloud Infrastructure": "#3b82f6",
    "Office Equipment": "#06b6d4",
    "Software & SaaS": "#10b981",
    "Electronics": "#f59e0b",
    "Developer Tools": "#ec4899",
    "Office Supplies": "#64748b",
    "Books & Education": "#a78bfa",
    "Gaming & Entertainment": "#ef4444",
    "Furniture": "#14b8a6",
}


@router.get("/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    active_mandates = db.query(Mandate).filter(Mandate.status == "ACTIVE").all()
    total_budget = round(sum(m.total_budget for m in active_mandates), 2)
    total_spent = round(sum(m.spent_amount for m in active_mandates), 2)
    remaining = round(total_budget - total_spent, 2)
    active_count = len(active_mandates)

    pending_count = (
        db.query(func.count(ApprovalRequest.id))
        .filter(ApprovalRequest.status == "PENDING")
        .scalar()
    ) or 0

    recent_txns = (
        db.query(Transaction).order_by(Transaction.date.desc()).limit(5).all()
    )

    recent_txn_out = [
        TransactionOut(
            id=t.id,
            product_title=t.product_title,
            amount=t.amount,
            currency=t.currency,
            category=t.category,
            mandate_name=t.mandate_name,
            mandate_id=t.mandate_id,
            payment_status=t.payment_status,
            date=t.date,
            decision_reason=t.decision_reason,
            paypal_order_id=t.paypal_order_id,
        )
        for t in recent_txns
    ]

    # Category breakdown from completed transactions
    completed_txns = (
        db.query(Transaction).filter(Transaction.payment_status == "COMPLETED").all()
    )
    cat_totals: dict[str, float] = {}
    for t in completed_txns:
        cat = t.category or "Other"
        cat_totals[cat] = cat_totals.get(cat, 0) + t.amount

    total_cat = sum(cat_totals.values()) or 1.0
    category_breakdown = [
        CategoryBreakdown(
            category=cat,
            amount=amt,
            percentage=round(amt / total_cat * 100, 1),
            color=CATEGORY_COLORS.get(cat, "#6366f1"),
        )
        for cat, amt in sorted(cat_totals.items(), key=lambda x: -x[1])
    ]

    # Build spending trend from transactions
    all_txns_ordered = (
        db.query(Transaction)
        .filter(Transaction.payment_status.in_(["COMPLETED", "PENDING"]))
        .order_by(Transaction.date)
        .all()
    )
    spending_trend: list[SpendingTrend] = []
    cumulative = 0.0
    for t in all_txns_ordered:
        cumulative += t.amount
        date_label = t.date[:10] if t.date else "Unknown"
        spending_trend.append(
            SpendingTrend(date=date_label, amount=round(cumulative, 2), budget_cap=total_budget)
        )

    if not spending_trend:
        spending_trend.append(SpendingTrend(date="Today", amount=0, budget_cap=total_budget))

    # Recent AI activity from approvals and transactions
    ai_activity: list[AIActivity] = []
    recent_approvals = (
        db.query(ApprovalRequest).order_by(ApprovalRequest.created_at.desc()).limit(5).all()
    )
    for i, a in enumerate(recent_approvals):
        if a.status == "PENDING":
            act_type = "approval_required"
            action = "Approval Required"
        elif a.status == "APPROVED":
            act_type = "executed"
            action = "Purchase Approved"
        else:
            act_type = "blocked"
            action = "Request Rejected"

        ai_activity.append(
            AIActivity(
                id=f"act_{i + 1}",
                action=action,
                details=f"{a.mandate_name}: {a.ai_recommendation[:120]}",
                timestamp=a.created_at,
                type=act_type,
            )
        )

    return DashboardMetrics(
        total_budget=total_budget,
        total_spent=total_spent,
        remaining_budget=remaining,
        active_mandates=active_count,
        pending_approvals=pending_count,
        recent_transactions=recent_txn_out,
        spending_trend=spending_trend,
        category_breakdown=category_breakdown,
        ai_activity=ai_activity,
    )
