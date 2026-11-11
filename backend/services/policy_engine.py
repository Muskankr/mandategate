from datetime import datetime, timezone
from models import Mandate
from schemas import PurchaseDecision


def evaluate_purchase(
    mandate: Mandate,
    product_id: str,
    amount: float,
    category: str,
) -> PurchaseDecision:
    """
    Deterministic spending policy engine.
    Checks (in order): mandate status, expiry, category, budget, threshold.
    """
    if mandate.status != "ACTIVE":
        return PurchaseDecision(
            decision="BLOCKED",
            amount=amount,
            reason=f"Mandate '{mandate.name}' is not active (status: {mandate.status}).",
            requires_approval=False,
            mandate_id=mandate.id,
            product_id=product_id,
        )

    # 0. Expiry check
    try:
        expiry_str = mandate.expiry_date.replace("Z", "+00:00")
        expiry_dt = datetime.fromisoformat(expiry_str)
        if expiry_dt < datetime.now(timezone.utc):
            return PurchaseDecision(
                decision="BLOCKED",
                amount=amount,
                reason=f"Mandate '{mandate.name}' has expired ({mandate.expiry_date}).",
                requires_approval=False,
                mandate_id=mandate.id,
                product_id=product_id,
            )
    except (ValueError, TypeError):
        pass

    # 1. Category check
    allowed = [c.lower() for c in (mandate.allowed_categories or [])]
    if category.lower() not in allowed:
        return PurchaseDecision(
            decision="BLOCKED",
            amount=amount,
            reason=(
                f"Category '{category}' is not permitted by mandate '{mandate.name}'. "
                f"Permitted categories: {', '.join(mandate.allowed_categories)}."
            ),
            requires_approval=False,
            mandate_id=mandate.id,
            product_id=product_id,
        )

    # 2. Budget check
    if amount > mandate.remaining_budget:
        return PurchaseDecision(
            decision="BLOCKED",
            amount=amount,
            reason=(
                f"Insufficient remaining budget. Purchase amount (${amount:.2f}) "
                f"exceeds remaining balance (${mandate.remaining_budget:.2f})."
            ),
            requires_approval=False,
            mandate_id=mandate.id,
            product_id=product_id,
        )

    # 3. Threshold check
    if amount > mandate.approval_threshold:
        return PurchaseDecision(
            decision="APPROVAL_REQUIRED",
            amount=amount,
            reason=(
                f"Purchase amount (${amount:.2f}) exceeds auto-approval threshold "
                f"(${mandate.approval_threshold:.2f}). Human confirmation required."
            ),
            requires_approval=True,
            mandate_id=mandate.id,
            product_id=product_id,
            suggested_action="Forward to Approval Center",
        )

    # 4. Fully allowed
    return PurchaseDecision(
        decision="ALLOWED",
        amount=amount,
        reason=(
            f"Complies with mandate bounds. Permitted category and amount (${amount:.2f}) "
            f"is below auto-approval limit (${mandate.approval_threshold:.2f})."
        ),
        requires_approval=False,
        mandate_id=mandate.id,
        product_id=product_id,
        suggested_action="Ready for PayPal Checkout",
    )
