import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MenuSection from "../components/MenuSection";
import BookingModal from "../components/BookingModal";
import Reviews from "../components/Reviews";
import About from "../components/About";
import { MessageCircle } from "lucide-react";
import { SALON } from "../lib/kbs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API}/services`).then((r) => setServices(r.data)).catch(() => setServices([]));
  }, []);

  const onAdd = (s) => {
    setSelected((prev) => (prev.some((x) => x.id === s.id) ? prev : [...prev, s]));
  };

  const openBooking = () => setOpen(true);
  const scrollToMenu = () => {
    const el = document.getElementById("menu");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar onBookClick={openBooking} onMenuClick={scrollToMenu} />
      <Hero onBookClick={openBooking} onMenuClick={scrollToMenu} />
      <MenuSection services={services} onAdd={onAdd} selected={selected} />
      <Reviews />
      <About />

      <BookingModal
        open={open}
        onOpenChange={setOpen}
        selected={selected}
        setSelected={setSelected}
        allServices={services}
      />

      {/* Floating WA + cart */}
      <a
        href={`https://wa.me/${SALON.phoneWa}?text=${encodeURIComponent("Hi KBS Beauty Saloon, I'd like to know more.")}`}
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full grid place-items-center shadow-2xl z-30"
        style={{ background: "#25D366", color: "white" }}
        aria-label="WhatsApp"
        data-testid="floating-whatsapp-btn"
      >
        <MessageCircle size={22}/>
      </a>

      {selected.length > 0 && (
        <button
          onClick={openBooking}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 btn-gold px-6 py-3 rounded-full text-sm font-semibold shadow-2xl z-30 inline-flex items-center gap-2"
          data-testid="floating-cart-btn"
        >
          {selected.length} service{selected.length > 1 ? "s" : ""} · Continue to Book →
        </button>
      )}
    </>
  );
};

export default Home;
