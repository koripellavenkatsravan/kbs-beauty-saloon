import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, ShoppingBag, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../lib/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Profile = () => {
  const { user, auth, logout, setAuthOpen } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) { setAuthOpen(true); return; }
    axios.get(`${API}/auth/my-bookings`, auth).then((r) => setBookings(r.data)).catch(() => {});
    axios.get(`${API}/auth/my-orders`, auth).then((r) => setOrders(r.data)).catch(() => {});
    // eslint-disable-next-line
  }, [user]);

  if (!user) return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0F0F11]">
      <Navbar onBookClick={() => {}} onMenuClick={() => {}} />
      <div className="max-w-2xl mx-auto p-10 text-center">
        <div className="font-serif-kbs text-3xl">Please sign in to view your profile.</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0F0F11]">
      <Navbar onBookClick={() => {}} onMenuClick={() => {}} />
      <div className="max-w-5xl mx-auto px-5 sm:px-10 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#8a6c1e] hover:text-[#B7902B]"><ArrowLeft size={14}/> Home</Link>

        <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="mt-4 kbs-card rounded-3xl p-6">
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e]">Signed In</div>
          <div className="font-serif-kbs text-3xl mt-1">{user.name}</div>
          <div className="text-sm text-[#6b6b6b] dark:text-[#c8c8c8]">{user.email}{user.phone ? ` · ${user.phone}` : ""}</div>
          <button onClick={logout} className="mt-4 inline-flex items-center gap-1 text-xs text-[#7a2b2b] hover:underline" data-testid="profile-logout"><LogOut size={12}/> Sign Out</button>
        </motion.div>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="kbs-card rounded-3xl p-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e] inline-flex items-center gap-1"><Calendar size={12}/> Appointments</div>
            <div className="font-serif-kbs text-2xl mt-1">Recent Bookings</div>
            {bookings.length === 0 && <div className="text-sm text-[#6b6b6b] dark:text-[#c8c8c8] mt-4">No bookings yet.</div>}
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto menu-scroll">
              {bookings.map((b) => (
                <div key={b.id} className="border border-[#E7DFCF] dark:border-[#2a2a30] rounded-xl p-3 bg-white dark:bg-[#1A1A1E]">
                  <div className="flex items-center justify-between">
                    <div className="font-serif-kbs text-lg">{b.date} · {b.time}</div>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FBF3E6] text-[#8a6c1e] border border-[#EFDCA0]">{b.status}</span>
                  </div>
                  <div className="text-xs text-[#6b6b6b] dark:text-[#c8c8c8]">Stylist: {b.stylist} · {b.services.length} service{b.services.length!==1?"s":""} · ₹{b.total}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="kbs-card rounded-3xl p-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6c1e] inline-flex items-center gap-1"><ShoppingBag size={12}/> Cart Orders</div>
            <div className="font-serif-kbs text-2xl mt-1">Recent Orders</div>
            {orders.length === 0 && <div className="text-sm text-[#6b6b6b] dark:text-[#c8c8c8] mt-4">No orders yet.</div>}
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto menu-scroll">
              {orders.map((o) => (
                <div key={o.id} className="border border-[#E7DFCF] dark:border-[#2a2a30] rounded-xl p-3 bg-white dark:bg-[#1A1A1E]">
                  <div className="flex items-center justify-between">
                    <div className="font-serif-kbs text-lg">#{o.id.slice(0,8).toUpperCase()}</div>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FBF3E6] text-[#8a6c1e] border border-[#EFDCA0]">{o.status}</span>
                  </div>
                  <div className="text-xs text-[#6b6b6b] dark:text-[#c8c8c8]">{o.items.length} item{o.items.length!==1?"s":""} · Total ₹{o.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
