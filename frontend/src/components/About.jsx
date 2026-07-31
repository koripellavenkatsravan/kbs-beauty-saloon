import React from "react";
import { SHOP_PHOTOS, SALON } from "../lib/kbs";
import { MapPin, Phone, Mail, Clock, Star, Navigation } from "lucide-react";

const About = () => {
  return (
    <>
      <section id="about" className="py-24 px-5 sm:px-10 bg-[#F6EFE2] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="text-[11px] tracking-[0.28em] uppercase text-[#B7902B]">The House of KBS</div>
            <h2 className="font-serif-kbs text-4xl sm:text-5xl mt-3 text-[#1A1A1A] kbs-hairline">A luxury address for beauty in Sujatha Nagar.</h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[#3d3d3d] max-w-xl">
              KBS Beauty Saloon is a boutique salon designed for people who care about the small
              things — the tea that greets you, the temperature of the water, the pressure of a
              foot reflexology, the exact tone of your gold streaks. We use premium brands
              (L'Oréal Majirel & Inoa, O3+, Shehnaz, Nashi, Moroccan) and skilled hands to make
              every appointment feel curated.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E7DFCF]">
                <div className="font-serif-kbs text-3xl text-[#B7902B]">120+</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#8a6c1e]">Signature Services</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E7DFCF]">
                <div className="font-serif-kbs text-3xl text-[#B7902B]">7yr</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#8a6c1e]">Of craft</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E7DFCF]">
                <div className="font-serif-kbs text-3xl text-[#B7902B]">4.9<Star size={14} className="inline -mt-3 ml-1 text-[#D4AF37]" fill="currentColor"/></div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#8a6c1e]">Guest rating</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {SHOP_PHOTOS.map((src, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden border border-[#E7DFCF] ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/5]"}`}>
                <img src={src} alt={`Shop ${i}`} className="w-full h-full object-cover"/>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-5 sm:px-10 kbs-dark-panel relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase text-[#D4AF37]">Visit us</div>
            <h2 className="font-serif-kbs text-4xl sm:text-5xl mt-3 text-[#FDFBF7] kbs-hairline">Come, be pampered.</h2>
            <p className="mt-5 text-[#c8c8c8] max-w-lg text-[15px] leading-relaxed">Walk-ins welcome — but for our top stylists we recommend booking a slot online.</p>

            <div className="mt-8 space-y-4 text-[#EBE3D2]">
              <div className="flex items-center gap-3"><MapPin size={18} className="text-[#D4AF37] mt-1 shrink-0"/><span>{SALON.address}</span></div>
              <div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SALON.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold btn-gold"
                  data-testid="get-directions-btn"
                >
                  <Navigation size={14}/> Get Directions
                </a>
              </div>
              <div className="flex items-center gap-3"><Phone size={18} className="text-[#D4AF37]"/><a href={`tel:+${SALON.phoneWa}`} className="hover:text-[#D4AF37]" data-testid="contact-phone">+91 {SALON.phoneDisplay}</a></div>
              <div className="flex items-center gap-3"><Mail size={18} className="text-[#D4AF37]"/><a href={`mailto:${SALON.email}`} className="hover:text-[#D4AF37]" data-testid="contact-email">{SALON.email}</a></div>
              <div className="flex items-center gap-3"><Clock size={18} className="text-[#D4AF37]"/><span>Mon – Sun · 10:00 AM – 08:00 PM</span></div>
            </div>
          </div>

          <div className="kbs-glass-dark rounded-3xl overflow-hidden aspect-video">
            <iframe
              title="KBS Map"
              src="https://www.google.com/maps?q=Sujatha%20Nagar%20Chinnamusidivada%20Andhra%20Pradesh%20530051&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <footer className="bg-[#1A1A1A] text-[#EBE3D2] py-8 px-5 sm:px-10 text-center border-t border-[#3a3a3a]">
        <div className="text-[10px] tracking-[0.42em] uppercase text-[#D4AF37]">KBS Beauty Saloon · Est. 2018</div>
        <div className="mt-2 text-xs text-[#9c9c9c]">© {new Date().getFullYear()} All rights reserved · Crafted with warmth.</div>
      </footer>
    </>
  );
};

export default About;
