"""
V5 feature tests: auth (register/login/me), stylists badges, cart, checkout,
QR endpoint, payment/info, booking user_id linking, manager orders.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
MGR = {"X-Manager-Token": "kbs@admin2026"}


# ---------- shared user (created once) ----------
@pytest.fixture(scope="module")
def new_user():
    email = f"test_{uuid.uuid4().hex[:8]}@kbs.com"
    password = "secret123"
    r = requests.post(f"{API}/auth/register",
                      json={"email": email, "password": password, "name": "TEST User", "phone": "9999999999"},
                      timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    return {"email": email, "password": password, "token": d["token"], "user": d["user"]}


@pytest.fixture
def auth_headers(new_user):
    return {"Authorization": f"Bearer {new_user['token']}"}


# ---------- AUTH ----------
class TestAuth:
    def test_register_returns_jwt_and_user(self, new_user):
        assert new_user["token"]
        u = new_user["user"]
        assert u["email"] == new_user["email"]
        assert u["role"] == "customer"
        assert u["loyalty_points"] == 0
        assert "password_hash" not in u

    def test_register_duplicate_409(self, new_user):
        r = requests.post(f"{API}/auth/register",
                          json={"email": new_user["email"], "password": "x", "name": "Dup"},
                          timeout=30)
        assert r.status_code == 409

    def test_login_correct(self, new_user):
        r = requests.post(f"{API}/auth/login",
                          json={"email": new_user["email"], "password": new_user["password"]},
                          timeout=30)
        assert r.status_code == 200
        assert r.json()["token"]

    def test_login_wrong(self, new_user):
        r = requests.post(f"{API}/auth/login",
                          json={"email": new_user["email"], "password": "WRONG"}, timeout=30)
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers, new_user):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == new_user["email"]
        assert "password_hash" not in u

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_me_bad_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer bad.token.here"}, timeout=30)
        assert r.status_code == 401

    def test_admin_login(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": "admin@kbs.com", "password": "kbs@admin2026"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "admin"


# ---------- STYLISTS ----------
class TestStylists:
    def test_stylists_v5(self):
        r = requests.get(f"{API}/stylists", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        by_name = {s["name"]: s for s in data}
        for n in ["Any Available", "Neeraj", "Bujji", "Naidu", "Aruna", "Akhil"]:
            assert n in by_name, f"missing stylist {n}"
        assert by_name["Neeraj"]["top_rated"] is True
        assert by_name["Neeraj"]["badge"] == "Master Stylist · 4.9 ★"
        assert by_name["Bujji"]["top_rated"] is True
        assert by_name["Bujji"]["badge"] == "Senior Colorist · 4.9 ★"


# ---------- CART ----------
class TestCart:
    def test_empty_cart(self, auth_headers):
        r = requests.get(f"{API}/cart", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert r.json().get("items") == []

    def test_add_remove_clear(self, auth_headers):
        svc = requests.get(f"{API}/services", timeout=30).json()[0]
        item = {"service_id": svc["id"], "name": svc["name"], "price": svc["price"]}
        r = requests.post(f"{API}/cart/add", json=item, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert any(i["service_id"] == svc["id"] for i in r.json()["items"])

        r = requests.post(f"{API}/cart/remove", json=item, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert not any(i["service_id"] == svc["id"] for i in r.json()["items"])

        # add again then clear
        requests.post(f"{API}/cart/add", json=item, headers=auth_headers, timeout=30)
        r = requests.post(f"{API}/cart/clear", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        r = requests.get(f"{API}/cart", headers=auth_headers, timeout=30)
        assert r.json()["items"] == []

    def test_cart_no_auth(self):
        r = requests.get(f"{API}/cart", timeout=30)
        assert r.status_code == 401


# ---------- CHECKOUT ----------
class TestCheckout:
    def test_empty_cart_400(self, auth_headers):
        requests.post(f"{API}/cart/clear", headers=auth_headers, timeout=30)
        r = requests.post(f"{API}/orders/checkout", json={}, headers=auth_headers, timeout=30)
        assert r.status_code == 400

    def test_checkout_math(self, auth_headers):
        svcs = requests.get(f"{API}/services", timeout=30).json()
        picks = [svcs[0], svcs[1]]
        subtotal = sum(s["price"] for s in picks)
        requests.post(f"{API}/cart/clear", headers=auth_headers, timeout=30)
        for s in picks:
            requests.post(f"{API}/cart/add",
                          json={"service_id": s["id"], "name": s["name"], "price": s["price"]},
                          headers=auth_headers, timeout=30)
        r = requests.post(f"{API}/orders/checkout", json={"stylist": "Neeraj"},
                          headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        order = body["order"]
        assert order["subtotal"] == subtotal
        assert order["tax"] == round(subtotal * 0.18)
        # New user starts with 0 loyalty → discount = 0
        assert order["discount"] == 0
        assert order["total"] == subtotal + order["tax"]
        # Reward = total // 100
        assert body["loyalty_rewarded"] == order["total"] // 100
        # loyalty updated
        assert body["loyalty_points"] == body["loyalty_rewarded"]
        # cart cleared
        cart = requests.get(f"{API}/cart", headers=auth_headers, timeout=30).json()
        assert cart["items"] == []
        # persist test-order id for later
        TestCheckout.order_id = order["id"]

    def test_qr_endpoint(self):
        oid = getattr(TestCheckout, "order_id", None)
        assert oid, "no order_id from previous test"
        r = requests.get(f"{API}/orders/{oid}/qr", timeout=30)
        assert r.status_code == 200
        assert r.headers.get("content-type") == "image/png"
        assert r.content[:8] == b"\x89PNG\r\n\x1a\n"


# ---------- PAYMENT INFO ----------
class TestPaymentInfo:
    def test_payment_info(self):
        r = requests.get(f"{API}/payment/info", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["upi_id"] == "pkoripella@ybl"
        assert d["bank_account"] == "00000041651112710"
        assert d["bank_ifsc"] == "SBIN0021144"
        assert d["whatsapp"] == "919494542999"


# ---------- BOOKING → user link ----------
class TestBookingLink:
    def test_booking_with_token(self, auth_headers, new_user):
        from datetime import date, timedelta
        fdate = (date.today() + timedelta(days=10)).isoformat()
        svcs = requests.get(f"{API}/services", timeout=30).json()[:1]
        payload = {
            "services": [{"id": s["id"], "name": s["name"], "price": s["price"]} for s in svcs],
            "stylist": "Neeraj", "date": fdate, "time": "13:00",
            "full_name": "TEST Linked", "phone": "9999999997",
            "email": new_user["email"], "state": "AP", "city": "Vizag", "notes": "linked",
        }
        r = requests.post(f"{API}/bookings", json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        # my-bookings should include this
        r = requests.get(f"{API}/auth/my-bookings", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        lst = r.json()
        assert any(b["date"] == fdate and b["time"] == "13:00" for b in lst)


# ---------- MANAGER ORDERS ----------
class TestManagerOrders:
    def test_list_and_update(self):
        r = requests.get(f"{API}/manager/orders", headers=MGR, timeout=30)
        assert r.status_code == 200
        orders = r.json()
        assert isinstance(orders, list)
        oid = getattr(TestCheckout, "order_id", None)
        if oid:
            r = requests.patch(f"{API}/manager/orders/{oid}",
                               json={"status": "Payment Verified"}, headers=MGR, timeout=30)
            assert r.status_code == 200
