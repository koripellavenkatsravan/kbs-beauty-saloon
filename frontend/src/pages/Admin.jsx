import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Lock,
  LogOut,
  MessageCircle,
  Search,
  Ban,
  Check,
  X,
  Loader,
  Home as HomeIcon,
} from "lucide-react";
import {
  LOGO_URL,
  SALON,
  priceLabel,
  buildWhatsAppLink,
} from "../lib/kbs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "kbs_manager_token";

const STATUS_COLORS = {
  Pending: "bg-[#FDECC8] text-[#8a6c1e] border-[#D4AF37]",
  Confirmed: "bg-[#D6EEE0] text-[#1e6b3c] border-[#5FBC85]",
  Completed: "bg-[#DCE4F0] text-[#264467] border-[#7B99C4]",
  Cancelled: "bg-[#F5D6D6] text-[#7a2b2b] border-[#C67B7B]",
};

const Admin = () => {
  const [token, setToken] = useState(
    localStorage.getItem(TOKEN_KEY) || ""
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });

  const [blockDate, setBlockDate] = useState(null);
  const [blockTime, setBlockTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");

  const authHeaders = {
    headers: {
      "X-Manager-Token": token,
    },
  };

  const login = async () => {
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/manager/login`, {
        password,
      });

      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);

      toast.success("Welcome back.");
    } catch (e) {
      toast.error("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem(TOKEN_KEY);
  };

  /*
   * IMPORTANT:
   * useCallback keeps loadAll stable between renders.
   * This fixes the Netlify ESLint/React Hook build error.
   */
  const loadAll = useCallback(async () => {
    try {
      const headers = {
        headers: {
          "X-Manager-Token": token,
        },
      };

      const [b, s, bl, st] = await Promise.all([
        axios.get(`${API}/manager/bookings`, headers),
        axios.get(`${API}/services`),
        axios.get(`${API}/manager/slot-blocks`, headers),
        axios.get(`${API}/manager/stats`, headers),
      ]);

      setBookings(b.data);
      setServices(s.data);
      setBlocks(bl.data);
      setStats(st.data);
    } catch (e) {
      if (e?.response?.status === 401) {
        logout();
      }
    }
  }, [token]);

  /*
   * loadAll is now a proper dependency.
   * Netlify ESLint will accept this.
   */
  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token, loadAll]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API}/manager/bookings/${id}`,
        { status },
        authHeaders
      );

      toast.success(`Marked ${status}`);
      loadAll();
    } catch {
      toast.error("Failed to update");
    }
  };

  const toggleAvailable = async (svc) => {
    try {
      await axios.patch(
        `${API}/manager/services/${svc.id}`,
        { available: !svc.available },
        authHeaders
      );

      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const updatePrice = async (svc, priceStr) => {
    const price = parseInt(priceStr, 10);

    if (isNaN(price)) return;

    try {
      await axios.patch(
        `${API}/manager/services/${svc.id}`,
        { price },
        authHeaders
      );

      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const addBlock = async () => {
    if (!blockDate) {
      toast.error("Pick a date");
      return;
    }

    try {
      await axios.post(
        `${API}/manager/slot-blocks`,
        {
          date: format(blockDate, "yyyy-MM-dd"),
          time: blockTime || null,
          reason: blockReason,
        },
        authHeaders
      );

      setBlockDate(null);
      setBlockTime("");
      setBlockReason("");

      loadAll();
      toast.success("Slot blocked");
    } catch {
      toast.error("Failed");
    }
  };

  const removeBlock = async (id) => {
    try {
      await axios.delete(
        `${API}/manager/slot-blocks/${id}`,
        authHeaders
      );

      loadAll();
    } catch {
      toast.error("Failed");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const okStatus =
        statusFilter === "All" || b.status === statusFilter;

      const q = query.trim().toLowerCase();

      const okQ =
        !q ||
        b.full_name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.email.toLowerCase().includes(q);

      return okStatus && okQ;
    });
  }, [bookings, statusFilter, query]);

  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center kbs-hero-bg kbs-grain relative px-5">
        <div className="w-full max-w-md kbs-glass-light rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-5">
            <img
              src={LOGO_URL}
              alt="KBS"
              className="h-11 w-11 object-contain"
            />

            <div>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[#B7902B]">
                Manager Dashboard
              </div>

              <div className="font-serif-kbs text-2xl">
                KBS Beauty Saloon
              </div>
            </div>
          </div>

          <Label>Manager Password</Label>

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && login()
            }
            className="mt-1 h-11 rounded-xl"
            placeholder="Enter password…"
            data-testid="manager-password-input"
          />

          <button
            onClick={login}
            disabled={loading}
            className="mt-4 w-full btn-gold py-3 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2"
            data-testid="manager-login-btn"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Lock size={16} />
            )}

            Enter Dashboard
          </button>

          <Link
            to="/"
            className="mt-4 text-xs text-center block text-[#8a6c1e] hover:text-[#B7902B]"
            data-testid="manager-back-home"
          >
            <HomeIcon
              size={12}
              className="inline mr-1"
            />

            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-[#1A1A1A] text-[#FDFBF7] px-5 sm:px-10 py-4 flex items-center justify-between border-b border-[#3a3a3a]">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="KBS"
            className="h-9 w-9 object-contain"
          />

          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase text-[#D4AF37]">
              Manager Dashboard
            </div>

            <div className="font-serif-kbs text-lg">
              KBS Beauty Saloon
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs hover:text-[#D4AF37]"
            data-testid="admin-view-site"
          >
            <HomeIcon
              size={14}
              className="inline mr-1"
            />

            View Site
          </Link>

          <button
            onClick={logout}
            className="text-xs hover:text-[#D4AF37]"
            data-testid="admin-logout"
          >
            <LogOut
              size={14}
              className="inline mr-1"
            />

            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-5 sm:p-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { k: "total", label: "Total Bookings" },
            { k: "pending", label: "Pending" },
            { k: "confirmed", label: "Confirmed" },
            { k: "completed", label: "Completed" },
          ].map((s) => (
            <div
              key={s.k}
              className="kbs-card rounded-2xl p-5"
            >
              <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a6c1e]">
                {s.label}
              </div>

              <div className="font-serif-kbs text-4xl mt-2 text-[#1A1A1A]">
                {stats[s.k] ?? 0}
              </div>
            </div>
          ))}
        </div>

        <Tabs
          defaultValue="bookings"
          className="w-full"
        >
          <TabsList className="bg-transparent p-0 gap-2 mb-6 flex-wrap">
            <TabsTrigger
              value="bookings"
              className="rounded-full px-6 py-2.5 border border-[#E7DFCF] data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37]"
              data-testid="tab-bookings"
            >
              Bookings
            </TabsTrigger>

            <TabsTrigger
              value="slots"
              className="rounded-full px-6 py-2.5 border border-[#E7DFCF] data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37]"
              data-testid="tab-slots"
            >
              Slot Blocker
            </TabsTrigger>

            <TabsTrigger
              value="menu"
              className="rounded-full px-6 py-2.5 border border-[#E7DFCF] data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37]"
              data-testid="tab-menu"
            >
              Menu Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex gap-2 flex-wrap">
                {[
                  "All",
                  "Pending",
                  "Confirmed",
                  "Completed",
                  "Cancelled",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      statusFilter === s
                        ? "bg-[#1A1A1A] text-[#D4AF37] border-[#1A1A1A]"
                        : "border-[#E7DFCF] bg-white"
                    }`}
                    data-testid={`filter-${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6c1e]"
                />

                <Input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search name, phone, email"
                  className="pl-9 h-10 w-72 rounded-full border-[#E7DFCF] bg-white"
                  data-testid="bookings-search"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredBookings.length === 0 && (
                <div className="text-sm text-[#6b6b6b] py-8 text-center">
                  No bookings yet.
                </div>
              )}

              {filteredBookings.map((b) => {
                const wa = buildWhatsAppLink(b);

                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="kbs-card rounded-2xl p-5"
                  >
                    <div className="grid lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-1">
                        <div className="font-serif-kbs text-xl text-[#1A1A1A]">
                          {b.full_name}
                        </div>

                        <div className="text-xs text-[#6b6b6b]">
                          {b.phone} · {b.email}
                        </div>

                        <div className="text-xs text-[#6b6b6b]">
                          {b.city}, {b.state}
                        </div>

                        <span
                          className={`inline-block mt-2 text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-full ${
                            STATUS_COLORS[b.status]
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="lg:col-span-1">
                        <div className="text-[10px] uppercase tracking-widest text-[#8a6c1e]">
                          Appointment
                        </div>

                        <div className="font-serif-kbs text-lg text-[#1A1A1A] mt-1">
                          {b.date} · {b.time}
                        </div>

                        <div className="text-xs text-[#6b6b6b] mt-1">
                          Stylist: {b.stylist}
                        </div>
                      </div>

                      <div className="lg:col-span-1">
                        <div className="text-[10px] uppercase tracking-widest text-[#8a6c1e]">
                          Services · {b.services.length}
                        </div>

                        <div className="text-xs text-[#3d3d3d] mt-1 space-y-0.5 max-h-24 overflow-y-auto menu-scroll">
                          {b.services.map((s, i) => (
                            <div key={i}>
                              {s.name} — ₹{s.price}
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 font-serif-kbs text-xl text-[#B7902B]">
                          ₹{(b.total || 0).toLocaleString()}
                        </div>
                      </div>

                      <div className="lg:col-span-1 flex flex-wrap gap-2 items-start justify-end">
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-2 rounded-full text-white inline-flex items-center gap-1"
                          style={{ background: "#25D366" }}
                          data-testid={`wa-${b.id}`}
                        >
                          <MessageCircle size={12} />
                          WhatsApp
                        </a>

                        {b.status !== "Confirmed" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                b.id,
                                "Confirmed"
                              )
                            }
                            className="text-xs px-3 py-2 rounded-full border border-[#5FBC85] bg-[#D6EEE0] text-[#1e6b3c]"
                            data-testid={`confirm-${b.id}`}
                          >
                            <Check
                              size={12}
                              className="inline"
                            />
                            Confirm
                          </button>
                        )}

                        {b.status !== "Completed" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                b.id,
                                "Completed"
                              )
                            }
                            className="text-xs px-3 py-2 rounded-full border border-[#7B99C4] bg-[#DCE4F0] text-[#264467]"
                            data-testid={`complete-${b.id}`}
                          >
                            Mark Done
                          </button>
                        )}

                        {b.status !== "Cancelled" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                b.id,
                                "Cancelled"
                              )
                            }
                            className="text-xs px-3 py-2 rounded-full border border-[#C67B7B] bg-[#F5D6D6] text-[#7a2b2b]"
                            data-testid={`cancel-${b.id}`}
                          >
                            <X
                              size={12}
                              className="inline"
                            />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {b.notes && (
                      <div className="mt-3 text-xs text-[#6b6b6b] border-l-2 border-[#D4AF37] pl-3">
                        {b.notes}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="slots">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="kbs-card rounded-2xl p-5">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a6c1e]">
                  Add block
                </div>

                <div className="font-serif-kbs text-2xl mt-1">
                  Block a date or specific slot
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="border border-[#E7DFCF] rounded-2xl bg-white p-2">
                    <Calendar
                      mode="single"
                      selected={blockDate}
                      onSelect={setBlockDate}
                      disabled={(d) =>
                        d <
                        new Date(
                          new Date().toDateString()
                        )
                      }
                      data-testid="block-calendar"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">
                      Time (leave empty to block full day)
                    </Label>

                    <Input
                      value={blockTime}
                      onChange={(e) =>
                        setBlockTime(e.target.value)
                      }
                      placeholder="e.g. 14:00"
                      className="mt-1"
                      data-testid="block-time"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">
                      Reason
                    </Label>

                    <Input
                      value={blockReason}
                      onChange={(e) =>
                        setBlockReason(e.target.value)
                      }
                      placeholder="Maintenance, holiday…"
                      className="mt-1"
                      data-testid="block-reason"
                    />
                  </div>

                  <button
                    onClick={addBlock}
                    className="btn-gold rounded-full py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2"
                    data-testid="add-block-btn"
                  >
                    <Ban size={14} />
                    Block Slot
                  </button>
                </div>
              </div>

              <div className="kbs-card rounded-2xl p-5">
                <div className="text-[10px] tracking-[0.24em] uppercase text-[#8a6c1e]">
                  Active Blocks · {blocks.length}
                </div>

                <div className="mt-3 space-y-2 max-h-[520px] overflow-y-auto menu-scroll">
                  {blocks.length === 0 && (
                    <div className="text-sm text-[#6b6b6b]">
                      No blocks yet.
                    </div>
                  )}

                  {blocks.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between border border-[#E7DFCF] rounded-xl px-4 py-3 bg-white"
                    >
                      <div>
                        <div className="font-serif-kbs text-lg">
                          {b.date}
                          {b.time
                            ? ` · ${b.time}`
                            : " · Whole day"}
                        </div>

                        {b.reason && (
                          <div className="text-xs text-[#6b6b6b]">
                            {b.reason}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          removeBlock(b.id)
                        }
                        className="text-xs text-[#7a2b2b] hover:underline"
                        data-testid={`remove-block-${b.id}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menu">
            <div className="grid gap-2">
              {services.map((s) => (
                <div
                  key={s.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl p-4 bg-white ${
                    !s.available ? "opacity-70" : ""
                  } border-[#E7DFCF]`}
                >
                  <div className="flex-1">
                    <div className="font-serif-kbs text-lg text-[#1A1A1A]">
                      {s.name}
                    </div>

                    <div className="text-[11px] uppercase tracking-widest text-[#8a6c1e]">
                      {s.category} · {s.subcategory} ·{" "}
                      {s.gender}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8a6c1e]">
                      ₹
                    </span>

                    <Input
                      defaultValue={s.price}
                      type="number"
                      className="w-24 h-9"
                      onBlur={(e) => {
                        if (
                          parseInt(e.target.value, 10) !==
                          s.price
                        ) {
                          updatePrice(
                            s,
                            e.target.value
                          );
                        }
                      }}
                      data-testid={`price-${s.id}`}
                    />

                    <span className="text-xs text-[#6b6b6b] w-32">
                      {priceLabel(s)}
                    </span>

                    <button
                      onClick={() =>
                        toggleAvailable(s)
                      }
                      className={`text-xs px-3 py-2 rounded-full border ${
                        s.available
                          ? "bg-[#D6EEE0] border-[#5FBC85] text-[#1e6b3c]"
                          : "bg-[#F5D6D6] border-[#C67B7B] text-[#7a2b2b]"
                      }`}
                      data-testid={`toggle-${s.id}`}
                    >
                      {s.available
                        ? "Available"
                        : "Temporarily Unavailable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
