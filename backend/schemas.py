from pydantic import BaseModel, Field
from typing import Literal, Optional


# ── Mandate ──────────────────────────────────────────────

class MandateCreate(BaseModel):
    name: str
    instruction: str
    total_budget: float
    currency: str = "USD"
    allowed_categories: list[str]
    approval_threshold: float
    expiry_date: str


class MandateOut(BaseModel):
    id: str
    name: str
    instruction: str
    total_budget: float
    spent_amount: float
    remaining_budget: float
    currency: str
    allowed_categories: list[str]
    approval_threshold: float
    expiry_date: str
    status: str
    created_at: str

    model_config = {"from_attributes": True}


# ── Product ──────────────────────────────────────────────

class ProductOut(BaseModel):
    id: str
    title: str
    price: float
    currency: str
    category: str
    merchant: str
    rating: float
    reviews_count: Optional[int] = 0
    image_url: str
    explanation: str
    specs: Optional[list[str]] = []
    in_stock: bool

    model_config = {"from_attributes": True}


# ── Agent ────────────────────────────────────────────────

class AgentExecuteRequest(BaseModel):
    query: str
    mandate_id: Optional[str] = None


class AgentExecuteResponse(BaseModel):
    products: list[ProductOut]
    analysis: str


# ── Policy Engine ────────────────────────────────────────

class PolicyEvaluateRequest(BaseModel):
    product_id: str
    mandate_id: str
    amount: float
    category: str


class PurchaseDecision(BaseModel):
    decision: str  # ALLOWED | APPROVAL_REQUIRED | BLOCKED
    amount: float
    reason: str
    requires_approval: bool
    product_id: Optional[str] = None
    mandate_id: Optional[str] = None
    suggested_action: Optional[str] = None


# ── Approval ─────────────────────────────────────────────

class ApprovalRequestOut(BaseModel):
    id: str
    product: ProductOut
    amount: float
    currency: str
    mandate_id: str
    mandate_name: str
    mandate_remaining_budget: float
    ai_recommendation: str
    status: str
    created_at: str
    policy_trigger: Optional[str] = None

    model_config = {"from_attributes": True}


class ApprovalActionRequest(BaseModel):
    action: Literal["approve", "reject"] = "approve"


class PayPalOrderResponse(BaseModel):
    order_id: str
    status: str
    approval_url: Optional[str] = None
    message: Optional[str] = None


class ApprovalActionResponse(BaseModel):
    success: bool
    approval_id: str
    status: str
    payment: Optional[PayPalOrderResponse] = None


# ── Transaction ──────────────────────────────────────────

class TransactionOut(BaseModel):
    id: str
    product_title: str
    amount: float
    currency: str
    category: str
    mandate_name: str
    mandate_id: str
    payment_status: str
    date: str
    decision_reason: str
    paypal_order_id: Optional[str] = None

    model_config = {"from_attributes": True}


# ── PayPal ───────────────────────────────────────────────

class CreatePayPalOrderRequest(BaseModel):
    product_id: str
    mandate_id: str
    amount: float
    currency: str
    description: str


class CapturePayPalOrderRequest(BaseModel):
    order_id: str


class CapturePayPalOrderResponse(BaseModel):
    success: bool
    order_id: str
    status: str


# ── Dashboard ────────────────────────────────────────────

class AIActivity(BaseModel):
    id: str
    action: str
    details: str
    timestamp: str
    type: str


class SpendingTrend(BaseModel):
    date: str
    amount: float
    budget_cap: float


class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str


class DashboardMetrics(BaseModel):
    total_budget: float
    total_spent: float
    remaining_budget: float
    active_mandates: int
    pending_approvals: int
    recent_transactions: list[TransactionOut]
    spending_trend: list[SpendingTrend]
    category_breakdown: list[CategoryBreakdown]
    ai_activity: list[AIActivity]
