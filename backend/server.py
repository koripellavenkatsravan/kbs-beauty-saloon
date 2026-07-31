from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends, Request
from fastapi.responses import Response
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import logging
import uuid
import httpx
import bcrypt
import jwt as pyjwt
import qrcode
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from services_data import SERVICES, STYLISTS

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "KBS Beauty Saloon")
MANAGER_PASSWORD = os.environ.get("MANAGER_PASSWORD", "kbs@admin2026")
SALON_WHATSAPP = os.environ.get("SALON_WHATSAPP", "919494542999")
SALON_EMAIL = os.environ.get("SALON_EMAIL", "prasanthi3536@gmail.com")
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
UPI_ID = os.environ.get("UPI_ID", "pkoripella@ybl")
UPI_NAME = os.environ.get("UPI_NAME", "KBS Beauty Saloon")
BANK_ACCOUNT = os.environ.get("BANK_ACCOUNT", "00000041651112710")
BANK_IFSC = os.environ.get("BANK_IFSC", "SBIN0021144")

app = FastAPI(title="KBS Beauty Saloon API")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)


# ---------------- HELPERS ----------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        uid = payload.get("sub")
        user = await db.users.find_one({"id": uid}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def verify_manager(x_manager_token: str = Header(None)):
    if x_manager_token != MANAGER_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


# ---------------- MODELS ----------------
class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: int
    priceMax: Optional[int] = None
    category: str
    subcategory: str
    gender: str
    description: Optional[str] = ""
    available: bool = True


class ServiceUpdate(BaseModel):
    price: Optional[int] = None
    priceMax: Optional[int] = None
    available: Optional[bool] = None


class BookingCreate(BaseModel):
    services: List[dict]
    stylist: str
    date: str
    time: str
    full_name: str
    phone: str
    email: EmailStr
    state: str
    city: str
    notes: Optional[str] = ""


class Booking(BookingCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    status: str = "Pending"
    total: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookingStatusUpdate(BaseModel):
    status: str


class SlotBlock(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    time: Optional[str] = None
    reason: Optional[str] = ""


class SlotBlockCreate(BaseModel):
    date: str
    time: Optional[str] = None
    reason: Optional[str] = ""


class ManagerLogin(BaseModel):
    password: str


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = ""


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class SessionCallback(BaseModel):
    session_id: str


class CartItem(BaseModel):
    service_id: str
    name: str
    price: int


class OrderCreate(BaseModel):
    stylist: Optional[str] = "Any Available"
    date: Optional[str] = None
    time: Optional[str] = None
    notes: Optional[str] = ""


# ---------------- STARTUP ----------------
@app.on_event("startup")
async def startup_tasks():
    # Seed services
    count = await db.services.count_documents({})
    if count == 0:
        docs = [{
            "id": str(uuid.uuid4()), "name": s["name"], "price": s["price"],
            "priceMax": s.get("priceMax"), "category": s["category"],
            "subcategory": s["subcategory"], "gender": s["gender"],
            "description": s.get("description", ""), "available": True,
        } for s in SERVICES]
        await db.services.insert_many(docs)
        logger.info(f"Seeded {len(docs)} services")

    # Indexes
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
    except Exception as e:
        logger.warning(f"Index create: {e}")

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@kbs.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "kbs@admin2026")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "KBS Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "loyalty_points": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user")


# ---------------- PUBLIC ----------------
@api_router.get("/")
async def root():
    return {"message": "KBS Beauty Saloon API"}


@api_router.get("/services", response_model=List[Service])
async def get_services():
    docs = await db.services.find({}, {"_id": 0}).to_list(1000)
    return docs


@api_router.get("/stylists")
async def get_stylists():
    return STYLISTS


@api_router.get("/available-slots")
async def available_slots(date: str):
    all_slots = []
    start = datetime.strptime("10:00", "%H:%M")
    end = datetime.strptime("20:00", "%H:%M")
    cur = start
    while cur < end:
        all_slots.append(cur.strftime("%H:%M"))
        cur += timedelta(minutes=45)

    blocks = await db.slot_blocks.find({"date": date}, {"_id": 0}).to_list(1000)
    day_blocked = any(b.get("time") is None for b in blocks)
    blocked_times = {b["time"] for b in blocks if b.get("time")}
    bookings = await db.bookings.find(
        {"date": date, "status": {"$in": ["Pending", "Confirmed"]}}, {"_id": 0, "time": 1}
    ).to_list(1000)
    booked_times = {b["time"] for b in bookings}
    result = [{"time": s, "available": not day_blocked and s not in blocked_times and s not in booked_times} for s in all_slots]
    return {"date": date, "slots": result, "day_blocked": day_blocked}


@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate, authorization: Optional[str] = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            data = pyjwt.decode(authorization[7:], JWT_SECRET, algorithms=[JWT_ALGO])
            user_id = data.get("sub")
        except Exception:
            pass

    total = sum(int(s.get("price", 0)) for s in payload.services)
    booking = Booking(**payload.model_dump(), total=total, user_id=user_id)
    await db.bookings.insert_one(booking.model_dump())
    try:
        await send_confirmation_email(booking)
    except Exception as e:
        logger.error(f"Email send failed: {e}")
    return booking


async def send_confirmation_email(booking: Booking):
    if not EMAIL_KEY:
        return
    rows = "".join(
        f"<tr><td style='padding:8px 12px;border-bottom:1px solid #eee;color:#1A1A1A;'>{s.get('name')}</td>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;color:#1A1A1A;'>₹{s.get('price')}</td></tr>"
        for s in booking.services
    )
    wa_text = (
        f"Hi KBS Beauty Saloon! I have booked an appointment.%0A"
        f"Name: {booking.full_name}%0APhone: {booking.phone}%0A"
        f"Date: {booking.date} at {booking.time}%0AStylist: {booking.stylist}%0A"
        f"Total: ₹{booking.total}"
    )
    wa_url = f"https://wa.me/{SALON_WHATSAPP}?text={wa_text}"
    html = f"""
<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Georgia,serif;background:#FDFBF7;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF7;padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #EFE4D6;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#1A1A1A,#2a2a2a);padding:36px 40px;text-align:center;">
<div style="color:#D4AF37;font-size:14px;letter-spacing:6px;">KBS BEAUTY SALOON</div>
<div style="color:#FDFBF7;font-size:28px;margin-top:12px;font-family:Georgia,serif;">Appointment Request Received</div></td></tr>
<tr><td style="padding:32px 40px;color:#1A1A1A;">
<p style="font-size:16px;margin:0 0 16px;">Hi <b>{booking.full_name}</b>,</p>
<p style="font-size:15px;color:#3d3d3d;">Thank you for booking with <b>KBS Beauty Saloon</b>! Your details:</p>
<div style="margin:14px 0;"><b>Date & Time:</b> {booking.date} at {booking.time} · <b>Stylist:</b> {booking.stylist}</div>
<table width="100%" style="border:1px solid #F1E7D6;border-radius:12px;overflow:hidden;">{rows}
<tr><td style="padding:12px 18px;background:#FBF3E6;color:#1A1A1A;font-weight:700;">Total</td>
<td style="padding:12px 18px;background:#FBF3E6;color:#1A1A1A;font-weight:700;text-align:right;">₹{booking.total}</td></tr></table>
<div style="text-align:center;margin-top:24px;"><a href="{wa_url}" style="background:#25D366;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;display:inline-block;font-weight:600;">Message us on WhatsApp</a></div>
</td></tr><tr><td style="background:#1A1A1A;padding:16px;text-align:center;color:#D4AF37;font-size:12px;letter-spacing:2px;">ELEVATE YOUR BEAUTY & WELLNESS</td></tr>
</table></td></tr></table></body></html>
"""
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": EMAIL_KEY},
            json={"to": [booking.email], "subject": "Appointment Request Received - KBS Beauty Saloon!",
                  "html": html, "from_name": EMAIL_FROM_NAME, "contact_email": SALON_EMAIL})
        r.raise_for_status()


