def test_list_mandates_empty(client):
    resp = client.get("/api/mandates")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_mandate(client, sample_mandate):
    resp = client.post("/api/mandates", json=sample_mandate)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == sample_mandate["name"]
    assert data["total_budget"] == 1000.0
    assert data["remaining_budget"] == 1000.0
    assert data["status"] == "ACTIVE"
    assert data["id"].startswith("mnd_")


def test_list_mandates_after_create(client, sample_mandate):
    client.post("/api/mandates", json=sample_mandate)
    resp = client.get("/api/mandates")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_revoke_mandate(client, sample_mandate):
    create_resp = client.post("/api/mandates", json=sample_mandate)
    mandate_id = create_resp.json()["id"]

    resp = client.post(f"/api/mandates/{mandate_id}/revoke")
    assert resp.status_code == 200
    assert resp.json()["success"] is True

    mandates = client.get("/api/mandates").json()
    assert mandates[0]["status"] == "REVOKED"


def test_revoke_nonexistent_mandate(client):
    resp = client.post("/api/mandates/mnd_nonexistent/revoke")
    assert resp.status_code == 404


def test_update_mandate(client, sample_mandate):
    create_resp = client.post("/api/mandates", json=sample_mandate)
    mandate_id = create_resp.json()["id"]

    resp = client.put(
        f"/api/mandates/{mandate_id}",
        json={"name": "Updated Name", "total_budget": 2000.0},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Updated Name"
    assert data["total_budget"] == 2000.0
    assert data["remaining_budget"] == 2000.0


def test_update_revoked_mandate_fails(client, sample_mandate):
    create_resp = client.post("/api/mandates", json=sample_mandate)
    mandate_id = create_resp.json()["id"]
    client.post(f"/api/mandates/{mandate_id}/revoke")

    resp = client.put(f"/api/mandates/{mandate_id}", json={"name": "Should Fail"})
    assert resp.status_code == 400


def test_delete_mandate(client, sample_mandate):
    create_resp = client.post("/api/mandates", json=sample_mandate)
    mandate_id = create_resp.json()["id"]

    resp = client.delete(f"/api/mandates/{mandate_id}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True

    mandates = client.get("/api/mandates").json()
    assert mandates[0]["status"] == "DELETED"


def test_delete_nonexistent_mandate(client):
    resp = client.delete("/api/mandates/mnd_nonexistent")
    assert resp.status_code == 404
