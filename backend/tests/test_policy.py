def test_policy_blocked_category(client, sample_mandate):
    m = client.post("/api/mandates", json=sample_mandate).json()

    product_resp = client.post("/api/agent/execute", json={"query": "gaming controller"})
    assert product_resp.status_code == 200
    products = product_resp.json()["products"]

    gaming = next((p for p in products if "Gaming" in p.get("category", "")), None)
    if gaming:
        resp = client.post("/api/policy/evaluate", json={
            "product_id": gaming["id"],
            "mandate_id": m["id"],
            "amount": gaming["price"],
            "category": gaming["category"],
        })
        assert resp.status_code == 200
        assert resp.json()["decision"] == "BLOCKED"


def test_policy_allowed(client, sample_mandate):
    m = client.post("/api/mandates", json=sample_mandate).json()

    product_resp = client.post("/api/agent/execute", json={"query": "usb hub"})
    products = product_resp.json()["products"]

    hw = next((p for p in products if p.get("category") in ["Computer Hardware", "Electronics"]), None)
    if hw and hw["price"] <= sample_mandate["approval_threshold"]:
        resp = client.post("/api/policy/evaluate", json={
            "product_id": hw["id"],
            "mandate_id": m["id"],
            "amount": hw["price"],
            "category": hw["category"],
        })
        assert resp.status_code == 200
        assert resp.json()["decision"] == "ALLOWED"


def test_policy_approval_required(client, sample_mandate):
    m = client.post("/api/mandates", json=sample_mandate).json()

    product_resp = client.post("/api/agent/execute", json={"query": "keyboard"})
    products = product_resp.json()["products"]

    expensive = next(
        (p for p in products if p.get("price", 0) > sample_mandate["approval_threshold"]
         and p.get("category") in sample_mandate["allowed_categories"]),
        None,
    )
    if expensive:
        resp = client.post("/api/policy/evaluate", json={
            "product_id": expensive["id"],
            "mandate_id": m["id"],
            "amount": expensive["price"],
            "category": expensive["category"],
        })
        assert resp.status_code == 200
        assert resp.json()["decision"] == "APPROVAL_REQUIRED"
