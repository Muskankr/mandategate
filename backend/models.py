import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


def generate_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


class Mandate(Base):
    __tablename__ = "mandates"

    id = Column(String, primary_key=True, default=lambda: generate_id("mnd"))
    name = Column(String, nullable=False)
    instruction = Column(Text, nullable=False)
    total_budget = Column(Float, nullable=False)
    spent_amount = Column(Float, default=0.0)
    remaining_budget = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    allowed_categories = Column(JSON, nullable=False)
    approval_threshold = Column(Float, nullable=False)
    expiry_date = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())

    approvals = relationship("ApprovalRequest", back_populates="mandate")
    transactions = relationship("Transaction", back_populates="mandate")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: generate_id("prd"))
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    category = Column(String, nullable=False)
    merchant = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    image_url = Column(String, default="")
    explanation = Column(Text, default="")
    specs = Column(JSON, default=list)
    in_stock = Column(Integer, default=1)


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String, primary_key=True, default=lambda: generate_id("app"))
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    mandate_id = Column(String, ForeignKey("mandates.id"), nullable=False)
    mandate_name = Column(String, nullable=False)
    mandate_remaining_budget = Column(Float, default=0.0)
    ai_recommendation = Column(Text, default="")
    status = Column(String, default="PENDING")
    created_at = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())
    policy_trigger = Column(String, default="")

    mandate = relationship("Mandate", back_populates="approvals")
    product = relationship("Product")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: generate_id("txn"))
    product_title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    category = Column(String, default="")
    mandate_name = Column(String, default="")
    mandate_id = Column(String, ForeignKey("mandates.id"), nullable=False)
    payment_status = Column(String, default="PENDING")
    date = Column(String, default=lambda: datetime.now(timezone.utc).isoformat())
    decision_reason = Column(Text, default="")
    paypal_order_id = Column(String, nullable=True)

    mandate = relationship("Mandate", back_populates="transactions")
