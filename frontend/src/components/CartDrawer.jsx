import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, LogIn } from "lucide-react";
import { useCart } from "../lib/CartContext";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { items, cartOpen, setCartOpen, removeItem, subtotal, tax, total } = useCart();
  const { user, setAuthOpen } = useAuth();
  const navigate = useNavigate();

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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FDFBF7] z-50 shadow-2xl flex flex-col"
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
              <div className="border-t border-[#E7DFCF] p-6 bg-white space-y-2">
                <div className="flex justify-between text-sm text-[#3d3d3d]"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-[#3d3d3d]"><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-serif-kbs text-2xl pt-1 border-t border-[#E7DFCF]"><span>Total</span><span className="text-[#B7902B]">₹{total.toLocaleString()}</span></div>

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
