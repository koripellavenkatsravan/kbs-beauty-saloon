"""
Backend tests for KBS Beauty Saloon API.
Covers: services, stylists, available-slots, bookings, manager auth & CRUD.
"""
import os
import pytest
import requests
from datetime import date, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://elegant-salon-app.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
MANAGER_PW = "kbs@admin2026"
HDR = {"X-Manager-Token": MANAGER_PW}

FUTURE_DATE = (date.today() + timedelta(days=7)).isoformat()
BLOCK_DATE = (date.today() + timedelta(days=14)).isoformat()


# ------------- Public endpoints -------------
class TestPublic:
    def test_services_list(self):
        r = requests.get(f"{API}/services", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 100, f"expected 100+ services, got {len(data)}"
        s = data[0]
        for k in ["id", "name", "price", "category", "subcategory", "gender", "available"]:
            assert k in s, f"missing {k} in service schema"

    def test_stylists(self):
        r = requests.get(f"{API}/stylists", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6, f"expected 6 stylists, got {len(data)}"
        names = [s.get("name") if isinstance(s, dict) else s for s in data]
        assert any("Any Available" in str(n) for n in names), f"'Any Available' not in {names}"

    def test_available_slots(self):
        r = requests.get(f"{API}/available-slots", params={"date": FUTURE_DATE}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["date"] == FUTURE_DATE
        assert "slots" in data and isinstance(data["slots"], list) and len(data["slots"]) > 0
        assert data["day_blocked"] is False
        for slot in data["slots"]:
            assert "time" in slot and "available" in slot


# ------------- Booking creation -------------
class TestBooking:
    booking_id = None

    def test_create_booking(self):
        # Get real services first
        svcs = requests.get(f"{API}/services", timeout=30).json()[:2]
        picked = [{"id": s["id"], "name": s["name"], "price": s["price"]} for s in svcs]
        expected_total = sum(s["price"] for s in picked)
        payload = {
            "services": picked,
            "stylist": "Any Available",
            "date": FUTURE_DATE,
            "time": "11:30",
            "full_name": "TEST_Automation User",
            "phone": "9999999999",
            "email": "delivered@resend.dev",
            "state": "Andhra Pradesh",
            "city": "Visakhapatnam",
            "notes": "automation test",
        }
        r = requests.post(f"{API}/bookings", json=payload, timeout=60)
        assert r.status_code == 200, f"create booking failed: {r.status_code} {r.text}"
        data = r.json()
        assert data["status"] == "Pending"
        assert data["total"] == expected_total
        assert data["full_name"] == "TEST_Automation User"
        assert "id" in data
        TestBooking.booking_id = data["id"]


# ------------- Manager auth -------------
class TestManagerAuth:
    def test_login_wrong(self):
        r = requests.post(f"{API}/manager/login", json={"password": "wrong"}, timeout=30)
        assert r.status_code == 401

    def test_login_correct(self):
        r = requests.post(f"{API}/manager/login", json={"password": MANAGER_PW}, timeout=30)
        assert r.status_code == 200
        assert r.json().get("token") == MANAGER_PW

    def test_manager_endpoint_no_token(self):
        r = requests.get(f"{API}/manager/bookings", timeout=30)
        assert r.status_code == 401


# ------------- Manager bookings -------------
class TestManagerBookings:
    def test_list_bookings(self):
        r = requests.get(f"{API}/manager/bookings", headers=HDR, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_update_booking_status(self):
        bid = TestBooking.booking_id
        assert bid, "no booking id from prior test"
        r = requests.patch(f"{API}/manager/bookings/{bid}", json={"status": "Confirmed"}, headers=HDR, timeout=30)
        assert r.status_code == 200
        # verify persistence
        lst = requests.get(f"{API}/manager/bookings", headers=HDR, timeout=30).json()
        found = [b for b in lst if b["id"] == bid]
        assert found and found[0]["status"] == "Confirmed"

    def test_update_invalid_status(self):
        bid = TestBooking.booking_id
        r = requests.patch(f"{API}/manager/bookings/{bid}", json={"status": "Bogus"}, headers=HDR, timeout=30)
        assert r.status_code == 400


# ------------- Manager stats -------------
class TestManagerStats:
    def test_stats(self):
        r = requests.get(f"{API}/manager/stats", headers=HDR, timeout=30)
        assert r.status_code == 200
        data = r.json()
        for k in ["total", "pending", "confirmed", "completed"]:
            assert k in data and isinstance(data[k], int)


# ------------- Slot blocks -------------
class TestSlotBlocks:
    block_id = None

    def test_block_whole_day(self):
        r = requests.post(f"{API}/manager/slot-blocks",
                          json={"date": BLOCK_DATE, "time": None, "reason": "TEST_holiday"},
                          headers=HDR, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["date"] == BLOCK_DATE and data.get("time") is None
        TestSlotBlocks.block_id = data["id"]

    def test_slots_reflect_block(self):
        r = requests.get(f"{API}/available-slots", params={"date": BLOCK_DATE}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["day_blocked"] is True
        assert all(not s["available"] for s in data["slots"])

    def test_delete_block(self):
        bid = TestSlotBlocks.block_id
        assert bid
        r = requests.delete(f"{API}/manager/slot-blocks/{bid}", headers=HDR, timeout=30)
        assert r.status_code == 200
        # verify unblocked
        data = requests.get(f"{API}/available-slots", params={"date": BLOCK_DATE}, timeout=30).json()
        assert data["day_blocked"] is False


# ------------- Manager services (update) -------------
class TestManagerServices:
    def test_toggle_and_price(self):
        svc = requests.get(f"{API}/services", timeout=30).json()[0]
        sid = svc["id"]
        original_price = svc["price"]
        # toggle unavailable
        r = requests.patch(f"{API}/manager/services/{sid}", json={"available": False}, headers=HDR, timeout=30)
        assert r.status_code == 200
        # verify persisted
        after = requests.get(f"{API}/services", timeout=30).json()
        match = [s for s in after if s["id"] == sid]
        assert match and match[0]["available"] is False
        # update price
        new_price = original_price + 111
        r = requests.patch(f"{API}/manager/services/{sid}", json={"price": new_price}, headers=HDR, timeout=30)
        assert r.status_code == 200
        after = requests.get(f"{API}/services", timeout=30).json()
        match = [s for s in after if s["id"] == sid]
        assert match and match[0]["price"] == new_price
        # restore
        requests.patch(f"{API}/manager/services/{sid}",
                       json={"available": True, "price": original_price},
                       headers=HDR, timeout=30)
