import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SHOP_PHOTOS } from "../lib/kbs";
import { Sparkles, CalendarCheck, MailCheck, Star } from "lucide-react";

const Hero = ({ onBookClick, onMenuClick }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SHOP_PHOTOS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="top" className="relative kbs-hero-bg kbs-grain overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-10 pt-14 sm:pt-20 pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* LEFT copy */}
          <div className="lg:col-span-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full chip-gold text-[11px] tracking-[0.24em] uppercase">
              <Sparkles size={12} /> Premium Beauty & Wellness Sanctuary
            </div>

            <h1 className="mt-6 font-serif-kbs text-[42px] sm:text-6xl lg:text-[68px] leading-[1.03] tracking-tight text-[#1A1A1A]">
              Elevate Your
              <br />
              Beauty & Wellness at
              <br />
              <span className="italic text-[#B7902B]">KBS Beauty Saloon.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#3d3d3d]">
              A curated sanctuary in Sujatha Nagar for effortless grooming, restorative spa
              rituals and editorial hair artistry — designed for men and women who value
              detail, care and a little bit of gold.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={onMenuClick}
                className="btn-outline-gold px-6 py-3 rounded-full text-sm font-medium"
                data-testid="hero-explore-menu-btn"
              >
                Explore Visual Menu
              </button>
              <button
                onClick={onBookClick}
                className="btn-gold px-6 py-3 rounded-full text-sm font-semibold"
                data-testid="hero-book-btn"
              >
                Book Appointment
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-2 text-[11px] tracking-[0.18em] uppercase">
              <span className="chip-rose px-3 py-1.5 rounded-full flex items-center gap-1.5"><CalendarCheck size={12}/> Instant Booking</span>
              <span className="chip-rose px-3 py-1.5 rounded-full flex items-center gap-1.5"><Sparkles size={12}/> Complete Digital Menu</span>
              <span className="chip-rose px-3 py-1.5 rounded-full flex items-center gap-1.5"><MailCheck size={12}/> Automated Confirmations</span>
            </div>
          </div>

          {/* RIGHT visual — 3 real shop photos only */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[28px] overflow-hidden border border-[#E7DFCF] shadow-[0_40px_80px_-30px_rgba(26,26,26,0.35)] aspect-[4/5] max-w-[520px] ml-auto">
              <AnimatePresence mode="wait">
                <motion.img
                  key={SHOP_PHOTOS[idx]}
                  src={SHOP_PHOTOS[idx]}
                  alt="KBS Salon Interior"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Floating luxury rating badge */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-6 right-6 kbs-glass-dark rounded-full px-3.5 py-2 flex items-center gap-2"
              >
                <Star size={14} className="text-[#D4AF37]" fill="#D4AF37" />
                <span className="text-[11px] tracking-[0.12em] uppercase text-[#FDFBF7] font-semibold">4.9 · Top Rated</span>
              </motion.div>

              <div className="absolute left-6 bottom-6 right-6 flex items-end justify-between">
                <div className="text-white">
                  <div className="font-serif-kbs text-2xl leading-tight">Editorial Hair, Spa & Skin</div>
                  <div className="text-[11px] mt-1 tracking-[0.24em] uppercase text-[#E5C1CD]">Since 2018 · Sujatha Nagar</div>
                </div>
                <div className="flex gap-1.5">
                  {SHOP_PHOTOS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-[#D4AF37]" : "w-2 bg-white/40"}`}
                      aria-label={`Slide ${i + 1}`}
                      data-testid={`hero-slide-${i}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="border-t border-[#E7DFCF] bg-[#1A1A1A] text-[#D4AF37] py-3 overflow-hidden">
        <div className="kbs-marquee whitespace-nowrap flex gap-14 text-[11px] tracking-[0.42em] uppercase">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-14 shrink-0">
              <span>Korean Combo · ₹10,000</span><span>·</span>
              <span>Luxury Hair Spa</span><span>·</span>
              <span>Editorial Styling</span><span>·</span>
              <span>O3 Facials</span><span>·</span>
              <span>Bridal Rituals</span><span>·</span>
              <span>Instant Booking</span><span>·</span>
              <span>Automated Confirmations</span><span>·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