# ---------------- AUTH ----------------
@api_router.post("/auth/register")
async def auth_register(payload: RegisterPayload):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")
    uid = str(uuid.uuid4())
    user = {
        "id": uid, "email": email, "name": payload.name, "phone": payload.phone or "",
        "password_hash": hash_password(payload.password),
        "role": "customer", "loyalty_points": 0, "provider": "email",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    token = make_token(uid, email)
    return {"token": token, "user": {"id": uid, "email": email, "name": payload.name, "phone": payload.phone or "", "loyalty_points": 0, "role": "customer"}}


@api_router.post("/auth/login")
async def auth_login(payload: LoginPayload):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = make_token(user["id"], email)
    return {"token": token, "user": {"id": user["id"], "email": email, "name": user["name"],
        "phone": user.get("phone", ""), "loyalty_points": user.get("loyalty_points", 0), "role": user.get("role", "customer")}}


@api_router.post("/auth/google-session")
async def auth_google_session(payload: SessionCallback):
    """Exchange session_id from Emergent Google Auth for our own JWT and user."""
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": payload.session_id}
        )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google session")
        data = r.json()

    email = data.get("email", "").lower()
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture", "")
    if not email:
        raise HTTPException(status_code=400, detail="No email from Google")

    user = await db.users.find_one({"email": email})
    if not user:
        uid = str(uuid.uuid4())
        user = {
            "id": uid, "email": email, "name": name, "picture": picture, "phone": "",
            "role": "customer", "loyalty_points": 0, "provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
    token = make_token(user["id"], email)
    return {"token": token, "user": {"id": user["id"], "email": email, "name": user["name"],
        "phone": user.get("phone", ""), "loyalty_points": user.get("loyalty_points", 0), "picture": user.get("picture", ""), "role": user.get("role", "customer")}}


@api_router.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return user


@api_router.get("/auth/my-bookings")
async def my_bookings(user: dict = Depends(get_current_user)):
    docs = await db.bookings.find({"$or": [{"user_id": user["id"]}, {"email": user["email"]}]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/auth/my-orders")
async def my_orders(user: dict = Depends(get_current_user)):
    docs = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


# ---------------- CART & ORDERS ----------------
@api_router.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user["id"]}, {"_id": 0}) or {"user_id": user["id"], "items": []}
    return cart


@api_router.post("/cart/add")
async def cart_add(item: CartItem, user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": user["id"]},
        {"$push": {"items": item.model_dump()}},
        upsert=True,
    )
    cart = await db.carts.find_one({"user_id": user["id"]}, {"_id": 0})
    return cart


@api_router.post("/cart/remove")
async def cart_remove(item: CartItem, user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": user["id"]},
        {"$pull": {"items": {"service_id": item.service_id}}},
    )
    cart = await db.carts.find_one({"user_id": user["id"]}, {"_id": 0}) or {"user_id": user["id"], "items": []}
    return cart


@api_router.post("/cart/clear")
async def cart_clear(user: dict = Depends(get_current_user)):
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": []}}, upsert=True)
    return {"ok": True}


@api_router.post("/orders/checkout")
async def orders_checkout(payload: OrderCreate, user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user["id"]}, {"_id": 0}) or {"items": []}
    items = cart.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    subtotal = sum(int(i.get("price", 0)) for i in items)
    total = subtotal
    order = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "items": items,
        "subtotal": subtotal,
        "total": total,
        "stylist": payload.stylist or "Any Available",
        "date": payload.date,
        "time": payload.time,
        "notes": payload.notes or "",
        "status": "Awaiting Payment",
        "payment_method": "UPI QR",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order)
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": []}})
    order.pop("_id", None)
    return {"order": order}


