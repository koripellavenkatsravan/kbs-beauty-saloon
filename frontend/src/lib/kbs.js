// Shared constants & helpers for KBS Beauty Saloon
export const SALON = {
  name: "KBS Beauty Saloon",
  tagline: "Elevate Your Beauty & Wellness",
  address:
    "7-190/1/15, Venkateswara complex, opp. Reliance Fresh, Sujatha Nagar, Chinnamusidivada, Andhra Pradesh 530051",
  phoneDisplay: "094945 42999",
  phoneWa: "919494542999",
  email: "prasanthi3536@gmail.com",
};

export const LOGO_URL =
  "https://customer-assets-lxgj4vgw.emergentagent.net/job_50ac1877-54cb-4185-997f-ed182c4b8961/artifacts/8rhcolpk_ChatGPT%20Image%20Jul%2017%2C%202026%2C%2012_18_40%20PM.png";

// Real shop photos supplied by owner
export const SHOP_PHOTOS = [
  "https://customer-assets-lxgj4vgw.emergentagent.net/job_50ac1877-54cb-4185-997f-ed182c4b8961/artifacts/b8q0ewik_b0.jpeg",
  "https://customer-assets-lxgj4vgw.emergentagent.net/job_50ac1877-54cb-4185-997f-ed182c4b8961/artifacts/hvbwm88p_b1.jpeg",
  "https://customer-assets-lxgj4vgw.emergentagent.net/job_50ac1877-54cb-4185-997f-ed182c4b8961/artifacts/l0cqpi5s_b2.jpeg",
];

// Curated stock luxury imagery
export const STOCK_HERO = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80", // salon interior
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80", // hair stylist
  "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1600&q=80", // spa
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80", // facial
];

export const CATEGORY_IMAGES = {
  "Special Combos":
    "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80",
  "Men's Services":
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80",
  "Women's Services":
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
  "Pedicure & Manicure":
    "https://images.unsplash.com/photo-1610992015762-45dca7a5a096?auto=format&fit=crop&w=1000&q=80",
  "Massages & Body Care":
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
  "Cleanups, Facials & D-Tan":
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
};

export const INDIAN_STATES = [
  "Andhra Pradesh","Telangana","Karnataka","Tamil Nadu","Kerala","Maharashtra","Goa","Delhi","Uttar Pradesh","West Bengal","Rajasthan","Gujarat","Madhya Pradesh","Odisha","Punjab","Haryana","Bihar","Jharkhand","Chhattisgarh","Assam","Uttarakhand","Himachal Pradesh","Jammu & Kashmir","Other",
];

export const priceLabel = (s) => {
  if (s.priceMax && s.priceMax > s.price) return `₹${s.price.toLocaleString()} – ₹${s.priceMax.toLocaleString()}`;
  return `₹${s.price.toLocaleString()}`;
};

export const buildWhatsAppLink = (booking) => {
  const svc = booking.services.map((s) => `• ${s.name} — ₹${s.price}`).join("\n");
  const text = `Hi KBS Beauty Saloon! I would like to book an appointment.\n\nName: ${booking.full_name}\nPhone: ${booking.phone}\nEmail: ${booking.email}\nDate: ${booking.date} at ${booking.time}\nStylist: ${booking.stylist}\nCity: ${booking.city}, ${booking.state}\n\nServices:\n${svc}\n\nTotal: ₹${booking.total}\n\nNotes: ${booking.notes || "-"}`;
  return `https://wa.me/${SALON.phoneWa}?text=${encodeURIComponent(text)}`;
};
