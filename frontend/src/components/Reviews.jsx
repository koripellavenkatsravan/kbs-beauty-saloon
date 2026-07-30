import React from "react";
import { motion } from "framer-motion";
import { Star, Play, Scissors, Sparkles } from "lucide-react";

const VIDEO_URL = "https://customer-assets-v7afamib.emergentagent.net/job_elegant-salon-app/artifacts/j6mx9v2z_Video-94355.mp4";

const REVIEWS = [
  {
    name: "Vishwa Srija",
    text: "I absolutely love KBS Salon! The vibe there is so welcoming and relaxing, and the service is always on point. Big shoutout to Neeraj — he's super skilled and really pays attention to every little detail. Always leaves me feeling happy with the results. Totally recommend it!",
    tags: [],
  },
  {
    name: "Martin Steven",
    badge: "Local Guide",
    text: "I had an amazing experience at KBS Salon with Neeraj — hands down the best stylist I've ever had! Neeraj's expertise and creativity transformed my look exactly as I envisioned. The attention to detail was incredible, and his friendly, approachable vibe made the whole visit so enjoyable.",
    tags: ["Shaving", "Haircut"],
  },
  {
    name: "Suchitra Angelina",
    text: "I went for hair spa and haircut today. I visit this every year on my birthday and they never fail to impress me with nice cuts. The spa was very nice, the haircut by Neeraj was amazing as well. I'm very much satisfied…",
    tags: ["Blow dry", "Haircut", "Spa services"],
  },
  {
    name: "A Google Reviewer",
    text: "The staff is just so humble and professional. Bujji got magic in her hands! I could say she's the queen of eyebrows. Also got done facial and pedicure services — glad I got a go-to salon in SJ Nagar!",
    tags: ["Threading", "Facial", "Pedicure"],
  },
];

const Stars = () => (
  <div className="flex items-center gap-0.5 text-[#D4AF37]">
    {[0,1,2,3,4].map((i) => <Star key={i} size={14} fill="currentColor"/>)}
  </div>
);

const Reviews = () => {
  return (
    <section id="reviews" className="py-24 px-5 sm:px-10 bg-[#FDFBF7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Video */}
          <div className="lg:col-span-6">
            <div className="text-[11px] tracking-[0.28em] uppercase text-[#B7902B]">Client Transformations</div>
            <h2 className="font-serif-kbs text-4xl sm:text-5xl mt-3 text-[#1A1A1A] kbs-hairline">
              Real Client Results: <span className="italic text-[#B7902B]">Hair Styling & Volume Bounce.</span>
            </h2>
            <p className="mt-4 text-[#3d3d3d] text-[15px] leading-relaxed max-w-lg">
              A 14-second glimpse of a fresh cut, blow-dry setting and that signature KBS bounce.
              Styled with care and precision by our senior stylist.
            </p>

            <div className="relative mt-8 rounded-3xl overflow-hidden border border-[#E7DFCF] shadow-[0_40px_80px_-30px_rgba(26,26,26,0.35)] bg-black">
              <video
                src={VIDEO_URL}
                controls
                loop
                playsInline
                muted
                autoPlay
                className="w-full aspect-video object-cover"
                data-testid="transformation-video"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 kbs-glass-dark rounded-full px-3.5 py-1.5 inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-[#FDFBF7]">
                <Scissors size={12} className="text-[#D4AF37]"/> Styled by Neeraj
              </div>
              <div className="absolute top-4 right-4 kbs-glass-dark rounded-full px-3 py-1.5 inline-flex items-center gap-1.5 text-[11px] text-[#FDFBF7]">
                <Play size={12} className="text-[#D4AF37]" fill="#D4AF37"/> 0:14
              </div>
              <div className="absolute bottom-4 left-4 chip-gold rounded-full px-3 py-1 text-[10px] tracking-widest uppercase">
                Threading & Facials: Bujji
              </div>
            </div>
          </div>

          {/* RIGHT: Reviews */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-[11px] tracking-[0.28em] uppercase text-[#B7902B]">What Our Clients Say on Google</div>
            </div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-full bg-white border border-[#E7DFCF] grid place-items-center">
                <span className="font-serif-kbs text-lg text-[#4285F4]">G</span>
              </div>
              <div>
                <div className="font-serif-kbs text-3xl text-[#1A1A1A] leading-none">5.0 <span className="text-[#D4AF37] text-xl">★</span></div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6c1e]">Google Rating · Verified</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {REVIEWS.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="kbs-card rounded-2xl p-5"
                  data-testid={`review-${i}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif-kbs text-lg text-[#1A1A1A] leading-tight">{r.name}</div>
                      {r.badge && <div className="text-[10px] uppercase tracking-widest text-[#4285F4] mt-0.5">{r.badge}</div>}
                    </div>
                    <Stars />
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#3d3d3d]">"{r.text}"</p>
                  {r.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {r.tags.map((t) => (
                        <span key={t} className="chip-rose text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-[#8a6c1e]">
              <Sparkles size={12} className="text-[#D4AF37]"/> Real reviews sourced from Google Business
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
