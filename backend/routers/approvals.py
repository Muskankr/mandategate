from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import ApprovalRequest, Mandate, Transaction, generate_id
from schemas import (
    ApprovalRequestOut,
    ProductOut,
    ApprovalActionRequest,
    ApprovalActionResponse,
    PayPalOrderResponse,
)
from services.paypal_service import create_order

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])


def _to_approval_out(req: ApprovalRequest) -> ApprovalRequestOut:
    product = req.product
    return ApprovalRequestOut(
        id=req.id,
        product=ProductOut(
            id=product.id,
            title=product.title,
            price=product.price,
            currency=product.currency,
            category=product.category,
            merchant=product.merchant,
            rating=product.rating,
            reviews_count=product.reviews_count or 0,
            image_url=product.image_url,
            explanation=product.explanation,
            specs=product.specs or [],
            in_stock=bool(product.in_stock),
        ),
        amount=req.amount,
        currency=req.currency,
        mandate_id=req.mandate_id,
        mandate_name=req.mandate_name,
        mandate_remaining_budget=req.mandate_remaining_budget,
        ai_recommendation=req.ai_recommendation,
        status=req.status,
        created_at=req.created_at,
        policy_trigger=req.policy_trigger,
    )


@router.get("", response_model=list[ApprovalRequestOut])
def list_approvals(db: Session = Depends(get_db)):
    requests = (
        db.query(ApprovalRequest)
        .options(joinedload(ApprovalRequest.product))
        .order_by(ApprovalRequest.created_at.desc())
        .all()
    )
    return [_to_approval_out(r) for r in requests]


@router.post("/{approval_id}/approve", response_model=ApprovalActionResponse)
async def process_approval(
    approval_id: str,
    body: ApprovalActionRequest,
    db: Session = Depends(get_db),
):
    req = (
        db.query(ApprovalRequest)
        .options(joinedload(ApprovalRequest.product))
        .filter(ApprovalRequest.id == approval_id)
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if req.status != "PENDING":
        raise HTTPException(
            status_code=409,
            detail=f"Approval request already processed (status: {req.status})",
        )

    now = datetime.now(timezone.utc).isoformat()

    if body.action == "approve":
        req.status = "APPROVED"

        mandate = db.query(Mandate).filter(Mandate.id == req.mandate_id).first()

        order_result = await create_order(
            amount=req.amount,
            currency=req.currency,
            description=f"Approved purchase: {req.product.title} under {req.mandate_name}",
        )

        txn = Transaction(
            id=generate_id("txn"),
            product_title=req.product.title,
            amount=req.amount,
            currency=req.currency,
            category=req.product.category,
            mandate_name=req.mandate_name,
            mandate_id=req.mandate_id,
            payment_status="COMPLETED",
            date=now,
            decision_reason=f"Human operator approved over-threshold purchase (${req.amount:.2f})",
            paypal_order_id=order_result["order_id"],
        )
        db.add(txn)

        if mandate:
            mandate.spent_amount += req.amount
            mandate.remaining_budget = max(0, mandate.total_budget - mandate.spent_amount)

        db.commit()

        return ApprovalActionResponse(
            success=True,
            approval_id=approval_id,
            status="APPROVED",
            payment=PayPalOrderResponse(
                order_id=order_result["order_id"],
                status=order_result["status"],
                approval_url=order_result.get("approval_url"),
                message=order_result.get("message"),
            ),
        )

    else:
        req.status = "REJECTED"
        txn = Transaction(
            id=generate_id("txn"),
            product_title=req.product.title,
            amount=req.amount,
            currency=req.currency,
            category=req.product.category,
            mandate_name=req.mandate_name,
            mandate_id=req.mandate_id,
            payment_status="BLOCKED",
            date=now,
            decision_reason=f"Human operator rejected purchase request for {req.product.title}",
        )
        db.add(txn)
        db.commit()

        return ApprovalActionResponse(
            success=True,
            approval_id=approval_id,
            status="REJECTED",
        )
