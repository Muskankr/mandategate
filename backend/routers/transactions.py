from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Transaction
from schemas import TransactionOut

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("", response_model=list[TransactionOut])
def list_transactions(db: Session = Depends(get_db)):
    txns = db.query(Transaction).order_by(Transaction.date.desc()).all()
    return txns
