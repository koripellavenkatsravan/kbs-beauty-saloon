import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Trash2, Sparkles, MessageCircle, Check, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";
import { INDIAN_STATES, buildWhatsAppLink, priceLabel, SALON } from "../lib/kbs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = ["Services", "Stylist", "Date & Time", "Details", "Confirm"];

// Generate iCalendar (.ics) file for adding the appointment to Google/Apple/Outlook calendar
const buildIcsDataUrl = (b) => {
  const dt = `${b.date.replace(/-/g, "")}T${b.time.replace(":", "")}00`;
  const endHr = String(parseInt(b.time.split(":")[0], 10) + 1).padStart(2, "0");
  const dtEnd = `${b.date.replace(/-/g, "")}T${endHr}${b.time.split(":")[1]}00`;
  const svc = b.services.map((s) => s.name).join(", ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KBS Beauty Saloon//EN",
    "BEGIN:VEVENT",
    `UID:${b.id}@kbsbeautysaloon`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z`,
    `DTSTART:${dt}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:KBS Beauty Saloon — ${svc}`,
    `DESCRIPTION:Stylist: ${b.stylist}\\nServices: ${svc}\\nTotal: Rs.${b.total}\\nPhone: +91 ${SALON.phoneDisplay}`,
    `LOCATION:${SALON.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
};

const BookingModal = ({ open, onOpenChange, selected, setSelected, allServices }) => {
  const [step, setStep] = useState(0);
  const [stylists, setStylists] = useState([]);
  const [stylist, setStylist] = useState("Any Available");
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", state: "Andhra Pradesh", city: "Visakhapatnam", notes: "" });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  const total = useMemo(() => selected.reduce((s, x) => s + (x.price || 0), 0), [selected]);

  useEffect(() => {
    if (!open) return;
    axios.get(`${API}/stylists`).then((r) => setStylists(r.data)).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!date) { setSlots([]); return; }
    const d = format(date, "yyyy-MM-dd");
    axios.get(`${API}/available-slots`, { params: { date: d } })
      .then((r) => setSlots(r.data.slots))
      .catch(() => setSlots([]));
  }, [date]);

  const goNext = () => {
    if (step === 0 && selected.length === 0) { toast.error("Please add at least one service"); return; }
    if (step === 1 && !stylist) { toast.error("Please choose a stylist"); return; }
    if (step === 2 && (!date || !time)) { toast.error("Please pick a date and time"); return; }
    if (step === 3) {
      if (!form.full_name || !form.phone || !form.email) { toast.error("Please fill required fields"); return; }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const removeService = (id) => setSelected(selected.filter((x) => x.id !== id));

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        services: selected.map((s) => ({ id: s.id, name: s.name, price: s.price })),
        stylist,
        date: format(date, "yyyy-MM-dd"),
        time,
        ...form,
      };
      const { data } = await axios.post(`${API}/bookings`, payload);
      setConfirmed(data);
      toast.success("Booking placed! Confirmation email sent.");
      // Auto-open WhatsApp with formatted booking summary
      try {
        const url = buildWhatsAppLink(data);
        setTimeout(() => window.open(url, "_blank"), 900);
      } catch {}
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setStylist("Any Available"); setDate(null); setTime(""); setConfirmed(null);
    setForm({ full_name: "", phone: "", email: "", state: "Andhra Pradesh", city: "Visakhapatnam", notes: "" });
  };

  const close = () => { onOpenChange(false); setTimeout(reset, 300); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-0 overflow-hidden rounded-3xl bg-transparent shadow-none [&>button.absolute]:hidden" data-testid="booking-modal">
        <DialogTitle className="sr-only">Book Appointment at KBS Beauty Saloon</DialogTitle>
        <DialogDescription className="sr-only">Step-by-step booking: choose services, stylist, date and time, and confirm your appointment.</DialogDescription>
        <div className="kbs-glass-light rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7DFCF] bg-white/70">
            <div>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[#B7902B]">Book Appointment</div>
              <div className="font-serif-kbs text-2xl text-[#1A1A1A]">{confirmed ? "You're all set." : STEPS[step]}</div>
            </div>
            <button onClick={close} className="p-2 rounded-full hover:bg-[#F6EFE2]" data-testid="booking-close-btn"><X size={18}/></button>
          </div>

          {!confirmed && (
            <div className="px-6 pt-5">
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <motion.div
                      className={`h-1 rounded-full flex-1 origin-left ${i <= step ? "bg-[#D4AF37]" : "bg-[#E7DFCF] dark:bg-[#2a2a30]"}`}
                      initial={false}
                      animate={{ scaleX: i <= step ? 1 : 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-[#8a6c1e]">
                {STEPS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => { if (i < step) setStep(i); }}
                    disabled={i > step}
                    className={`px-1 transition ${i === step ? "text-[#1A1A1A] dark:text-[#FDFBF7] font-semibold" : ""} ${i < step ? "hover:text-[#B7902B] cursor-pointer" : ""} ${i > step ? "cursor-default opacity-60" : ""}`}
                    data-testid={`stepper-${i}`}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-6 max-h-[68vh] overflow-y-auto menu-scroll">
            <AnimatePresence mode="wait">
              {confirmed ? (
                <motion.div key="done" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                    className="relative h-20 w-20 mx-auto"
                  >
                    <div className="absolute inset-0 rounded-full bg-[#D4AF37]/25 animate-ping"/>
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[#E9CE72] to-[#B7902B] text-[#1A1A1A] grid place-items-center shadow-[0_20px_40px_-12px_rgba(212,175,55,0.6)]">
                      <Check size={38} strokeWidth={3}/>
                    </div>
                  </motion.div>
                  <h3 className="font-serif-kbs text-3xl mt-5">Appointment Request Received</h3>
                  <p className="text-[#3d3d3d] dark:text-[#c8c8c8] mt-2 text-sm max-w-md mx-auto">
                    A luxury confirmation has been sent to <b>{confirmed.email}</b>.
                  </p>

                  <div className="mt-5 mx-auto max-w-md rounded-2xl border border-[#E7DFCF] dark:border-[#2a2a30] bg-white/60 dark:bg-[#1A1A1E]/60 backdrop-blur p-4 text-left text-sm">
                    <div className="flex justify-between"><span className="text-[#8a6c1e]">Name</span><span className="font-medium">{confirmed.full_name}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-[#8a6c1e]">Date & Time</span><span className="font-medium">{confirmed.date} · {confirmed.time}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-[#8a6c1e]">Stylist</span><span className="font-medium">{confirmed.stylist}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-[#8a6c1e]">Total</span><span className="font-serif-kbs text-lg text-[#B7902B]">₹{(confirmed.total || 0).toLocaleString()}</span></div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    <a
                      href={buildWhatsAppLink(confirmed)}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-gold px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2"
                      data-testid="confirm-whatsapp-btn"
                    >
                      <MessageCircle size={16}/> Send on WhatsApp
                    </a>
                    <a
                      href={buildIcsDataUrl(confirmed)}
                      download={`KBS-Appointment-${confirmed.date}.ics`}
                      className="btn-outline-gold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
                      data-testid="add-to-calendar-btn"
                    >
                      <CalendarPlus size={16}/> Add to Calendar
                    </a>
                    <button onClick={close} className="btn-outline-gold px-6 py-3 rounded-full text-sm" data-testid="confirm-close-btn">Done</button>
                  </div>
                </motion.div>
              ) : step === 0 ? (
                <motion.div key="s0" initial={{opacity:0}} animate={{opacity:1}}>
                  {selected.length === 0 ? (
                    <div className="text-center py-8 text-[#6b6b6b]">
                      No services yet. Add from the menu, or
                      <button onClick={() => setAddPickerOpen(true)} className="ml-1 underline text-[#B7902B]" data-testid="pick-inside-modal-btn">pick from here</button>.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selected.map((s) => (
                        <div key={s.id} className="flex items-center justify-between border border-[#E7DFCF] rounded-2xl p-4 bg-white">
                          <div>
                            <div className="font-serif-kbs text-lg text-[#1A1A1A]">{s.name}</div>
                            <div className="text-[11px] uppercase tracking-widest text-[#8a6c1e]">{s.subcategory}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="font-serif-kbs text-lg text-[#B7902B]">{priceLabel(s)}</div>
                            <button onClick={() => removeService(s.id)} className="p-2 rounded-full hover:bg-[#F6EFE2]" data-testid={`remove-service-${s.id}`}>
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setAddPickerOpen(true)} className="btn-outline-gold px-4 py-2 rounded-full text-sm" data-testid="add-more-services-btn">+ Add more services</button>
                    </div>
                  )}

                  {addPickerOpen && (
                    <div className="mt-4 border border-[#E7DFCF] rounded-2xl bg-white p-3 max-h-72 overflow-y-auto menu-scroll">
                      {allServices.slice(0, 60).map((s) => {
                        const already = selected.some((x) => x.id === s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => { if (!already) setSelected([...selected, s]); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm hover:bg-[#F6EFE2] ${already ? "opacity-50" : ""}`}
                            data-testid={`quick-add-${s.id}`}
                          >
                            <span className="text-[#1A1A1A]">{s.name}</span>
                            <span className="text-[#B7902B]">{priceLabel(s)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : step === 1 ? (
                <motion.div key="s1" initial={{opacity:0}} animate={{opacity:1}} className="grid sm:grid-cols-2 gap-3">
                  {stylists.map((st) => (
                    <button
                      key={st.name}
                      onClick={() => setStylist(st.name)}
                      className={`text-left p-5 rounded-2xl border transition ${stylist === st.name ? "border-[#D4AF37] bg-[#FBF3E6]" : "border-[#E7DFCF] bg-white hover:border-[#D4AF37]"}`}
                      data-testid={`stylist-${st.name}`}
                    >
                      <div className="font-serif-kbs text-xl text-[#1A1A1A]">{st.name}</div>
                      <div className="text-xs text-[#6b6b6b] mt-1">{st.specialty}</div>
                    </button>
                  ))}
                </motion.div>
              ) : step === 2 ? (
                <motion.div key="s2" initial={{opacity:0}} animate={{opacity:1}} className="grid md:grid-cols-2 gap-6">
                  <div className="border border-[#E7DFCF] rounded-2xl bg-white p-3">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date(new Date().toDateString())}
                      data-testid="booking-calendar"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-[0.2em] text-[#8a6c1e]">Available Slots</Label>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {date ? slots.map((s) => (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => setTime(s.time)}
                          className={`py-2 rounded-lg text-sm border transition ${
                            !s.available ? "opacity-40 line-through bg-[#f2ebde] border-[#E7DFCF] cursor-not-allowed" :
                            time === s.time ? "bg-[#1A1A1A] text-[#D4AF37] border-[#1A1A1A]" :
                            "bg-white border-[#E7DFCF] hover:border-[#D4AF37]"
                          }`}
                          data-testid={`slot-${s.time}`}
                        >{s.time}</button>
                      )) : <div className="col-span-3 text-sm text-[#6b6b6b]">Pick a date to see slots</div>}
                    </div>
                  </div>
                </motion.div>
              ) : step === 3 ? (
                <motion.div key="s3" initial={{opacity:0}} animate={{opacity:1}} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name*</Label>
                    <Input value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} className="mt-1" data-testid="input-full-name" />
                  </div>
                  <div>
                    <Label>Phone*</Label>
                    <Input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} className="mt-1" data-testid="input-phone" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Email*</Label>
                    <Input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="mt-1" data-testid="input-email" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <select value={form.state} onChange={(e)=>setForm({...form, state:e.target.value})} className="mt-1 h-10 w-full px-3 rounded-md border border-[#E7DFCF] bg-white text-sm" data-testid="input-state">
                      {INDIAN_STATES.map((s)=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})} className="mt-1" data-testid="input-city" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Notes</Label>
                    <Textarea value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} className="mt-1" placeholder="Allergies, preferred products, etc." data-testid="input-notes"/>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="s4" initial={{opacity:0}} animate={{opacity:1}} className="grid md:grid-cols-2 gap-6">
                  <div className="border border-[#E7DFCF] rounded-2xl bg-white p-5">
                    <div className="text-[10px] tracking-[0.28em] uppercase text-[#B7902B]">Summary</div>
                    <div className="font-serif-kbs text-2xl text-[#1A1A1A] mt-2">{form.full_name || "—"}</div>
                    <div className="text-sm text-[#6b6b6b]">{form.phone} · {form.email}</div>
                    <div className="text-sm text-[#3d3d3d] mt-3">
                      <b>{stylist}</b> · {date ? format(date, "EEE, dd MMM yyyy") : "—"} at <b>{time || "—"}</b>
                    </div>
                    <div className="text-sm text-[#6b6b6b]">{form.city}, {form.state}</div>
                    {form.notes && <div className="mt-3 text-xs text-[#6b6b6b] border-l-2 border-[#D4AF37] pl-3">{form.notes}</div>}
                  </div>
                  <div className="border border-[#E7DFCF] rounded-2xl bg-white p-5">
                    <div className="text-[10px] tracking-[0.28em] uppercase text-[#B7902B]">Services · {selected.length}</div>
                    <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto menu-scroll">
                      {selected.map((s) => (
                        <div key={s.id} className="flex justify-between text-sm">
                          <span>{s.name}</span><span className="text-[#B7902B]">{priceLabel(s)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-[#E7DFCF] pt-3 flex justify-between font-serif-kbs text-2xl">
                      <span>Total</span><span className="text-[#B7902B]">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!confirmed && (
            <div className="px-6 py-4 border-t border-[#E7DFCF] bg-white/60 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-[#8a6c1e] uppercase tracking-widest text-[10px]">Running Total</span>
                <div className="font-serif-kbs text-xl text-[#1A1A1A]">₹{total.toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={goBack} className="btn-outline-gold px-5 py-2.5 rounded-full text-sm inline-flex items-center gap-1" data-testid="booking-back-btn">
                    <ChevronLeft size={16}/> Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button onClick={goNext} className="btn-gold px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-1" data-testid="booking-next-btn">
                    Continue <ChevronRight size={16}/>
                  </button>
                ) : (
                  <button onClick={submit} disabled={loading} className="btn-gold px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60" data-testid="booking-submit-btn">
                    <Sparkles size={16}/> {loading ? "Sending…" : "Confirm Booking"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
