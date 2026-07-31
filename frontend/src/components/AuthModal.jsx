import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, User, Phone, Sparkles, X } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

const AuthModal = () => {
  const { authOpen, setAuthOpen, register, login } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });

  const submit = async () => {
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        if (form.password.length < 6) throw new Error("Password must be at least 6 characters");
        if (!form.name) throw new Error("Please enter your name");
        await register(form);
        toast.success("Account created — welcome to KBS!");
      }
      setAuthOpen(false);
    } catch (e) {
      const msg = e?.response?.data?.detail || e.message || "Something went wrong";
      toast.error(typeof msg === "string" ? msg : "Please check your details");
    } finally { setLoading(false); }
  };

  const googleSignIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="max-w-md p-0 border-0 rounded-3xl bg-transparent shadow-none overflow-hidden" data-testid="auth-modal">
        <DialogTitle className="sr-only">Sign in or Sign up to KBS Beauty Saloon</DialogTitle>
        <DialogDescription className="sr-only">Authenticate with email and password or continue with Google to access your bookings, cart and loyalty points.</DialogDescription>

        <div className="kbs-glass-light rounded-3xl overflow-hidden">
          <div className="relative kbs-dark-panel p-6 pb-8">
            <button onClick={() => setAuthOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#2b2b2b] text-white" data-testid="auth-close">
              <X size={16}/>
            </button>
            <div className="text-[10px] tracking-[0.28em] uppercase text-[#D4AF37]">Members Club</div>
            <div className="font-serif-kbs text-3xl text-[#FDFBF7] mt-1.5">{mode === "login" ? "Welcome back." : "Join KBS."}</div>
            <div className="text-xs text-[#c8c8c8] mt-1">
              Track bookings · Earn 1 point per ₹100 · 100 points = ₹100 off
            </div>
          </div>

          <div className="p-6 bg-white">
            <div className="flex gap-2 p-1 rounded-full bg-[#F6EFE2] mb-5">
              <button onClick={()=>setMode("login")} className={`flex-1 py-2 rounded-full text-sm transition ${mode==="login"?"bg-[#1A1A1A] text-[#D4AF37]":"text-[#1A1A1A]"}`} data-testid="tab-login">Sign In</button>
              <button onClick={()=>setMode("register")} className={`flex-1 py-2 rounded-full text-sm transition ${mode==="register"?"bg-[#1A1A1A] text-[#D4AF37]":"text-[#1A1A1A]"}`} data-testid="tab-register">Sign Up</button>
            </div>

            <div className="space-y-3">
              {mode === "register" && (
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <div className="relative mt-1">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6c1e]"/>
                    <Input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="pl-9 h-10" placeholder="Your name" data-testid="input-name"/>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-xs">Email</Label>
                <div className="relative mt-1">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6c1e]"/>
                  <Input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="pl-9 h-10" placeholder="you@email.com" data-testid="input-auth-email"/>
                </div>
              </div>
              <div>
                <Label className="text-xs">Password</Label>
                <div className="relative mt-1">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6c1e]"/>
                  <Input type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} className="pl-9 h-10" placeholder="At least 6 characters" data-testid="input-password"/>
                </div>
              </div>
              {mode === "register" && (
                <div>
                  <Label className="text-xs">Phone (optional)</Label>
                  <div className="relative mt-1">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6c1e]"/>
                    <Input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} className="pl-9 h-10" placeholder="9xxxxxxxxx" data-testid="input-auth-phone"/>
                  </div>
                </div>
              )}

              <button onClick={submit} disabled={loading} className="btn-gold w-full py-3 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 mt-1" data-testid="auth-submit">
                <Sparkles size={14}/> {loading ? "Please wait…" : (mode === "login" ? "Sign In" : "Create Account")}
              </button>

              <div className="flex items-center gap-3 my-3 text-[10px] uppercase tracking-widest text-[#8a6c1e]">
                <div className="flex-1 h-px bg-[#E7DFCF]"/> or continue with <div className="flex-1 h-px bg-[#E7DFCF]"/>
              </div>

              <button onClick={googleSignIn} className="w-full py-2.5 rounded-full text-sm font-medium border border-[#E7DFCF] bg-white hover:bg-[#F6EFE2] inline-flex items-center justify-center gap-2 transition" data-testid="google-signin">
                <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>

              <button disabled className="w-full py-2.5 rounded-full text-sm font-medium border border-dashed border-[#E7DFCF] bg-[#FBF3E6] text-[#8a6c1e] opacity-60 inline-flex items-center justify-center gap-2" data-testid="phone-otp-placeholder">
                <Phone size={14}/> Phone OTP · Coming Soon
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
