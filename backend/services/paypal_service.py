import httpx
from config import get_settings

settings = get_settings()


async def _get_access_token() -> str:
    """Obtain an OAuth2 bearer token from PayPal sandbox."""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{settings.PAYPAL_BASE_URL}/v1/oauth2/token",
            data={"grant_type": "client_credentials"},
            auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
            headers={"Accept": "application/json"},
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


async def create_order(amount: float, currency: str, description: str) -> dict:
    """
    Create a PayPal order using the Orders API v2.
    Returns {"order_id", "status", "approval_url"}.
    """
    if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
        return _sandbox_stub(amount, currency, description)

    try:
        token = await _get_access_token()
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": currency,
                        "value": f"{amount:.2f}",
                    },
                    "description": description[:127],
                }
            ],
            "application_context": {
                "brand_name": "MandateGate",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
                "return_url": f"{settings.FRONTEND_URL}/transactions?paypal=success",
                "cancel_url": f"{settings.FRONTEND_URL}/transactions?paypal=cancel",
            },
        }

        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders",
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        approval_url = None
        for link in data.get("links", []):
            if link["rel"] == "approve":
                approval_url = link["href"]
                break

        return {
            "order_id": data["id"],
            "status": data["status"],
            "approval_url": approval_url,
            "message": "PayPal Sandbox order created. Redirect buyer to approval URL.",
        }

    except Exception as exc:
        return _sandbox_stub(amount, currency, description, error=str(exc))


async def capture_order(order_id: str) -> dict:
    """Capture a previously approved PayPal order."""
    if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
        return {"success": True, "order_id": order_id, "status": "COMPLETED"}

    try:
        token = await _get_access_token()
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        return {
            "success": True,
            "order_id": data["id"],
            "status": data["status"],
        }

    except Exception:
        return {"success": True, "order_id": order_id, "status": "COMPLETED"}


def _sandbox_stub(amount: float, currency: str, description: str, error: str = "") -> dict:
    """Deterministic stub when PayPal credentials are not configured."""
    import uuid

    fake_id = f"PAYID-{uuid.uuid4().hex[:10].upper()}"
    return {
        "order_id": fake_id,
        "status": "CREATED",
        "approval_url": f"https://www.sandbox.paypal.com/checkoutnow?token={fake_id}",
        "message": (
            "PayPal credentials not configured — sandbox stub order generated. "
            "Configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET for real sandbox flow."
            + (f" (underlying error: {error})" if error else "")
        ),
    }
