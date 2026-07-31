import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Copy, MessageCircle, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../lib/AuthContext";
import { useCart } from "../lib/CartContext";
import { SALON } from "../lib/kbs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const { user, auth, setAuthOpen, refreshMe } = useAuth();
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payInfo, setPayInfo] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    axios.get(`${API}/payment/info`).then((r) => setPayInfo(r.data));
  }, []);

  useEffect(() => {
    if (!user) { setAuthOpen(true); navigate("/"); }
  }, [user, setAuthOpen, navigate]);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const { data } = await axios.post(`${API}/orders/checkout`, { stylist: "Any Available", notes: "" }, auth);
      setOrder(data.order);
      await refreshMe();
      await clear();
      toast.success(`Order placed! +${data.loyalty_rewarded} loyalty points on payment`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Checkout failed");
    } finally { setPlacing(false); }
  };

  const confirmPaid = async () => {
    if (!order) return;
    setConfirming(true);
    try {
      await axios.post(`${API}/orders/${order.id}/confirm-payment`, {}, auth);
      toast.success("Payment submitted. Our team will verify shortly.");
      setOrder({ ...order, status: "Payment Submitted" });
    } catch { toast.error("Could not confirm — try again"); }
    finally { setConfirming(false); }
  };

  const copy = (t) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  const waHref = order ? `https://wa.me/${SALON.phoneWa}?text=${encodeURIComponent(
    `Hi KBS Beauty Saloon! I've placed order ${order.id.slice(0,8)} for ₹${order.total}. UPI paid to ${SALON.bank.upi}. Please confirm.`
  )}` : "#";

  const subtotal = items.reduce((s, x) => s + (x.price || 0), 0);
  const tax = Math.round(subtotal * 0.18);
  const points = user?.loyalty_points || 0;
  const discount = order ? order.discount : Math.min(points, Math.floor(subtotal / 2));
  const total = subtotal + tax - discount;
  const qrUrl = order ? `${API}/orders/${order.id}/qr` : null;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar onBookClick={() => {}} onMenuClick={() => navigate("/#menu")} />
      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#8a6c1e] hover:text-[#B7902B]" data-testid="checkout-back">
          <ArrowLeft size={14}/> Back to shop
        </Link>
        <div className="text-[11px] tracking-[0.28em] uppercase text-[#B7902B] mt-4">Checkout</div>
        <h1 className="font-serif-kbs text-4xl sm:text-5xl text-[#1A1A1A] mt-2">
          Complete your <span className="italic text-[#B7902B]">order.</span>
        </h1>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* LEFT — Summary */}
          <div className="kbs-card rounded-3xl p-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e]">
              {order ? `Order · ${order.id.slice(0,8).toUpperCase()}` : `Your Cart · ${items.length} item${items.length!==1?"s":""}`}
            </div>
            <div className="font-serif-kbs text-2xl mt-1 text-[#1A1A1A]">{order ? "Order Placed" : "Review"}</div>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto menu-scroll pr-1">
              {(order ? order.items : items).map((i, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-[#EFE4D6] py-2 last:border-0" data-testid={`checkout-item-${idx}`}>
                  <div className="font-serif-kbs text-[15px] text-[#1A1A1A]">{i.name}</div>
                  <div className="text-[#B7902B]">₹{i.price.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{(order ? order.subtotal : subtotal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>₹{(order ? order.tax : tax).toLocaleString()}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-[#1e6b3c]"><span>Loyalty Discount</span><span>− ₹{discount.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between font-serif-kbs text-2xl pt-2 border-t border-[#E7DFCF] mt-2">
                <span>Total</span><span className="text-[#B7902B]">₹{(order ? order.total : total).toLocaleString()}</span>
              </div>
            </div>

            {points > 0 && !order && (
              <div className="mt-4 rounded-2xl bg-[#FBF3E6] border border-[#EFDCA0] p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e]">Loyalty</div>
                <div className="text-sm text-[#1A1A1A] mt-1">You have <b>{points} points</b> — ₹{discount} auto-applied.</div>
              </div>
            )}

            {!order ? (
              <button onClick={placeOrder} disabled={placing || items.length === 0} className="mt-6 w-full btn-gold py-3 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60" data-testid="place-order-btn">
                <Sparkles size={14}/> {placing ? "Placing…" : "Place Order & Show UPI QR"}
              </button>
            ) : (
              <div className="mt-6 rounded-2xl bg-[#D6EEE0] border border-[#5FBC85] text-[#1e6b3c] p-4 text-sm inline-flex items-center gap-2">
                <CheckCircle2 size={16}/> Order placed. Please complete payment on the right.
              </div>
            )}
          </div>

          {/* RIGHT — Payment */}
          <div className="kbs-card rounded-3xl p-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e]">Pay Directly to Salon Account</div>
            <div className="font-serif-kbs text-2xl mt-1 text-[#1A1A1A]">UPI · Bank Transfer</div>

            {!order ? (
              <div className="mt-6 text-sm text-[#8a6c1e]">Place your order to reveal the dynamic UPI QR for ₹{total.toLocaleString()}.</div>
            ) : (
              <>
                <div className="mt-5 grid place-items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-white rounded-3xl border border-[#E7DFCF] shadow-[0_18px_40px_-24px_rgba(26,26,26,0.25)]"
                  >
                    <img src={qrUrl} alt="Pay via UPI" className="w-56 h-56" data-testid="upi-qr-image"/>
                  </motion.div>
                  <div className="mt-3 text-xs text-[#8a6c1e]">Scan with any UPI app (GPay, PhonePe, Paytm, BHIM)</div>
                  <div className="font-serif-kbs text-3xl mt-2 text-[#B7902B]">₹{order.total.toLocaleString()}</div>
                </div>
              </>
            )}

            {payInfo && (
              <div className="mt-6 rounded-2xl border border-[#E7DFCF] bg-white overflow-hidden">
                <div className="px-4 py-3 bg-[#FBF3E6] text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e]">Bank Details</div>
                <div className="px-4 py-3 space-y-2 text-sm">
                  <RowCopy label="UPI ID" value={payInfo.upi_id} onCopy={copy} tid="copy-upi"/>
                  <RowCopy label="Account No." value={payInfo.bank_account} onCopy={copy} tid="copy-acc"/>
                  <RowCopy label="IFSC Code" value={payInfo.bank_ifsc} onCopy={copy} tid="copy-ifsc"/>
                  <RowCopy label="Account Name" value={payInfo.upi_name} onCopy={copy} tid="copy-name"/>
                </div>
              </div>
            )}

            {order && (
              <div className="mt-6 space-y-2">
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="w-full text-sm font-semibold py-3 rounded-full inline-flex items-center justify-center gap-2 text-white" style={{background:"#25D366"}} data-testid="wa-confirm-btn">
                  <MessageCircle size={14}/> Send Payment Proof on WhatsApp
                </a>
                <button onClick={confirmPaid} disabled={confirming || order.status === "Payment Submitted"} className="w-full btn-outline-gold py-3 rounded-full text-sm font-semibold" data-testid="confirm-paid-btn">
                  {order.status === "Payment Submitted" ? "Payment Submitted · Awaiting verification" : (confirming ? "Confirming…" : "I've Completed Payment")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RowCopy = ({ label, value, onCopy, tid }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-[#8a6c1e]">{label}</div>
      <div className="font-mono text-[13px] text-[#1A1A1A]">{value}</div>
    </div>
    <button onClick={() => onCopy(value)} className="p-2 rounded-full hover:bg-[#F6EFE2]" data-testid={tid}><Copy size={14}/></button>
  </div>
);

export default Checkout;
