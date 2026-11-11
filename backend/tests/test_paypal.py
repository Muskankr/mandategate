def test_create_paypal_order(client, sample_mandate):
    m = client.post("/api/mandates", json=sample_mandate).json()

    resp = client.post("/api/paypal/create-order", json={
        "product_id": "prd_test",
        "mandate_id": m["id"],
        "amount": 49.99,
        "currency": "USD",
        "description": "Test product order",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "order_id" in data
    assert data["status"] in ["CREATED", "COMPLETED"]


def test_capture_paypal_order(client, sample_mandate):
    m = client.post("/api/mandates", json=sample_mandate).json()

    create_resp = client.post("/api/paypal/create-order", json={
        "product_id": "prd_test",
        "mandate_id": m["id"],
        "amount": 49.99,
        "currency": "USD",
        "description": "Test product capture",
    })
    order_id = create_resp.json()["order_id"]

    resp = client.post("/api/paypal/capture-order", json={"order_id": order_id})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["order_id"] == order_id


def test_webhook_capture_completed(client, sample_mandate):
    m = client.post("/api/mandates", json=sample_mandate).json()

    create_resp = client.post("/api/paypal/create-order", json={
        "product_id": "prd_test",
        "mandate_id": m["id"],
        "amount": 99.99,
        "currency": "USD",
        "description": "Webhook test",
    })
    order_id = create_resp.json()["order_id"]

    resp = client.post("/api/paypal/webhook", json={
        "id": "WH-TEST-001",
        "event_type": "PAYMENT.CAPTURE.COMPLETED",
        "resource": {"id": order_id},
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "received"


def test_transactions_list(client):
    resp = client.get("/api/transactions")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_dashboard_metrics(client):
    resp = client.get("/api/dashboard/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_budget" in data
    assert "active_mandates" in data
