from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Mandate, Product, ApprovalRequest, Transaction, generate_id
from schemas import PolicyEvaluateRequest, PurchaseDecision
from services.policy_engine import evaluate_purchase

router = APIRouter(prefix="/api/policy", tags=["Policy Engine"])


@router.post("/evaluate", response_model=PurchaseDecision)
def evaluate_policy(body: PolicyEvaluateRequest, db: Session = Depends(get_db)):
    mandate = db.query(Mandate).filter(Mandate.id == body.mandate_id).first()
    if not mandate:
        return PurchaseDecision(
            decision="BLOCKED",
            amount=body.amount,
            reason="Mandate not found or invalid.",
            requires_approval=False,
        )

    product = db.query(Product).filter(Product.id == body.product_id).first()

    decision = evaluate_purchase(mandate, body.product_id, body.amount, body.category)

    now = datetime.now(timezone.utc).isoformat()

    product_title = product.title if product else f"Product {body.product_id}"

    if decision.decision == "APPROVAL_REQUIRED":
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Product '{body.product_id}' not found in database. Run a shopping agent search first.",
            )
        existing_approval = (
            db.query(ApprovalRequest)
            .filter(
                ApprovalRequest.product_id == body.product_id,
                ApprovalRequest.mandate_id == body.mandate_id,
                ApprovalRequest.status == "PENDING",
            )
            .first()
        )
        if not existing_approval:
            approval = ApprovalRequest(
                id=generate_id("app"),
                product_id=product.id,
                amount=body.amount,
                currency=mandate.currency,
                mandate_id=mandate.id,
                mandate_name=mandate.name,
                mandate_remaining_budget=mandate.remaining_budget,
                ai_recommendation=(
                    f"AI identified {product.title} as a match. "
                    f"Cost (${body.amount:.2f}) exceeds auto-approval threshold "
                    f"of ${mandate.approval_threshold:.2f}."
                ),
                status="PENDING",
                created_at=now,
                policy_trigger=f"PRICE_EXCEEDS_THRESHOLD (${body.amount:.2f} > ${mandate.approval_threshold:.2f})",
            )
            db.add(approval)

    if decision.decision == "BLOCKED":
        txn = Transaction(
            id=generate_id("txn"),
            product_title=product_title,
            amount=body.amount,
            currency=mandate.currency,
            category=body.category,
            mandate_name=mandate.name,
            mandate_id=mandate.id,
            payment_status="BLOCKED",
            date=now,
            decision_reason=decision.reason,
        )
        db.add(txn)

    db.commit()
    return decision
