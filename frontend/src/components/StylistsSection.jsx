import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Star, Sparkles, Scissors, Palette, HeartHandshake, Wand2, MessageCircle, Clock } from "lucide-react";
import { SALON } from "../lib/kbs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Simple availability heuristic based on current time
const availabilityFor = (name) => {
  const h = new Date().getHours();
  // deterministic pseudo-status per stylist
  const seed = name.charCodeAt(0) + name.length;
  const busyNow = (h + seed) % 3 === 0;
  if (!busyNow) return { label: "Available Today", tone: "ok" };
  // otherwise show next slot
  const slots = ["11:00 AM", "12:30 PM", "2:15 PM", "3:00 PM", "4:30 PM", "5:45 PM", "6:30 PM"];
  const next = slots[(seed + h) % slots.length];
  return { label: `Next Slot: ${next}`, tone: "warn" };
};

const STYLIST_IMAGES = {
  "Neeraj": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85",
  "Bujji": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=85",
  "Naidu": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=85",
  "Aruna": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=85",
  "Akhil": "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=800&q=85",
};

const STYLIST_ICONS = {
  "Neeraj": Scissors,
  "Bujji": Palette,
  "Naidu": Wand2,
  "Aruna": HeartHandshake,
  "Akhil": Scissors,
};

const StylistsSection = ({ onBookClick }) => {
  const [stylists, setStylists] = useState([]);
  useEffect(() => {
    axios.get(`${API}/stylists`).then((r) => setStylists(r.data.filter((s) => s.name !== "Any Available"))).catch(() => {});
  }, []);

  return (
    <section id="stylists" className="py-24 px-5 sm:px-10 relative overflow-hidden bg-[#1A1A1A] text-[#FDFBF7]">
      <div className="absolute inset-0 kbs-grain pointer-events-none"/>
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] tracking-[0.28em] uppercase text-[#D4AF37]">Meet the Artists</div>
          <h2 className="font-serif-kbs text-4xl sm:text-5xl lg:text-6xl mt-3">
            Hands you can <span className="italic text-[#D4AF37]">trust.</span>
          </h2>
          <p className="mt-4 text-[#c8c8c8] text-[15px] leading-relaxed">
            Every stylist at KBS is chosen for their craft, their warmth and their attention to the smallest detail.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {stylists.map((s, i) => {
            const Icon = STYLIST_ICONS[s.name] || Sparkles;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative rounded-3xl overflow-hidden group border border-[#3a3a3a] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
                data-testid={`stylist-card-${s.name}`}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={STYLIST_IMAGES[s.name]} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"/>
                </div>

                {s.top_rated && (
                  <div className="absolute top-4 left-4 chip-gold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <Star size={10} fill="currentColor"/> Top Rated
                  </div>
                )}
                <div className="absolute top-4 right-4 h-9 w-9 rounded-full kbs-glass-dark grid place-items-center">
                  <Icon size={14} className="text-[#D4AF37]"/>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="font-serif-kbs text-2xl">{s.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37] mt-1">{s.badge}</div>
                  {(() => {
                    const av = availabilityFor(s.name);
                    return (
                      <div className={`mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        av.tone === "ok"
                          ? "bg-[#1e6b3c]/20 border-[#5FBC85]/50 text-[#7ee5a5]"
                          : "bg-[#8a6c1e]/20 border-[#D4AF37]/50 text-[#F6D976]"
                      }`} data-testid={`availability-${s.name}`}>
                        <Clock size={10}/> {av.label}
                      </div>
                    );
                  })()}
                  <button
                    onClick={onBookClick}
                    className="mt-3 w-full btn-gold py-2 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1"
                    data-testid={`book-stylist-${s.name}`}
                  >
                    Book with {s.name}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href={`https://wa.me/${SALON.phoneWa}?text=${encodeURIComponent("Hi KBS Beauty Saloon, I'd like to know stylist availability.")}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#E9CE72] transition"
            data-testid="stylists-whatsapp"
          >
            <MessageCircle size={14}/> Not sure who? Ask us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default StylistsSection;
