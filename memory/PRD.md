# KBS Beauty Saloon — PRD

## Overview
Apple-grade luxury digital menu + booking + e-commerce cart web app for KBS Beauty Saloon (Sujatha Nagar, AP). Public site with auth, cart, checkout, loyalty; password-protected Manager Dashboard.

## Personas
- Guest customer — browses menu, uses Quick Book (no signup), or Cart flow (needs signup)
- Registered customer — signs in via email/password or Google, uses cart + earns loyalty
- Bride/Groom — explores Bridal packages, requests consultation on WhatsApp
- Salon owner/manager — reviews bookings + cart orders, blocks slots, edits menu

## Implemented (updated 2026-07-31)
- Backend: FastAPI + Mongo · 178 services (10 Bridal) · 6 stylists (Neeraj/Bujji top-rated + Naidu/Aruna/Akhil) · Auth (Email/Password JWT + Emergent Google Sign-In) · Admin seeded (admin@kbs.com / kbs@admin2026) · Cart CRUD · Order checkout (18% GST + loyalty discount cap 50%) · Loyalty (+1 pt / ₹100, 100 pts = ₹100 off) · UPI QR generation (dynamic amount → pkoripella@ybl) · Payment info + WhatsApp confirmation · Slot-blocks + manager order status
- Frontend: Sticky glass navbar with gold-glow logo, Sign In/Sign Up, Cart icon with badge + user menu · Hero + Trending + Menu + Stylists section (5 stylist cards) + Bridal (new red-lehenga image) + Reviews + About/Contact · AuthModal (Email/Password tabs + Google button + Phone OTP placeholder) · CartDrawer (subtotal/GST/total, remove, checkout) · /checkout page (UPI QR + bank details + WhatsApp confirm + "I've paid") · /profile page (loyalty, past bookings, past orders) · /auth/callback for Google session exchange · Manager /admin unchanged
- Contacts: Primary 094945 42999 (WhatsApp booking) · Secondary 99639 38553 · UPI pkoripella@ybl · SBI Acc 00000041651112710 · IFSC SBIN0021144

## Backlog / Deferred
- P1: Phone OTP login (needs Twilio API keys)
- P1: Real-time booking notifications for manager
- P2: Razorpay/Stripe on top of UPI (optional)
- P2: Bilingual (Telugu + English)
