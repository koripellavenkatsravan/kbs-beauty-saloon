# KBS Beauty Saloon — PRD

## Overview
Apple-grade luxury digital menu + appointment booking web app for KBS Beauty Saloon (Sujatha Nagar, AP). Public site + password-protected Manager Dashboard.

## Personas
- Guest customer (mobile/desktop) — browses menu, quick-books trending, books via multi-step modal
- Bride/Groom — explores Bridal packages, requests consultation on WhatsApp
- Salon owner/manager — reviews bookings, blocks slots, edits menu

## Implemented (updated 2026-07-31)
- Backend: FastAPI + Mongo, 178 services (incl. 10 Bridal & Groom packages), stylists, available-slots (block-aware), bookings CRUD + status transitions, manager auth (X-Manager-Token=kbs@admin2026), slot-blocks CRUD, stats, Resend HTML email confirmations
- Frontend: Sticky glassmorphism navbar w/ large gold logo + nav (Menu / Trending / Reviews / About / Bridal / Contact / Manager); Hero w/ 3 shop-photo carousel + 4.9 Top Rated badge + "Premium Beauty & Wellness Sanctuary" pill; Trending This Season quick-book bar (4 cards → prefills menu search); Visual Menu with Men/Women toggle and per-category banner cards + subcategory accordion; Exclusively Bridal & Groom section (sub-tabs Bridal Makeup / Pre-Bridal / Pre-Groom / Mehendi, interactive 5-stage stepper, packages, WhatsApp consult); Multi-step booking modal → Resend email + WhatsApp share; Google Reviews section (4 real reviews, 5.0 star badge) + 14-sec "Styled by Neeraj" transformation video; About + Contact + Google Map; Manager Dashboard at /admin (bookings feed with status controls, slot blocker, menu price/availability editor)
- Phone: +91 99639 38553 · WhatsApp: 919963938553

## Backlog / Deferred
- P1: SMS/OTP verification of booking phone
- P1: Real-time booking notifications for manager (websocket / push)
- P2: Deposit payments via Razorpay/UPI
- P2: Loyalty rewards
- P2: Bilingual (Telugu + English)
