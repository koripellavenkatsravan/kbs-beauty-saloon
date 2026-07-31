import React, { useEffect, useState } from "react";
import { LOGO_URL, SALON } from "../lib/kbs";
import { Phone, ShoppingBag, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useCart } from "../lib/CartContext";

const Navbar = ({ onBookClick, onMenuClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setAuthOpen, logout } = useAuth();
  const { items, setCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "backdrop-blur-2xl bg-[#FDFBF7]/80 border-b border-[#E7DFCF] shadow-[0_10px_30px_-20px_rgba(26,26,26,0.25)]"
                 : "backdrop-blur-md bg-[#FDFBF7]/50 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-10 h-24 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-4 group shrink-0" data-testid="navbar-logo">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-[#D4AF37]/30 blur-lg opacity-70 group-hover:opacity-100 transition-opacity"/>
            <img src={LOGO_URL} alt="KBS" className="relative h-16 w-16 object-contain drop-shadow-[0_2px_10px_rgba(212,175,55,0.55)] transition-transform duration-500 group-hover:scale-105"/>
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-serif-kbs text-[22px] tracking-tight text-[#1A1A1A]">KBS Beauty Saloon</div>
            <div className="text-[10px] tracking-[0.30em] text-[#B7902B] uppercase">Luxury · Wellness</div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-sm">
          <a href="#menu" onClick={onMenuClick} className="hover:text-[#B7902B] transition-colors" data-testid="nav-menu">Menu</a>
          <a href="#stylists" className="hover:text-[#B7902B] transition-colors" data-testid="nav-stylists">Stylists</a>
          <a href="#bridal" className="hover:text-[#B7902B] transition-colors" data-testid="nav-bridal">Bridal & Groom</a>
          <button onClick={() => setCartOpen(true)} className="hover:text-[#B7902B] transition-colors" data-testid="nav-cart">Cart</button>
          <a href="#contact" className="hover:text-[#B7902B] transition-colors" data-testid="nav-contact">Contact</a>
          <Link to="/admin" className="hover:text-[#B7902B] transition-colors text-[#8a6c1e] text-xs" data-testid="nav-admin">Manager</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a href={`tel:+${SALON.phoneWa}`} className="hidden md:flex items-center gap-2 text-xs text-[#3d3d3d]" data-testid="nav-phone">
            <Phone size={14} className="text-[#B7902B]"/> {SALON.phoneDisplay}
          </a>

          <button onClick={() => setCartOpen(true)} className="relative h-10 w-10 rounded-full border border-[#E7DFCF] bg-white grid place-items-center hover:border-[#D4AF37] transition" data-testid="navbar-cart-btn">
            <ShoppingBag size={16} className="text-[#1A1A1A]"/>
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold grid place-items-center">{items.length}</span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen((v)=>!v)} className="h-10 pl-2 pr-3 rounded-full border border-[#E7DFCF] bg-white flex items-center gap-2 hover:border-[#D4AF37] transition" data-testid="navbar-user-btn">
                <div className="h-7 w-7 rounded-full bg-[#1A1A1A] text-[#D4AF37] grid place-items-center text-xs font-semibold">{user.name?.[0]?.toUpperCase() || "K"}</div>
                <span className="text-xs font-medium hidden sm:inline">{user.name?.split(" ")[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E7DFCF] bg-white shadow-xl overflow-hidden" onMouseLeave={() => setMenuOpen(false)}>
                  <div className="px-4 py-3 border-b border-[#E7DFCF]">
                    <div className="text-xs text-[#6b6b6b]">Loyalty Points</div>
                    <div className="font-serif-kbs text-2xl text-[#B7902B]">{user.loyalty_points || 0}</div>
                  </div>
                  <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-[#F6EFE2] inline-flex items-center gap-2 w-full" data-testid="menu-profile"><UserIcon size={14}/> My Profile</Link>
                  <Link to="/admin" className="block px-4 py-2.5 text-sm hover:bg-[#F6EFE2] inline-flex items-center gap-2 w-full" data-testid="menu-admin"><LayoutDashboard size={14}/> Manager Dashboard</Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F6EFE2] inline-flex items-center gap-2 text-[#7a2b2b]" data-testid="menu-logout"><LogOut size={14}/> Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="btn-outline-gold px-4 py-2 rounded-full text-xs font-medium hidden sm:inline-flex" data-testid="navbar-signin-btn">Sign In / Sign Up</button>
          )}

          <button onClick={onBookClick} className="btn-gold px-5 py-2.5 rounded-full text-sm font-medium" data-testid="navbar-book-btn">
            Book Now
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
