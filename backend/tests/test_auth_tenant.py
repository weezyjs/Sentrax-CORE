from app.models.user import User
from app.core.security import hash_password


def test_bootstrap_super_admin(client, db_session):
    response = client.post("/auth/bootstrap-super-admin", json={"email": "root@example.com", "password": "Secret123"})
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token


def test_tenant_isolation(client, db_session):
    client.post("/auth/bootstrap-super-admin", json={"email": "root2@example.com", "password": "Secret123"})
    login = client.post("/auth/login", json={"email": "root2@example.com", "password": "Secret123"})
    token = login.json()["access_token"]
    org = client.post("/orgs", json={"name": "Acme"}, headers={"Authorization": f"Bearer {token}"}).json()
    user = User(email="analyst@acme.io", hashed_password=hash_password("Secret123"), role="ANALYST", org_id=org["id"])
    db_session.add(user)
    db_session.commit()
    login_user = client.post("/auth/login", json={"email": "analyst@acme.io", "password": "Secret123"}).json()
    analyst_token = login_user["access_token"]
    create_target = client.post(
        "/targets",
        json={"target_type": "email", "value": "security@acme.io"},
        headers={"Authorization": f"Bearer {analyst_token}", "X-Org-Id": org["id"]},
    )
    assert create_target.status_code == 200

    response = client.get(
        "/targets",
        headers={"Authorization": f"Bearer {analyst_token}", "X-Org-Id": "other-org"},
    )
    assert response.status_code == 403