@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    o = await db.orders.find_one({"id": order_id, "user_id": user["id"]}, {"_id": 0})
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return o


@api_router.get("/orders/{order_id}/qr")
async def get_order_qr(order_id: str):
    """Public QR generator for an order — returns PNG image."""
    o = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    amount = o["total"]
    tn = f"KBS-{order_id[:8]}"
    upi_link = f"upi://pay?pa={UPI_ID}&pn={UPI_NAME.replace(' ', '%20')}&am={amount}&cu=INR&tn={tn}"
    img = qrcode.make(upi_link)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")


@api_router.get("/payment/info")
async def payment_info():
    return {
        "upi_id": UPI_ID,
        "upi_name": UPI_NAME,
        "bank_account": BANK_ACCOUNT,
        "bank_ifsc": BANK_IFSC,
        "whatsapp": SALON_WHATSAPP,
    }


@api_router.post("/orders/{order_id}/confirm-payment")
async def confirm_payment(order_id: str, user: dict = Depends(get_current_user)):
    """Customer clicks 'I've paid' — mark as awaiting verification by manager."""
    res = await db.orders.update_one(
        {"id": order_id, "user_id": user["id"]},
        {"$set": {"status": "Payment Submitted"}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True}


# ---------------- MANAGER ----------------
@api_router.post("/manager/login")
async def manager_login(payload: ManagerLogin):
    if payload.password != MANAGER_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"token": MANAGER_PASSWORD, "ok": True}


@api_router.get("/manager/bookings")
async def list_bookings(_: bool = Depends(verify_manager)):
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.patch("/manager/bookings/{booking_id}")
async def update_booking_status(booking_id: str, payload: BookingStatusUpdate, _: bool = Depends(verify_manager)):
    if payload.status not in ["Pending", "Confirmed", "Completed", "Cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"ok": True}


@api_router.patch("/manager/services/{service_id}")
async def update_service(service_id: str, payload: ServiceUpdate, _: bool = Depends(verify_manager)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        return {"ok": True}
    res = await db.services.update_one({"id": service_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"ok": True}


@api_router.get("/manager/slot-blocks")
async def list_slot_blocks(_: bool = Depends(verify_manager)):
    docs = await db.slot_blocks.find({}, {"_id": 0}).to_list(1000)
    return docs


@api_router.post("/manager/slot-blocks", response_model=SlotBlock)
async def add_slot_block(payload: SlotBlockCreate, _: bool = Depends(verify_manager)):
    block = SlotBlock(**payload.model_dump())
    await db.slot_blocks.insert_one(block.model_dump())
    return block


@api_router.delete("/manager/slot-blocks/{block_id}")
async def delete_slot_block(block_id: str, _: bool = Depends(verify_manager)):
    await db.slot_blocks.delete_one({"id": block_id})
    return {"ok": True}


@api_router.get("/manager/orders")
async def list_orders(_: bool = Depends(verify_manager)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.patch("/manager/orders/{order_id}")
async def update_order_status(order_id: str, payload: BookingStatusUpdate, _: bool = Depends(verify_manager)):
    res = await db.orders.update_one({"id": order_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True}


@api_router.get("/manager/stats")
async def manager_stats(_: bool = Depends(verify_manager)):
    total = await db.bookings.count_documents({})
    pending = await db.bookings.count_documents({"status": "Pending"})
    confirmed = await db.bookings.count_documents({"status": "Confirmed"})
    completed = await db.bookings.count_documents({"status": "Completed"})
    users = await db.users.count_documents({"role": "customer"})
    orders = await db.orders.count_documents({})
    return {"total": total, "pending": pending, "confirmed": confirmed, "completed": completed, "users": users, "orders": orders}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
