import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrendingSection from "../components/TrendingSection";
import MenuSection from "../components/MenuSection";
import StylistsSection from "../components/StylistsSection";
import BridalSection from "../components/BridalSection";
import BookingModal from "../components/BookingModal";
import Reviews from "../components/Reviews";
import About from "../components/About";
import { MessageCircle } from "lucide-react";
import { SALON } from "../lib/kbs";
import { useCart } from "../lib/CartContext";
import { useSalonData } from "../lib/useSalonData";

const Home = () => {
  const { services } = useSalonData();
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const { addItem, items, setCartOpen } = useCart();

  // "Add to Booking" → keeps Quick Appointment flow AND syncs to cart
  const onAddQuick = (s) => {
    setSelected((prev) => (prev.some((x) => x.id === s.id) ? prev : [...prev, s]));
    addItem(s);
  };

  const openBooking = () => setOpen(true);
  const scrollToMenu = () => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  const onQuickBook = (searchName) => { setMenuQuery(searchName); setTimeout(scrollToMenu, 60); };

  return (
    <>
      <Navbar onBookClick={openBooking} onMenuClick={scrollToMenu} />
      <Hero onBookClick={openBooking} onMenuClick={scrollToMenu} />
      <TrendingSection onQuickBook={onQuickBook} />
      <MenuSection services={services} onAdd={onAddQuick} selected={selected} initialQuery={menuQuery} />
      <StylistsSection onBookClick={openBooking} />
      <BridalSection services={services} onAdd={onAddQuick} selected={selected} />
      <Reviews />
      <About />

      <BookingModal open={open} onOpenChange={setOpen} selected={selected} setSelected={setSelected} allServices={services} />

      <a
        href={`https://wa.me/${SALON.phoneWa}?text=${encodeURIComponent("Hi KBS Beauty Saloon, I'd like to know more.")}`}
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full grid place-items-center shadow-2xl z-30"
        style={{ background: "#25D366", color: "white" }}
        data-testid="floating-whatsapp-btn"
      ><MessageCircle size={22}/></a>

      {(selected.length > 0 || items.length > 0) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {selected.length > 0 && (
            <button onClick={openBooking} className="btn-onyx px-5 py-3 rounded-full text-sm font-semibold shadow-2xl inline-flex items-center gap-2" data-testid="floating-quick-btn">
              Quick Book · {selected.length} →
            </button>
          )}
          {items.length > 0 && (
            <button onClick={() => setCartOpen(true)} className="btn-gold px-5 py-3 rounded-full text-sm font-semibold shadow-2xl inline-flex items-center gap-2" data-testid="floating-cart-btn">
              Cart · {items.length} · ₹{items.reduce((s,x)=>s+(x.price||0),0).toLocaleString()} →
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
