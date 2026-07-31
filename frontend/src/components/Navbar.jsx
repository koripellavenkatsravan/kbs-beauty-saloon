import React, { useEffect, useState } from "react";
import { LOGO_URL, SALON } from "../lib/kbs";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = ({ onBookClick, onMenuClick }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-2xl bg-[#FDFBF7]/70 border-b border-[#E7DFCF] shadow-[0_10px_30px_-20px_rgba(26,26,26,0.25)]"
          : "backdrop-blur-md bg-[#FDFBF7]/40 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-10 h-24 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-4 group" data-testid="navbar-logo">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#D4AF37]/25 blur-lg opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
            <img
              src={LOGO_URL}
              alt="KBS"
              className="relative h-16 w-16 object-contain drop-shadow-[0_2px_10px_rgba(212,175,55,0.35)] transition-transform duration-500 group-hover:scale-105"
              style={{ filter: "drop-shadow(0 0 8px rgba(212,175,55,0.25))" }}
            />
          </div>
          <div className="leading-tight">
            <div className="font-serif-kbs text-[22px] tracking-tight text-[#1A1A1A]">KBS Beauty Saloon</div>
            <div className="text-[10px] tracking-[0.30em] text-[#B7902B] uppercase">Luxury · Wellness</div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-sm">
          <a href="#menu" onClick={onMenuClick} className="hover:text-[#B7902B] transition-colors" data-testid="nav-menu">Menu</a>
          <a href="#trending" className="hover:text-[#B7902B] transition-colors" data-testid="nav-trending">Trending</a>
          <a href="#reviews" className="hover:text-[#B7902B] transition-colors" data-testid="nav-reviews">Reviews</a>
          <a href="#about" className="hover:text-[#B7902B] transition-colors" data-testid="nav-about">About</a>
          <a href="#bridal" className="hover:text-[#B7902B] transition-colors" data-testid="nav-bridal">Bridal</a>
          <a href="#contact" className="hover:text-[#B7902B] transition-colors" data-testid="nav-contact">Contact</a>
          <Link to="/admin" className="hover:text-[#B7902B] transition-colors" data-testid="nav-admin">Manager</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a href={`tel:+${SALON.phoneWa}`} className="hidden sm:flex items-center gap-2 text-xs text-[#3d3d3d]" data-testid="nav-phone">
            <Phone size={14} className="text-[#B7902B]" />
            {SALON.phoneDisplay}
          </a>
          <button onClick={onBookClick} className="btn-gold px-5 py-2.5 rounded-full text-sm font-medium" data-testid="navbar-book-btn">
            Book Now
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
