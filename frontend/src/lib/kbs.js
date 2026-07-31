// Shared constants & helpers for KBS Beauty Saloon
export const SALON = {
  name: "KBS Beauty Saloon",
  tagline: "Elevate Your Beauty & Wellness",
  address:
    "7-190/1/15, Venkateswara complex, opp. Reliance Fresh, Sujatha Nagar, Chinnamusidivada, Andhra Pradesh 530051",
  phoneDisplay: "094945 42999",
  phoneWa: "919494542999",
  phoneSecondary: "99639 38553",
  phoneSecondaryWa: "919963938553",
  email: "prasanthi3536@gmail.com",
  bank: {
    account: "00000041651112710",
    ifsc: "SBIN0021144",
    upi: "pkoripella@ybl",
  },
};

export const BRIDAL_IMAGE =
  "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/b5ahhb2k_image.png";

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
    "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/mwt96e4k_image.png",
  "Men's Services":
    "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/ghca5ths_image.png",
  "Women's Services":
    "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/hx1b7lp1_image.png",
  "Pedicure & Manicure":
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80",
  "Massages & Body Care":
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
  "Cleanups, Facials & D-Tan":
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
};

// Visual images per top-level category card (per user-provided mapping)
export const VISUAL_CATEGORIES = {
  women: [
    {
      key: "combos-w",
      title: "Korean Spa Combo",
      subtitle: "Glass Skin & Glow",
      image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/chhcei7i_Screenshot%202026-07-31%20113209.png",
      match: (s) => s.category === "Special Combos",
    },
    {
      key: "haircuts-w",
      title: "Haircuts & Creative Styling",
      subtitle: "Editorial hair artistry",
      image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/8xh9qcwt_Screenshot%202026-07-31%20113403.png",
      match: (s) => ["Hair Cuts", "Hair Wash & Styling"].includes(s.subcategory) && (s.gender === "women" || s.gender === "unisex"),
    },
    {
      key: "care-w",
      title: "Hair Care & Advanced Treatments",
      subtitle: "Spa · Colour · Botox · Keratin",
      image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/40c7qthn_image.png",
      match: (s) => ["Care, Spa & Treatments","Hair Colour","Hair Treatments"].includes(s.subcategory) && (s.gender === "women" || s.gender === "unisex"),
    },
    {
      key: "facials-w",
      title: "Facials, Cleanups & D-Tan",
      subtitle: "Basic to Advanced · O3 Series",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=85",
      match: (s) => ["Basic Facials","Advanced Facials","Masks & Cleanups","D-Tan"].includes(s.subcategory),
    },
    {
      key: "threading-w",
      title: "Threading, Waxing & Gunshot Piercing",
      subtitle: "Precise · Painless · Pretty",
      image: "https://images.unsplash.com/photo-1590346566789-a48f2d80b3ac?auto=format&fit=crop&w=1200&q=85",
      match: (s) => ["Threading","Waxing","Piercing"].includes(s.subcategory),
    },
    {
      key: "pediman-w",
      title: "Pedicure, Manicure & Foot Care",
      subtitle: "Crystal · O3+ · Heel Peel",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85",
      match: (s) => s.category === "Pedicure & Manicure",
    },
    {
      key: "massage-w",
      title: "Massages, Body Care & Spa Rituals",
      subtitle: "Relax · Detox · Restore",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85",
      match: (s) => s.category === "Massages & Body Care",
    },
  ],
  men: [
    {
      key: "combos-m",
      title: "Korean Spa Combo",
      subtitle: "Relax, Detox & Glow",
      image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/a9rwtded_Screenshot%202026-07-31%20112626.png",
      match: (s) => s.category === "Special Combos",
    },
    {
      key: "haircuts-m",
      title: "Haircuts & Styling",
      subtitle: "Sharp cuts · Beard artistry",
      image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/ghca5ths_image.png",
      match: (s) => s.subcategory === "Hair Cuts & Styling",
    },
    {
      key: "colour-m",
      title: "Hair Coloring",
      subtitle: "Majirel · Inoa · Streaks",
      image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/gdacz180_Screenshot%202026-07-31%20113043.png",
      match: (s) => s.subcategory === "Hair Coloring",
    },
    {
      key: "treatments-m",
      title: "Hair Treatments & Texturing",
      subtitle: "Botox · Nanoplus · Straightening",
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=85",
      match: (s) => s.subcategory === "Hair Treatments",
    },
    {
      key: "facials-m",
      title: "Facials, Cleanups & D-Tan",
      subtitle: "Refresh · Reveal · Glow",
      image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/5saurnjb_Screenshot%202026-07-31%20112904.png",
      match: (s) => ["Basic Facials","Advanced Facials","Masks & Cleanups","D-Tan"].includes(s.subcategory),
    },
    {
      key: "pediman-m",
      title: "Pedicure & Manicure",
      subtitle: "Basic to Crystal",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85",
      match: (s) => s.category === "Pedicure & Manicure",
    },
    {
      key: "massage-m",
      title: "Massages & Body Care",
      subtitle: "Head · Foot · Full body",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85",
      match: (s) => s.category === "Massages & Body Care",
    },
  ],
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
