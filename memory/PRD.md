# KBS Beauty Saloon — PRD

## Overview
Apple-grade luxury digital menu + appointment booking app for KBS Beauty Saloon (Sujatha Nagar, AP). Includes public site, multi-step booking modal, Resend email confirmations, WhatsApp CTA, and a password-protected Manager Dashboard.

## Personas
- Guest customer (mobile/desktop) — browses menu, books
- Salon owner/manager — reviews bookings, blocks slots, edits menu

## Implemented (2026-07-30)
- Backend (FastAPI + Mongo): services CRUD-lite w/ seed (147+ items), stylists list, available-slots (10:00-19:15 @45m + block-aware), bookings CRUD w/ status transitions, manager auth (shared-secret), slot-blocks CRUD, stats. Resend email HTML confirmation via Emergent-managed proxy.
- Frontend (React + Tailwind + Framer + shadcn): Sticky glassmorphism navbar with prominent gold logo; hero with 3 real shop-photo carousel + 4.9 Top Rated badge + "Premium Beauty & Wellness Sanctuary" pill; visual menu with 8 horizontal tab carousel, featured 6-ritual slider, sub-category accordion; multi-step booking modal (services → stylist → date/time → details → confirm) with instant WhatsApp share; Google Reviews section (4 real reviews + 5.0 badge) + 14-sec transformation video with "Styled by Neeraj" overlay; About + Contact + Google Map; Manager Dashboard at /admin with stats, bookings feed w/ status controls, slot blocker, menu editor.

## Backlog / Deferred
- P1: SMS/OTP verification of booking phone
- P1: Real-time booking notifications for manager (websocket / push)
- P2: Loyalty rewards / referrals
- P2: Bilingual (Telugu + English)
- P2: Deposit collection via Razorpay
