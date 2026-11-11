from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Mandate, generate_id
from schemas import MandateCreate, MandateOut, MandateUpdate

router = APIRouter(prefix="/api/mandates", tags=["Mandates"])


@router.get("", response_model=list[MandateOut])
def list_mandates(db: Session = Depends(get_db)):
    mandates = db.query(Mandate).order_by(Mandate.created_at.desc()).all()
    return mandates


@router.post("", response_model=MandateOut, status_code=201)
def create_mandate(body: MandateCreate, db: Session = Depends(get_db)):
    mandate = Mandate(
        id=generate_id("mnd"),
        name=body.name,
        instruction=body.instruction,
        total_budget=body.total_budget,
        spent_amount=0.0,
        remaining_budget=body.total_budget,
        currency=body.currency,
        allowed_categories=body.allowed_categories,
        approval_threshold=body.approval_threshold,
        expiry_date=body.expiry_date,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(mandate)
    db.commit()
    db.refresh(mandate)
    return mandate


@router.put("/{mandate_id}", response_model=MandateOut)
def update_mandate(mandate_id: str, body: MandateUpdate, db: Session = Depends(get_db)):
    mandate = db.query(Mandate).filter(Mandate.id == mandate_id).first()
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found")
    if mandate.status != "ACTIVE":
        raise HTTPException(status_code=400, detail="Only ACTIVE mandates can be updated")

    update_data = body.model_dump(exclude_unset=True)
    if "total_budget" in update_data:
        new_budget = update_data["total_budget"]
        mandate.total_budget = new_budget
        mandate.remaining_budget = max(0, new_budget - mandate.spent_amount)
    for field, value in update_data.items():
        if field != "total_budget":
            setattr(mandate, field, value)
    db.commit()
    db.refresh(mandate)
    return mandate


@router.delete("/{mandate_id}")
def delete_mandate(mandate_id: str, db: Session = Depends(get_db)):
    mandate = db.query(Mandate).filter(Mandate.id == mandate_id).first()
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found")
    mandate.status = "DELETED"
    db.commit()
    return {"success": True, "id": mandate_id}


@router.post("/{mandate_id}/revoke")
def revoke_mandate(mandate_id: str, db: Session = Depends(get_db)):
    mandate = db.query(Mandate).filter(Mandate.id == mandate_id).first()
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found")
    mandate.status = "REVOKED"
    db.commit()
    return {"success": True, "id": mandate_id}
