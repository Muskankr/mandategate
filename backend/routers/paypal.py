from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Mandate, Transaction, generate_id
from schemas import (
    CreatePayPalOrderRequest,
    CapturePayPalOrderRequest,
    CapturePayPalOrderResponse,
    PayPalOrderResponse,
    PayPalWebhookEvent,
)
from services.paypal_service import create_order, capture_order

router = APIRouter(prefix="/api/paypal", tags=["PayPal"])


@router.post("/create-order", response_model=PayPalOrderResponse)
async def create_paypal_order(body: CreatePayPalOrderRequest, db: Session = Depends(get_db)):
    order = await create_order(
        amount=body.amount,
        currency=body.currency,
        description=body.description,
    )

    mandate = db.query(Mandate).filter(Mandate.id == body.mandate_id).first()

    txn = Transaction(
        id=generate_id("txn"),
        product_title=body.description,
        amount=body.amount,
        currency=body.currency,
        category="",
        mandate_name=mandate.name if mandate else "",
        mandate_id=body.mandate_id,
        payment_status="PENDING",
        date=datetime.now(timezone.utc).isoformat(),
        decision_reason="PayPal order created — awaiting buyer checkout approval",
        paypal_order_id=order["order_id"],
    )
    db.add(txn)
    db.commit()

    return PayPalOrderResponse(
        order_id=order["order_id"],
        status=order["status"],
        approval_url=order.get("approval_url"),
        message=order.get("message"),
    )


@router.post("/capture-order", response_model=CapturePayPalOrderResponse)
async def capture_paypal_order(body: CapturePayPalOrderRequest, db: Session = Depends(get_db)):
    result = await capture_order(body.order_id)

    txn = db.query(Transaction).filter(Transaction.paypal_order_id == body.order_id).first()
    if txn:
        txn.payment_status = "COMPLETED" if result["success"] else "FAILED"
        if result["success"] and txn.mandate_id:
            mandate = db.query(Mandate).filter(Mandate.id == txn.mandate_id).first()
            if mandate:
                mandate.spent_amount += txn.amount
                mandate.remaining_budget = max(0, mandate.total_budget - mandate.spent_amount)
    db.commit()

    return CapturePayPalOrderResponse(
        success=result["success"],
        order_id=result["order_id"],
        status=result["status"],
    )


@router.post("/webhook")
async def paypal_webhook(event: PayPalWebhookEvent, db: Session = Depends(get_db)):
    order_id = event.resource.get("id", "")
    txn = db.query(Transaction).filter(Transaction.paypal_order_id == order_id).first()

    if event.event_type == "PAYMENT.CAPTURE.COMPLETED":
        if txn and txn.payment_status == "PENDING":
            txn.payment_status = "COMPLETED"
            txn.decision_reason = "Confirmed via PayPal webhook (PAYMENT.CAPTURE.COMPLETED)"
            if txn.mandate_id:
                mandate = db.query(Mandate).filter(Mandate.id == txn.mandate_id).first()
                if mandate:
                    mandate.spent_amount += txn.amount
                    mandate.remaining_budget = max(0, mandate.total_budget - mandate.spent_amount)
            db.commit()
    elif event.event_type == "PAYMENT.CAPTURE.DENIED":
        if txn and txn.payment_status == "PENDING":
            txn.payment_status = "FAILED"
            txn.decision_reason = "Payment denied via PayPal webhook (PAYMENT.CAPTURE.DENIED)"
            db.commit()

    return {"status": "received", "event_id": event.id}
