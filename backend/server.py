from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from services_data import SERVICES, STYLISTS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "KBS Beauty Saloon")
MANAGER_PASSWORD = os.environ.get("MANAGER_PASSWORD", "kbs@admin2026")
SALON_WHATSAPP = os.environ.get("SALON_WHATSAPP", "919494542999")
SALON_EMAIL = os.environ.get("SALON_EMAIL", "prasanthi3536@gmail.com")

app = FastAPI(title="KBS Beauty Saloon API")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)


# ---------------- MODELS ----------------
class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: int
    priceMax: Optional[int] = None
    category: str
    subcategory: str
    gender: str  # men / women / unisex
    description: Optional[str] = ""
    available: bool = True


class ServiceUpdate(BaseModel):
    price: Optional[int] = None
    priceMax: Optional[int] = None
    available: Optional[bool] = None


class BookingCreate(BaseModel):
    services: List[dict]  # [{id, name, price}]
    stylist: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    full_name: str
    phone: str
    email: EmailStr
    state: str
    city: str
    notes: Optional[str] = ""


class Booking(BookingCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "Pending"  # Pending / Confirmed / Completed / Cancelled
    total: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookingStatusUpdate(BaseModel):
    status: str


class SlotBlock(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    time: Optional[str] = None  # if None, whole day blocked
    reason: Optional[str] = ""


class SlotBlockCreate(BaseModel):
    date: str
    time: Optional[str] = None
    reason: Optional[str] = ""


class ManagerLogin(BaseModel):
    password: str


# ---------------- AUTH ----------------
async def verify_manager(x_manager_token: str = Header(None)):
    if x_manager_token != MANAGER_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


# ---------------- STARTUP: seed services ----------------
@app.on_event("startup")
async def seed_services():
    count = await db.services.count_documents({})
    if count == 0:
        docs = []
        for s in SERVICES:
            doc = {
                "id": str(uuid.uuid4()),
                "name": s["name"],
                "price": s["price"],
                "priceMax": s.get("priceMax"),
                "category": s["category"],
                "subcategory": s["subcategory"],
                "gender": s["gender"],
                "description": s.get("description", ""),
                "available": True,
            }
            docs.append(doc)
        await db.services.insert_many(docs)
        logger.info(f"Seeded {len(docs)} services")


# ---------------- PUBLIC ROUTES ----------------
@api_router.get("/")
async def root():
    return {"message": "KBS Beauty Saloon API", "salon": "KBS Beauty Saloon"}


@api_router.get("/services", response_model=List[Service])
async def get_services(gender: Optional[str] = None, category: Optional[str] = None):
    query = {}
    if gender:
        query["$or"] = [{"gender": gender}, {"gender": "unisex"}]
    if category:
        query["category"] = category
    docs = await db.services.find(query, {"_id": 0}).to_list(1000)
    return docs


@api_router.get("/stylists")
async def get_stylists():
    return STYLISTS


@api_router.get("/available-slots")
async def available_slots(date: str):
    # Slots: 10:00 - 20:00, every 45 min
    all_slots = []
    start = datetime.strptime("10:00", "%H:%M")
    end = datetime.strptime("20:00", "%H:%M")
    cur = start
    while cur < end:
        all_slots.append(cur.strftime("%H:%M"))
        cur += timedelta(minutes=45)

    # Fetch blocks and existing bookings
    blocks = await db.slot_blocks.find({"date": date}, {"_id": 0}).to_list(1000)
    day_blocked = any(b.get("time") is None for b in blocks)
    blocked_times = {b["time"] for b in blocks if b.get("time")}

    bookings = await db.bookings.find(
        {"date": date, "status": {"$in": ["Pending", "Confirmed"]}},
        {"_id": 0, "time": 1},
    ).to_list(1000)
    booked_times = {b["time"] for b in bookings}

    result = []
    for slot in all_slots:
        available = not day_blocked and slot not in blocked_times and slot not in booked_times
        result.append({"time": slot, "available": available})
    return {"date": date, "slots": result, "day_blocked": day_blocked}


@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    total = sum(int(s.get("price", 0)) for s in payload.services)
    booking = Booking(**payload.model_dump(), total=total)
    await db.bookings.insert_one(booking.model_dump())

    # Send confirmation email (non-blocking best-effort)
    try:
        await send_confirmation_email(booking)
    except Exception as e:
        logger.error(f"Email send failed: {e}")

    # Fresh object without Mongo _id
    return booking


async def send_confirmation_email(booking: Booking):
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY missing; skipping email")
        return
    services_rows = "".join(
        f"<tr><td style='padding:8px 12px;border-bottom:1px solid #eee;color:#1A1A1A;'>{s.get('name')}</td>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;color:#1A1A1A;'>₹{s.get('price')}</td></tr>"
        for s in booking.services
    )
    wa_text = (
        f"Hi KBS Beauty Saloon! I have booked an appointment.%0A"
        f"Name: {booking.full_name}%0APhone: {booking.phone}%0A"
        f"Date: {booking.date} at {booking.time}%0AStylist: {booking.stylist}%0A"
        f"Services: {', '.join(s.get('name','') for s in booking.services)}%0A"
        f"Total: ₹{booking.total}"
    )
    wa_url = f"https://wa.me/{SALON_WHATSAPP}?text={wa_text}"

    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#FDFBF7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #EFE4D6;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#1A1A1A,#2a2a2a);padding:36px 40px;text-align:center;">
          <div style="color:#D4AF37;font-size:14px;letter-spacing:6px;">KBS BEAUTY SALOON</div>
          <div style="color:#FDFBF7;font-size:28px;margin-top:12px;font-family:Georgia,serif;">Appointment Request Received</div>
        </td></tr>
        <tr><td style="padding:32px 40px;color:#1A1A1A;">
          <p style="font-size:16px;margin:0 0 16px;">Hi <b>{booking.full_name}</b>,</p>
          <p style="font-size:15px;line-height:1.6;color:#3d3d3d;margin:0 0 24px;">Thank you for booking with <b>KBS Beauty Saloon</b>! We have received your request and our team will confirm your slot shortly.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F1E7D6;border-radius:12px;overflow:hidden;">
            <tr><td style="padding:14px 18px;background:#FBF3E6;color:#1A1A1A;font-weight:600;">Booking Details</td></tr>
            <tr><td style="padding:16px 18px;">
              <div style="margin:6px 0;"><b>Name:</b> {booking.full_name}</div>
              <div style="margin:6px 0;"><b>Mobile:</b> {booking.phone}</div>
              <div style="margin:6px 0;"><b>Email:</b> {booking.email}</div>
              <div style="margin:6px 0;"><b>Date & Time:</b> {booking.date} at {booking.time}</div>
              <div style="margin:6px 0;"><b>Stylist:</b> {booking.stylist}</div>
              <div style="margin:6px 0;"><b>Location:</b> {booking.city}, {booking.state}</div>
            </td></tr>
          </table>

          <div style="margin-top:22px;color:#1A1A1A;font-weight:600;">Selected Services</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;border:1px solid #F1E7D6;border-radius:12px;overflow:hidden;">
            {services_rows}
            <tr><td style="padding:12px 18px;background:#FBF3E6;color:#1A1A1A;font-weight:700;">Total</td>
                <td style="padding:12px 18px;background:#FBF3E6;color:#1A1A1A;font-weight:700;text-align:right;">₹{booking.total}</td></tr>
          </table>

          <div style="text-align:center;margin-top:32px;">
            <a href="{wa_url}" style="background:#25D366;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;display:inline-block;font-weight:600;">Message us on WhatsApp</a>
          </div>

          <p style="margin-top:28px;font-size:13px;color:#666;">Address: 7-190/1/15, Venkateswara complex, opp. Reliance Fresh, Sujatha Nagar, Chinnamusidivada, Andhra Pradesh 530051<br/>Phone: +91 94945 42999</p>
        </td></tr>
        <tr><td style="background:#1A1A1A;padding:16px;text-align:center;color:#D4AF37;font-size:12px;letter-spacing:2px;">ELEVATE YOUR BEAUTY &amp; WELLNESS</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
"""
    payload = {
        "to": [booking.email],
        "subject": "Appointment Request Received - KBS Beauty Saloon!",
        "html": html,
        "from_name": EMAIL_FROM_NAME,
        "contact_email": SALON_EMAIL,
    }
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(
            f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": EMAIL_KEY},
            json=payload,
        )
        r.raise_for_status()


# ---------------- MANAGER ROUTES ----------------
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


@api_router.get("/manager/stats")
async def manager_stats(_: bool = Depends(verify_manager)):
    total = await db.bookings.count_documents({})
    pending = await db.bookings.count_documents({"status": "Pending"})
    confirmed = await db.bookings.count_documents({"status": "Confirmed"})
    completed = await db.bookings.count_documents({"status": "Completed"})
    return {"total": total, "pending": pending, "confirmed": confirmed, "completed": completed}


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
