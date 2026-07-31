"""Iter 7 regression: loyalty removal, checkout schema, manager/admin auth."""
import os
import uuid
import pytest
import requests
from datetime import date, timedelta

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE}/api"
MANAGER_PW = "sravan2003"
ADMIN_EMAIL = "admin@kbs.com"
ADMIN_PW = "kbs@admin2026"


@pytest.fixture(scope="module")
def customer():
    email = f"iter7_{uuid.uuid4().hex[:6]}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "secret123", "name": "TEST_Iter7",
        "phone": "9000000000"
    }, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    return {"token": data["token"], "user": data["user"], "email": email}


def auth_hdr(token):
    return {"Authorization": f"Bearer {token}"}


# ---- Auth / regressions ----
def test_manager_new_password():
    r = requests.post(f"{API}/manager/login", json={"password": MANAGER_PW}, timeout=30)
    assert r.status_code == 200
    assert r.json().get("token") == MANAGER_PW


def test_manager_old_password_rejected():
    r = requests.post(f"{API}/manager/login", json={"password": "kbs@admin2026"}, timeout=30)
    assert r.status_code == 401


def test_admin_login():
    r = requests.post(f"{API}/auth/login", json={
        "email": ADMIN_EMAIL, "password": ADMIN_PW
    }, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data
    assert data["user"]["email"] == ADMIN_EMAIL


def test_register_response_backwards_compat(customer):
    # register may still include loyalty_points; ok, but user must work
    assert "id" in customer["user"]
    assert customer["user"]["email"] == customer["email"]


# ---- Checkout schema (no loyalty/tax/discount) ----
def test_checkout_schema_no_loyalty(customer):
    token = customer["token"]
    # Add service
    svcs = requests.get(f"{API}/services", timeout=30).json()
    svc = next(s for s in svcs if s.get("available"))
    add = requests.post(f"{API}/cart/add",
                       json={"service_id": svc["id"], "name": svc["name"], "price": svc["price"]},
                       headers=auth_hdr(token), timeout=30)
    assert add.status_code == 200, add.text

    future = (date.today() + timedelta(days=5)).isoformat()
    r = requests.post(f"{API}/orders/checkout", json={
        "stylist": "Any Available", "date": future, "time": "11:00", "notes": "iter7"
    }, headers=auth_hdr(token), timeout=60)
    assert r.status_code == 200, r.text
    body = r.json()

    # Response top-level must be only {"order": {...}}
    assert set(body.keys()) == {"order"}, f"unexpected top-level keys: {list(body.keys())}"

    order = body["order"]
    expected_keys = {"id", "user_id", "email", "name", "items", "subtotal", "total",
                     "stylist", "date", "time", "notes", "status", "payment_method", "created_at"}
    actual = set(order.keys())
    missing = expected_keys - actual
    extra = actual - expected_keys
    assert not missing, f"missing keys: {missing}"
    # Forbidden keys
    for f in ["tax", "discount", "loyalty_points", "loyalty_rewarded", "gst"]:
        assert f not in order, f"forbidden key '{f}' present in order"
    assert not extra, f"extra unexpected keys: {extra}"

    # Math check: total == subtotal
    assert order["subtotal"] == svc["price"]
    assert order["total"] == order["subtotal"]
