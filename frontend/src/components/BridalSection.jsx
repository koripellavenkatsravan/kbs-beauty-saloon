import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, MessageCircle, Sparkles } from "lucide-react";
import { priceLabel, SALON, BRIDAL_IMAGE } from "../lib/kbs";
import { useCart } from "../lib/CartContext";

const TABS = [
  { key: "Bridal Makeup", label: "Bridal Makeup" },
  { key: "Pre-Bridal Packages", label: "Pre-Bridal Packages" },
  { key: "Pre-Groom Packages", label: "Pre-Groom Packages" },
  { key: "Mehendi Services", label: "Mehendi Services" },
];

const STAGES = [
  { key: "consultation", label: "Consultation", detail: "Discovery call & skin/hair analysis" },
  { key: "planning", label: "Planning", detail: "Timeline & bespoke package curation" },
  { key: "pre-bridal", label: "Pre-Bridal Care", detail: "Weekly rituals, glow-ups, spa" },
  { key: "trial", label: "Trial Session", detail: "Full look preview before the day" },
  { key: "wedding", label: "Wedding Day", detail: "On-day styling, on-time, on-point" },
];

const HERO_IMAGE = BRIDAL_IMAGE;

const BridalSection = ({ services, onAdd, selected }) => {
  const [tab, setTab] = useState("Bridal Makeup");
  const [stage, setStage] = useState(0);
  const { addItem, items: cartItems, setCartOpen } = useCart();

  const bridal = useMemo(() => services.filter((s) => s.category === "Bridal & Groom" && s.available), [services]);
  const items = useMemo(() => bridal.filter((s) => s.subcategory === tab), [bridal, tab]);
  const isSelected = (id) => selected.some((x) => x.id === id);

  const waHref = `https://wa.me/${SALON.phoneWa}?text=${encodeURIComponent(
    "Hi KBS Beauty Saloon! I'd like to book a Bridal consultation. My wedding date: ______"
  )}`;

  return (
    <section id="bridal" className="py-24 px-5 sm:px-10 relative overflow-hidden bg-gradient-to-b from-[#F6EFE2] via-[#FDFBF7] to-[#F6EFE2]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: image + intro */}
          <div className="lg:col-span-5">
            <div className="text-[11px] tracking-[0.28em] uppercase text-[#B7902B]">Exclusively Bridal & Groom</div>
            <h2 className="font-serif-kbs text-4xl sm:text-5xl mt-3 text-[#1A1A1A] kbs-hairline">
              Your wedding, <span className="italic text-[#B7902B]">beautifully choreographed.</span>
            </h2>
            <p className="mt-4 text-[#3d3d3d] text-[15px] leading-relaxed max-w-md">
              From that first consultation to the final touch-up on your wedding morning — we craft
              a signature ritual just for you. Every skin type, every dream, every silhouette.
            </p>

            <div className="mt-6 rounded-3xl overflow-hidden aspect-[4/5] border border-[#E7DFCF] shadow-[0_40px_80px_-30px_rgba(26,26,26,0.35)] relative">
              <img src={HERO_IMAGE} alt="Bridal" className="absolute inset-0 w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="font-serif-kbs text-2xl">Signature Bridal Rituals</div>
                <div className="text-[11px] uppercase tracking-[0.22em] mt-1 text-[#E5C1CD]">Book at least 8 weeks in advance</div>
              </div>
            </div>

            <a
              href={waHref}
              target="_blank" rel="noopener noreferrer"
              className="mt-6 btn-gold px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2 shadow-lg"
              data-testid="bridal-consult-btn"
            >
              <MessageCircle size={16}/> Book Bridal Consultation
            </a>
          </div>

          {/* RIGHT: stepper + tabs + packages */}
          <div className="lg:col-span-7">
            {/* 5-stage stepper */}
            <div className="kbs-card rounded-3xl p-5 sm:p-6 mb-6">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e]">Your Bridal Journey</div>
              <div className="font-serif-kbs text-2xl text-[#1A1A1A] mt-1">A 5-stage curated experience</div>

              <div className="mt-6 grid grid-cols-5 gap-2 relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#E7DFCF]"/>
                <div
                  className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B7902B] transition-all duration-500"
                  style={{ width: `${(stage / (STAGES.length - 1)) * 100}%` }}
                />
                {STAGES.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => setStage(i)}
                    className="relative flex flex-col items-center gap-2 group"
                    data-testid={`stage-${s.key}`}
                  >
                    <div className={`h-8 w-8 rounded-full grid place-items-center text-[11px] font-semibold transition-all z-10 ${
                      i <= stage ? "bg-[#D4AF37] text-[#1A1A1A] shadow-[0_0_0_4px_rgba(212,175,55,0.18)]" : "bg-white border border-[#E7DFCF] text-[#8a6c1e]"
                    }`}>
                      {i + 1}
                    </div>
                    <div className={`text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-center ${
                      i === stage ? "text-[#1A1A1A] font-semibold" : "text-[#8a6c1e]"
                    }`}>{s.label}</div>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="mt-5 rounded-2xl bg-[#FBF3E6] border border-[#EFDCA0] p-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e]">Stage {stage + 1} of 5</div>
                  <div className="font-serif-kbs text-xl text-[#1A1A1A] mt-1">{STAGES[stage].label}</div>
                  <div className="text-sm text-[#3d3d3d] mt-1">{STAGES[stage].detail}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Package tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    tab === t.key ? "bg-[#1A1A1A] text-[#D4AF37] border-[#1A1A1A]" : "bg-white border-[#E7DFCF] hover:border-[#D4AF37]"
                  }`}
                  data-testid={`bridal-tab-${t.key}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {items.length === 0 && <div className="text-sm text-[#8a6c1e] py-4">Coming soon — ask us on WhatsApp for a custom quote.</div>}
              {items.map((s) => {
                const sel = isSelected(s.id);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="kbs-card rounded-2xl p-5 flex items-center justify-between gap-4"
                    data-testid={`bridal-pkg-${s.id}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#D4AF37]"/>
                        <div className="font-serif-kbs text-xl text-[#1A1A1A]">{s.name}</div>
                      </div>
                      {s.description && <div className="text-[12px] text-[#6b6b6b] mt-0.5">{s.description}</div>}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="font-serif-kbs text-2xl text-[#B7902B] whitespace-nowrap">{priceLabel(s)}</div>
                      <button
                        onClick={() => { onAdd(s); setCartOpen(true); }}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all hover:shadow-[0_10px_24px_-10px_rgba(212,175,55,0.7)] active:scale-95 ${
                          cartItems.some((x) => x.service_id === s.id) ? "bg-[#1A1A1A] text-[#D4AF37]" : "btn-gold"
                        }`}
                        data-testid={`bridal-add-${s.id}`}
                      >
                        {cartItems.some((x) => x.service_id === s.id) ? <><Check size={13}/> In Cart</> : <><Plus size={13}/> Add to Cart</>}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BridalSection;
