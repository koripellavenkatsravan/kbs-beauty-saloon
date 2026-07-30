import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, ChevronLeft, ChevronRight, ChevronDown, Star } from "lucide-react";
import { Input } from "../components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { CATEGORY_IMAGES, priceLabel } from "../lib/kbs";

// Top-level category tabs (map to underlying data categories/subcategories)
const TABS = [
  { key: "combos", label: "Combos", match: (s) => s.category === "Special Combos" },
  { key: "haircuts", label: "Hair Cuts & Styling", match: (s) => ["Hair Cuts & Styling","Hair Cuts","Hair Wash & Styling"].includes(s.subcategory) },
  { key: "treatments", label: "Hair Treatments", match: (s) => ["Hair Treatments","Care, Spa & Treatments","Hair Coloring","Hair Colour"].includes(s.subcategory) },
  { key: "facials", label: "Facials & Cleanups", match: (s) => ["Basic Facials","Advanced Facials","Masks & Cleanups"].includes(s.subcategory) },
  { key: "pediman", label: "Pedicure & Manicure", match: (s) => s.category === "Pedicure & Manicure" },
  { key: "massage", label: "Massages", match: (s) => s.category === "Massages & Body Care" },
  { key: "dtan", label: "D-Tan & Waxing", match: (s) => ["D-Tan","Waxing"].includes(s.subcategory) },
  { key: "threading", label: "Threading & Piercing", match: (s) => ["Threading","Piercing"].includes(s.subcategory) },
];

const FEATURED_NAMES = [
  "Korean Combo Package",
  "Advanced Haircut",
  "Hair Spa - Medium",
  "O3 Gold / Main O3 Facial",
  "Crystal Pedicure",
  "Aroma Oil Body Massage",
];

const FEATURED_IMAGES = {
  "Korean Combo Package": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=900&q=80",
  "Advanced Haircut": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
  "Hair Spa - Medium": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
  "O3 Gold / Main O3 Facial": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
  "Crystal Pedicure": "https://images.unsplash.com/photo-1610992015762-45dca7a5a096?auto=format&fit=crop&w=900&q=80",
  "Aroma Oil Body Massage": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
};

