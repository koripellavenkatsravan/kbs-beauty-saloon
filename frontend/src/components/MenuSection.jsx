import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, ChevronDown, User, UserRound } from "lucide-react";
import { Input } from "../components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { VISUAL_CATEGORIES, priceLabel } from "../lib/kbs";

const ServiceRow = ({ s, onAdd, isSelected }) => {
  const [justAdded, setJustAdded] = useState(false);
  const handle = () => {
    if (!isSelected) { setJustAdded(true); setTimeout(() => setJustAdded(false), 900); }
    onAdd(s);
  };
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-[#EFE4D6] last:border-0">
      <div className="min-w-0">
        <div className="font-serif-kbs text-[17px] text-[#1A1A1A] truncate">{s.name}</div>
        {s.description && <div className="text-[11px] text-[#8a6c1e]">{s.description}</div>}
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
                <Check size={14}/> Added
              </motion.span>
            ) : (
              <motion.span key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                <Plus size={14}/> Add
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

const MenuSection = ({ services, onAdd, selected, initialQuery = "" }) => {
  const [gender, setGender] = useState("women");
  const [query, setQuery] = useState(initialQuery);

  // Sync when parent triggers a quick-book
  React.useEffect(() => { setQuery(initialQuery || ""); }, [initialQuery]);

  const activeCategories = VISUAL_CATEGORIES[gender];

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (!s.available) return false;
      if (s.category === "Bridal & Groom") return false; // exclude, has its own section
      return true;
    });
  }, [services]);

  const q = query.trim().toLowerCase();
  const searchMode = q.length > 0;

  const searchResults = useMemo(() => {
    if (!searchMode) return [];
    return filteredServices.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.subcategory.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }, [filteredServices, q, searchMode]);

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
            Choose your side, browse gorgeous category cards, and tap Add on the services you love.
          </p>
        </div>

        {/* GENDER TOGGLE + SEARCH */}
        <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="inline-flex p-1.5 rounded-full bg-white border border-[#E7DFCF] self-center md:self-auto">
            <button
              onClick={() => setGender("men")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium inline-flex items-center gap-2 transition ${
                gender === "men" ? "bg-[#1A1A1A] text-[#D4AF37]" : "text-[#1A1A1A] hover:bg-[#F6EFE2]"
              }`}
              data-testid="gender-toggle-men"
            >
              <User size={16}/> Men's Services
            </button>
            <button
              onClick={() => setGender("women")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium inline-flex items-center gap-2 transition ${
                gender === "women" ? "bg-[#1A1A1A] text-[#D4AF37]" : "text-[#1A1A1A] hover:bg-[#F6EFE2]"
              }`}
              data-testid="gender-toggle-women"
            >
              <UserRound size={16}/> Women's Services
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6c1e]"/>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all services…"
              className="pl-9 h-11 rounded-full border-[#E7DFCF] bg-white focus-visible:ring-[#D4AF37]"
              data-testid="menu-search-input"
            />
          </div>
        </div>

        {/* Search results view */}
        {searchMode ? (
          <div className="mt-10 kbs-card rounded-3xl p-5 sm:p-7 border-[#E7DFCF]">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e] mb-2">Search Results · {searchResults.length}</div>
            {searchResults.length === 0 ? (
              <div className="py-10 text-center text-[#8a6c1e]">No services match "{query}"</div>
            ) : (
              searchResults.map((s) => <ServiceRow key={s.id} s={s} onAdd={onAdd} isSelected={isSelected(s.id)} />)
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6">
            {activeCategories.map((cat) => {
              const items = filteredServices.filter(cat.match);
              if (items.length === 0) return null;
              const grouped = {};
              for (const s of items) {
                if (!grouped[s.subcategory]) grouped[s.subcategory] = [];
                grouped[s.subcategory].push(s);
              }
              return (
                <div key={cat.key} className="rounded-3xl overflow-hidden border border-[#E7DFCF] bg-white shadow-[0_18px_40px_-30px_rgba(26,26,26,0.2)]" data-testid={`cat-card-${cat.key}`}>
                  {/* Category banner header */}
                  <div className="relative h-56 sm:h-64">
                    <img src={cat.image} alt={cat.title} className="absolute inset-0 w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"/>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-white">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">{items.length} services</div>
                      <div className="font-serif-kbs text-3xl sm:text-4xl mt-1">{cat.title}</div>
                      <div className="text-[12px] uppercase tracking-[0.22em] text-[#E5C1CD] mt-1">{cat.subtitle}</div>
                    </div>
                  </div>

                  {/* Subcategory accordion */}
                  <div className="p-4 sm:p-6">
                    <Accordion type="multiple" defaultValue={Object.keys(grouped)} className="space-y-2">
                      {Object.entries(grouped).map(([sub, list]) => (
                        <AccordionItem key={sub} value={sub} className="border border-[#E7DFCF] rounded-2xl overflow-hidden bg-[#FDFBF7]">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline group [&>svg]:hidden" data-testid={`accordion-${cat.key}-${sub}`}>
                            <div className="flex items-center justify-between w-full">
                              <div className="text-left">
                                <div className="font-serif-kbs text-lg text-[#1A1A1A]">{sub}</div>
                                <div className="text-[10px] uppercase tracking-[0.22em] text-[#8a6c1e] mt-0.5">{list.length} items</div>
                              </div>
                              <ChevronDown size={18} className="text-[#8a6c1e] transition-transform duration-300 group-data-[state=open]:rotate-180"/>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-2 bg-white">
                            {list.map((s) => <ServiceRow key={s.id} s={s} onAdd={onAdd} isSelected={isSelected(s.id)} />)}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
