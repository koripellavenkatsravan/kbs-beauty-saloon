"""Iteration 6 regression tests: manager password, checkout w/o tax, cart dedup, QR."""
import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://elegant-salon-app.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ---------- Manager auth ----------
class TestManagerAuth:
    def test_manager_login_old_password_rejected(self):
        r = requests.post(f"{API}/manager/login", json={"password": "kbs@admin2026"})
        assert r.status_code == 401

    def test_manager_login_new_password_accepted(self):
        r = requests.post(f"{API}/manager/login", json={"password": "sravan2003"})
        assert r.status_code == 200
        assert r.json()["token"] == "sravan2003"

    def test_manager_endpoint_requires_new_token(self):
        r = requests.get(f"{API}/manager/stats", headers={"X-Manager-Token": "kbs@admin2026"})
        assert r.status_code == 401
        r2 = requests.get(f"{API}/manager/stats", headers={"X-Manager-Token": "sravan2003"})
        assert r2.status_code == 200


# ---------- Admin user unchanged ----------
class TestAdminUser:
    def test_admin_login_still_works(self):
        r = requests.post(f"{API}/auth/login", json={"email": "admin@kbs.com", "password": "kbs@admin2026"})
        assert r.status_code == 200
        assert "token" in r.json()


# ---------- Customer setup ----------
@pytest.fixture(scope="module")
def customer_auth():
    email = f"iter6_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Iter6 Tester"})
    assert r.status_code == 200
    token = r.json()["token"]
    return {"Authorization": f"Bearer {token}"}, r.json()["user"]


# ---------- Cart add: verify single add (backend allows dup pushes, so we test each POST adds 1) ----------
class TestCartAdd:
    def test_add_cart_pushes_one(self, customer_auth):
        headers, _ = customer_auth
        requests.post(f"{API}/cart/clear", headers=headers)
        # Get a bridal service
        services = requests.get(f"{API}/services").json()
        bridal = next(s for s in services if s["category"] == "Bridal & Groom")
        item = {"service_id": bridal["id"], "name": bridal["name"], "price": bridal["price"]}
        r = requests.post(f"{API}/cart/add", json=item, headers=headers)
        assert r.status_code == 200
        cart = requests.get(f"{API}/cart", headers=headers).json()
        assert len(cart["items"]) == 1
        requests.post(f"{API}/cart/clear", headers=headers)


# ---------- Checkout: no tax, total == subtotal - discount ----------
class TestCheckoutNoTax:
    def test_checkout_no_tax_field(self, customer_auth):
        headers, _ = customer_auth
        requests.post(f"{API}/cart/clear", headers=headers)
        services = requests.get(f"{API}/services").json()
        s = services[0]
        item = {"service_id": s["id"], "name": s["name"], "price": s["price"]}
        requests.post(f"{API}/cart/add", json=item, headers=headers)

        r = requests.post(f"{API}/orders/checkout", json={"stylist": "Any Available"}, headers=headers)
        assert r.status_code == 200
        order = r.json()["order"]
        assert "tax" not in order, f"tax field should be gone: {order}"
        assert order["subtotal"] == s["price"]
        assert order["total"] == order["subtotal"] - order["discount"]
        # Also ensure NOT the old *1.18 math
        assert order["total"] != int(order["subtotal"] * 1.18)

        # QR endpoint returns PNG
        qr = requests.get(f"{API}/orders/{order['id']}/qr")
        assert qr.status_code == 200
        assert qr.headers.get("content-type", "").startswith("image/png")


# ---------- Payment info still exposes UPI ----------
class TestPaymentInfo:
    def test_payment_info_upi(self):
        r = requests.get(f"{API}/payment/info")
        assert r.status_code == 200
        d = r.json()
        assert d["upi_id"] == "pkoripella@ybl"