const ServiceRow = ({ s, onAdd, isSelected }) => {
  const [justAdded, setJustAdded] = useState(false);
  const handle = () => {
    if (!isSelected) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 900);
    }
    onAdd(s);
  };
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-[#EFE4D6] last:border-0">
      <div className="min-w-0">
        <div className="font-serif-kbs text-[17px] text-[#1A1A1A] truncate">{s.name}</div>
        <div className="text-[11px] uppercase tracking-widest text-[#8a6c1e]">{s.gender}{s.description ? ` · ${s.description}` : ""}</div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="font-serif-kbs text-lg text-[#B7902B] whitespace-nowrap">{priceLabel(s)}</div>
        <button
          onClick={handle}
          className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-[0_10px_24px_-10px_rgba(212,175,55,0.7)] active:scale-95 ${
            isSelected || justAdded ? "bg-[#1A1A1A] text-[#D4AF37]" : "btn-gold"
          }`}
          data-testid={`add-service-btn-${s.id}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isSelected || justAdded ? (
              <motion.span key="c" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} className="flex items-center gap-1.5">
                <Check size={14} /> Added
              </motion.span>
            ) : (
              <motion.span key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                <Plus size={14} /> Add
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

const MenuSection = ({ services, onAdd, selected }) => {
  const [tab, setTab] = useState("combos");
  const [query, setQuery] = useState("");
  const scrollerRef = useRef(null);

  const scrollTabs = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  const tabDef = TABS.find((t) => t.key === tab);

  const featured = useMemo(() => {
    return FEATURED_NAMES.map((n) => services.find((s) => s.name === n)).filter(Boolean);
  }, [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (!s.available) return false;
      if (q) {
        return s.name.toLowerCase().includes(q) || s.subcategory.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      }
      return tabDef ? tabDef.match(s) : false;
    });
  }, [services, tab, query, tabDef]);

  // group by subcategory
  const grouped = useMemo(() => {
    const out = {};
    for (const s of filtered) {
      if (!out[s.subcategory]) out[s.subcategory] = [];
      out[s.subcategory].push(s);
    }
    return out;
  }, [filtered]);

  const isSelected = (id) => selected.some((x) => x.id === id);

  return (
    <section id="menu" className="py-24 px-5 sm:px-10 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] tracking-[0.28em] uppercase text-[#B7902B]">The Visual Menu</div>
          <h2 className="font-serif-kbs text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] mt-3">
            Every ritual, <span className="italic text-[#B7902B]">beautifully priced.</span>
          </h2>
          <p className="mt-4 text-[#3d3d3d] text-[15px] leading-relaxed">
            Discover our top rituals, then browse the full menu by category. Add to your booking in a tap.
          </p>
        </div>

        {/* FEATURED SLIDER */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[#B7902B] flex items-center gap-2">
                <Star size={11} fill="#D4AF37" className="text-[#D4AF37]"/> Most Popular Rituals
              </div>
              <div className="font-serif-kbs text-2xl text-[#1A1A1A]">Featured this season</div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 menu-scroll -mx-2 px-2">
            {featured.map((s) => {
              const sel = isSelected(s.id);
              return (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -4 }}
                  className="snap-start shrink-0 w-[260px] sm:w-[300px] rounded-3xl overflow-hidden bg-white border border-[#E7DFCF] shadow-[0_18px_40px_-24px_rgba(26,26,26,0.25)]"
                  data-testid={`featured-${s.id}`}
                >
                  <div className="relative aspect-[4/5]">
                    <img src={FEATURED_IMAGES[s.name]} alt={s.name} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"/>
                    <div className="absolute top-3 left-3 chip-gold text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full">Featured</div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="font-serif-kbs text-xl leading-tight">{s.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.22em] mt-1 text-[#E5C1CD]">{s.subcategory}</div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[#8a6c1e]">From</div>
                      <div className="font-serif-kbs text-xl text-[#B7902B]">{priceLabel(s)}</div>
                    </div>
                    <button
                      onClick={() => onAdd(s)}
                      className={`text-xs font-medium inline-flex items-center gap-1 px-3.5 py-2 rounded-full transition-all hover:shadow-[0_10px_24px_-10px_rgba(212,175,55,0.7)] active:scale-95 ${
                        sel ? "bg-[#1A1A1A] text-[#D4AF37]" : "btn-gold"
                      }`}
                      data-testid={`featured-add-${s.id}`}
                    >
                      {sel ? <><Check size={13}/> Added</> : <><Plus size={13}/> Add</>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* TAB CAROUSEL + SEARCH */}
        <div className="mt-14 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 min-w-0 flex items-center">
            <button aria-label="Prev" onClick={() => scrollTabs(-1)} className="hidden md:grid place-items-center h-9 w-9 rounded-full border border-[#E7DFCF] bg-white hover:bg-[#F6EFE2] shrink-0" data-testid="tabs-prev">
              <ChevronLeft size={16}/>
            </button>
            <div ref={scrollerRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory menu-scroll mx-2 py-1 scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setQuery(""); }}
                  className={`snap-start shrink-0 px-5 py-2.5 rounded-full border text-sm transition ${
                    tab === t.key && !query
                      ? "bg-[#1A1A1A] text-[#D4AF37] border-[#1A1A1A]"
                      : "bg-white border-[#E7DFCF] text-[#1A1A1A] hover:border-[#D4AF37]"
                  }`}
                  data-testid={`menu-tab-${t.key}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button aria-label="Next" onClick={() => scrollTabs(1)} className="hidden md:grid place-items-center h-9 w-9 rounded-full border border-[#E7DFCF] bg-white hover:bg-[#F6EFE2] shrink-0" data-testid="tabs-next">
              <ChevronRight size={16}/>
            </button>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6c1e]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all services…"
              className="pl-9 h-11 rounded-full border-[#E7DFCF] bg-white focus-visible:ring-[#D4AF37]"
              data-testid="menu-search-input"
            />
          </div>
        </div>

        {/* CATEGORY HERO */}
        {!query && tabDef && (
          <div className="mt-8 relative rounded-3xl overflow-hidden border border-[#E7DFCF] h-40">
            <img src={CATEGORY_IMAGES[Object.keys(CATEGORY_IMAGES).find((k) => tabDef.match({category:k, subcategory:""})) || "Women's Services"] || CATEGORY_IMAGES["Women's Services"]} alt={tabDef.label} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"/>
            <div className="absolute inset-0 flex items-center px-8">
              <div className="text-white">
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">Category</div>
                <div className="font-serif-kbs text-3xl mt-1">{tabDef.label}</div>
                <div className="text-xs mt-1 text-[#E5C1CD]">{filtered.length} services</div>
              </div>
            </div>
          </div>
        )}

        {/* ACCORDION SUBCATEGORY LIST */}
        <div className="mt-8">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 text-[#8a6c1e]">No services match your search.</div>
          ) : (
            <Accordion type="multiple" defaultValue={Object.keys(grouped)} className="space-y-3">
              {Object.entries(grouped).map(([sub, items]) => (
                <AccordionItem key={sub} value={sub} className="rounded-2xl border border-[#E7DFCF] bg-white overflow-hidden data-[state=open]:shadow-[0_18px_40px_-24px_rgba(26,26,26,0.18)]">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline group [&>svg]:hidden" data-testid={`accordion-${sub}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-serif-kbs text-xl text-[#1A1A1A]">{sub}</div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-[#8a6c1e] mt-0.5">{items.length} services</div>
                      </div>
                      <ChevronDown size={18} className="text-[#8a6c1e] transition-transform duration-300 group-data-[state=open]:rotate-180"/>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-3">
                    {items.map((s) => (
                      <ServiceRow key={s.id} s={s} onAdd={onAdd} isSelected={isSelected(s.id)} />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
