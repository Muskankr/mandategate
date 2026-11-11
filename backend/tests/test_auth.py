def test_register(client):
    resp = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepass123",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["id"].startswith("usr_")


def test_register_duplicate_username(client):
    client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test1@example.com",
        "password": "pass123",
    })
    resp = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test2@example.com",
        "password": "pass456",
    })
    assert resp.status_code == 400


def test_login(client):
    client.post("/api/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "mypassword",
    })
    resp = client.post("/api/auth/login", json={
        "username": "loginuser",
        "password": "mypassword",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "username": "user2",
        "email": "user2@example.com",
        "password": "correct",
    })
    resp = client.post("/api/auth/login", json={
        "username": "user2",
        "password": "wrong",
    })
    assert resp.status_code == 401


def test_me_endpoint(client):
    client.post("/api/auth/register", json={
        "username": "meuser",
        "email": "me@example.com",
        "password": "password123",
    })
    login_resp = client.post("/api/auth/login", json={
        "username": "meuser",
        "password": "password123",
    })
    token = login_resp.json()["access_token"]

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["username"] == "meuser"


def test_me_without_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401
