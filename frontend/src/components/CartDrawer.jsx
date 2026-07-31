import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, LogIn, Plus } from "lucide-react";
import { useCart } from "../lib/CartContext";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Popular add-on service names to recommend
const ADDON_NAMES = ["D-Tan Face", "Shampoo & Conditioner", "Threading - Eyebrows", "Basic Manicure", "Basic Pedicure", "Head Massage - Coconut Oil"];

const CartDrawer = () => {
  const { items, cartOpen, setCartOpen, removeItem, subtotal, total, addItem } = useCart();
  const { user, setAuthOpen } = useAuth();
  const navigate = useNavigate();
  const [addOns, setAddOns] = useState([]);

  useEffect(() => {
    if (!cartOpen) return;
    axios.get(`${API}/services`).then((r) => {
      const suggestions = ADDON_NAMES
        .map((n) => r.data.find((s) => s.name === n))
        .filter(Boolean);
      setAddOns(suggestions);
    }).catch(() => {});
  }, [cartOpen]);

  const recommended = addOns.filter((s) => !items.some((i) => i.service_id === s.id)).slice(0, 3);

  const proceed = () => {
    if (!user) { setAuthOpen(true); return; }
    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm z-40"
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FDFBF7]/85 dark:bg-[#0F0F11]/85 backdrop-blur-2xl z-50 shadow-2xl flex flex-col border-l border-[#E7DFCF] dark:border-[#2a2a30]"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7DFCF] kbs-dark-panel">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">Your Cart</div>
                <div className="font-serif-kbs text-2xl text-[#FDFBF7] mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</div>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-[#2a2a2a] text-white" data-testid="cart-close"><X size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto menu-scroll p-6 space-y-3">
              {items.length === 0 ? (
                <div className="h-full grid place-items-center text-center">
                  <div>
                    <ShoppingBag className="mx-auto text-[#B7902B]" size={40}/>
                    <div className="font-serif-kbs text-xl mt-3">Your cart is empty</div>
                    <div className="text-sm text-[#6b6b6b] mt-1">Add services from the menu to build your order.</div>
                  </div>
                </div>
              ) : items.map((i) => (
                <div key={i.service_id} className="flex items-center justify-between border border-[#E7DFCF] rounded-2xl p-4 bg-white" data-testid={`cart-item-${i.service_id}`}>
                  <div className="min-w-0 pr-3">
                    <div className="font-serif-kbs text-[16px] text-[#1A1A1A] truncate">{i.name}</div>
                    <div className="text-[11px] tracking-widest uppercase text-[#8a6c1e]">Service</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="font-serif-kbs text-lg text-[#B7902B]">₹{i.price.toLocaleString()}</div>
                    <button onClick={() => removeItem(i.service_id)} className="p-2 rounded-full hover:bg-[#F6EFE2]" data-testid={`cart-remove-${i.service_id}`}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#E7DFCF] dark:border-[#2a2a30] p-6 bg-white dark:bg-[#1A1A1E] space-y-3">
                {recommended.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[#8a6c1e] mb-2 inline-flex items-center gap-1">
                      <Sparkles size={11} className="text-[#D4AF37]"/> Recommended Add-ons
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recommended.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => addItem(r)}
                          className="text-[11px] px-3 py-1.5 rounded-full border border-[#E7DFCF] dark:border-[#2a2a30] bg-white dark:bg-[#1A1A1E] hover:border-[#D4AF37] hover:text-[#B7902B] transition inline-flex items-center gap-1"
                          data-testid={`addon-${r.id}`}
                        >
                          <Plus size={11}/> {r.name} · ₹{r.price}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-sm text-[#3d3d3d] dark:text-[#c8c8c8]"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between font-serif-kbs text-2xl pt-1 border-t border-[#E7DFCF] dark:border-[#2a2a30]"><span>Total</span><span className="text-[#B7902B]">₹{total.toLocaleString()}</span></div>

                <button onClick={proceed} className="w-full btn-gold py-3 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 mt-3" data-testid="cart-checkout-btn">
                  {user ? <><Sparkles size={14}/> Proceed to Checkout <ArrowRight size={14}/></> : <><LogIn size={14}/> Sign In to Checkout</>}
                </button>
                <div className="text-[11px] text-center text-[#8a6c1e]">Secure UPI payment · Direct to salon account</div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
