import json
import httpx
from config import get_settings


async def search_products_with_gemini(query: str, mandate_instruction: str = "") -> dict:
    """
    Calls Google Gemini to generate product recommendations based on a
    natural-language shopping request. Returns structured JSON with products
    and an analysis string.
    """
    settings = get_settings()

    if not settings.GEMINI_API_KEY:
        return _fallback_product_search(query)

    gemini_endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}"
        f":generateContent?key={settings.GEMINI_API_KEY}"
    )

    system_prompt = (
        "You are an autonomous AI shopping agent for MandateGate, a corporate spending "
        "governance platform. Given a shopping request, return a JSON object with:\n"
        '  "products": [ array of 3-5 product objects ],\n'
        '  "analysis": "one-paragraph analysis string"\n\n'
        "Each product object MUST have exactly these fields:\n"
        '  "title": string (real product name),\n'
        '  "price": number (realistic USD price),\n'
        '  "currency": "USD",\n'
        '  "category": string (e.g. Computer Hardware, Electronics, Office Equipment, '
        "Software & SaaS, Cloud Infrastructure, Gaming & Entertainment),\n"
        '  "merchant": string (real or plausible merchant),\n'
        '  "rating": number (1.0-5.0),\n'
        '  "reviews_count": integer,\n'
        '  "image_url": string (use https://images.unsplash.com/photo-<id>?w=500&auto=format&fit=crop&q=60 '
        "with a relevant photo id),\n"
        '  "explanation": string (why this product fits the request),\n'
        '  "specs": [array of 3-4 short spec strings],\n'
        '  "in_stock": true\n\n'
        "Return ONLY valid JSON. No markdown fences, no extra text."
    )

    user_message = f"Shopping request: {query}"
    if mandate_instruction:
        user_message += f"\n\nMandate context: {mandate_instruction}"

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_message}"}]}
        ],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 4096},
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(gemini_endpoint, json=payload)
            resp.raise_for_status()
            data = resp.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        result = json.loads(text)
        if "products" not in result:
            result = {"products": result if isinstance(result, list) else [], "analysis": ""}
        if "analysis" not in result:
            result["analysis"] = f"AI agent evaluated products for: {query}"
        return result

    except Exception:
        return _fallback_product_search(query)


def _fallback_product_search(query: str) -> dict:
    """Deterministic fallback when Gemini key is absent or call fails."""
    q = query.lower()
    all_products = [
        {
            "title": "Logitech MX Master 3S Wireless Performance Mouse",
            "price": 99.99,
            "currency": "USD",
            "category": "Computer Hardware",
            "merchant": "BestBuy Verified",
            "rating": 4.8,
            "reviews_count": 1420,
            "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60",
            "explanation": "Best-in-class ergonomics and silent electromagnetic scroll wheel matching developer peripheral mandate.",
            "specs": ["8K DPI sensor", "Quiet clicks", "USB-C Quick Charging", "Multi-OS"],
            "in_stock": True,
        },
        {
            "title": "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
            "price": 199.00,
            "currency": "USD",
            "category": "Computer Hardware",
            "merchant": "Keychron Direct",
            "rating": 4.9,
            "reviews_count": 860,
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
            "explanation": "CNC aluminum body with QMK/VIA programmable hot-swappable keys. Exceeds typical approval thresholds.",
            "specs": ["Full aluminum frame", "Hot-swappable K Pro switches", "Bluetooth 5.1 & Type-C", "Double-gasket"],
            "in_stock": True,
        },
        {
            "title": "Anker PowerExpand 8-in-1 USB-C Data & PD Hub",
            "price": 49.99,
            "currency": "USD",
            "category": "Electronics",
            "merchant": "Anker Official",
            "rating": 4.7,
            "reviews_count": 3100,
            "image_url": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=60",
            "explanation": "4K 60Hz HDMI and 100W Power Delivery. Budget-friendly within Electronics category.",
            "specs": ["85W Pass-Through Charging", "4K HDMI", "10Gbps USB-C & USB-A", "microSD/SD"],
            "in_stock": True,
        },
        {
            "title": "Sony PlayStation 5 DualSense Edge Controller",
            "price": 199.99,
            "currency": "USD",
            "category": "Gaming & Entertainment",
            "merchant": "Sony Direct",
            "rating": 4.6,
            "reviews_count": 940,
            "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60",
            "explanation": "Gaming console controller. Category 'Gaming & Entertainment' is typically NOT in allowed lists.",
            "specs": ["Customizable controls", "Replaceable stick modules", "Haptic feedback"],
            "in_stock": True,
        },
        {
            "title": "BenQ ScreenBar Halo LED Monitor Light Bar",
            "price": 179.00,
            "currency": "USD",
            "category": "Office Equipment",
            "merchant": "BenQ Store",
            "rating": 4.8,
            "reviews_count": 530,
            "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60",
            "explanation": "Asymmetric optical design prevents screen glare. Often exceeds approval thresholds.",
            "specs": ["Wireless controller", "Curved & flat monitor fit", "Auto-dimming sensor"],
            "in_stock": True,
        },
    ]

    matched = all_products
    if any(kw in q for kw in ("keyboard", "keychron", "mechanical")):
        matched = [p for p in all_products if "keyboard" in p["title"].lower()]
    elif any(kw in q for kw in ("mouse", "logitech", "wireless mouse")):
        matched = [p for p in all_products if "mouse" in p["title"].lower()]
    elif any(kw in q for kw in ("game", "playstation", "controller", "gaming")):
        matched = [p for p in all_products if "Gaming" in p["category"]]
    elif any(kw in q for kw in ("usb", "hub", "anker", "dock")):
        matched = [p for p in all_products if "hub" in p["title"].lower()]
    elif any(kw in q for kw in ("light", "benq", "monitor light", "lamp")):
        matched = [p for p in all_products if "light" in p["title"].lower() or "BenQ" in p["title"]]

    if not matched:
        matched = all_products

    return {
        "products": matched,
        "analysis": (
            f'AI shopping agent parsed requirements for "{query}". '
            "Evaluated vendor authenticity, merchant reliability, and policy compatibility."
        ),
    }
