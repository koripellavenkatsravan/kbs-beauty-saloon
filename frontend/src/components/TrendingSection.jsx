import React from "react";
import { motion } from "framer-motion";
import { Scissors, Flower, Waves, Sparkles, ArrowRight } from "lucide-react";

const TRENDING = [
  {
    key: "men-haircut",
    icon: Scissors,
    title: "Men's Haircut & Beard Trim",
    tagline: "Classic tailored grooming",
    filterName: "Hair Cut",
    gradient: "from-[#1A1A1A] to-[#3a2a1a]",
    image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/ghca5ths_image.png",
  },
  {
    key: "threading",
    icon: Flower,
    title: "Women's Threading & Eyebrows",
    tagline: "Queen of arches — precise & painless",
    filterName: "Threading",
    gradient: "from-[#7a4757] to-[#c89aa9]",
    image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/mwt96e4k_image.png",
  },
  {
    key: "hair-spa",
    icon: Waves,
    title: "Deep Nourishing Hair Spa",
    tagline: "Argan · Nashi · Moroccan rituals",
    filterName: "Hair Spa",
    gradient: "from-[#8a6c1e] to-[#d4af37]",
    image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/40c7qthn_image.png",
  },
  {
    key: "korean-combo",
    icon: Sparkles,
    title: "Glass Skin Korean Spa Combo",
    tagline: "Spa + Pedicure + Facial · ₹10,000",
    filterName: "Korean Combo",
    gradient: "from-[#1A1A1A] to-[#5a4a1a]",
    image: "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/hx1b7lp1_image.png",
  },
];

const TrendingSection = ({ onQuickBook }) => {
  return (
    <section id="trending" className="relative py-20 px-5 sm:px-10 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase text-[#B7902B] inline-flex items-center gap-2">
              <span className="text-lg">🔥</span> Trending This Season
            </div>
            <h2 className="font-serif-kbs text-4xl sm:text-5xl text-[#1A1A1A] mt-3 kbs-hairline">
              Most Loved <span className="italic text-[#B7902B]">Rituals.</span>
            </h2>
          </div>
          <p className="text-[#3d3d3d] text-sm max-w-md">
            Book straight from here — the four services our clients ask for on repeat this month.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRENDING.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="relative rounded-3xl overflow-hidden border border-[#E7DFCF] group cursor-pointer h-72 shadow-[0_18px_40px_-24px_rgba(26,26,26,0.25)]"
                onClick={() => onQuickBook(t.filterName)}
                data-testid={`trending-card-${t.key}`}
              >
                <img src={t.image} alt={t.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                <div className={`absolute inset-0 bg-gradient-to-t ${t.gradient} opacity-75`}/>
                <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                  <div className="h-11 w-11 rounded-full kbs-glass-dark grid place-items-center">
                    <Icon size={18} className="text-[#D4AF37]"/>
                  </div>
                  <div>
                    <div className="font-serif-kbs text-2xl leading-tight">{t.title}</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] mt-1 text-[#E5C1CD]">{t.tagline}</div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4AF37] group-hover:gap-3 transition-all">
                      Direct Book <ArrowRight size={14}/>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
