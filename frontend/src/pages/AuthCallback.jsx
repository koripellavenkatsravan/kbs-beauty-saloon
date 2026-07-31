import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../lib/AuthContext";

const AuthCallback = () => {
  const { loginWithGoogleSession } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const session_id = match ? decodeURIComponent(match[1]) : null;
    (async () => {
      if (!session_id) { navigate("/"); return; }
      try {
        await loginWithGoogleSession(session_id);
        toast.success("Signed in with Google");
        // Clear hash + go home
        window.history.replaceState({}, document.title, "/");
        navigate("/");
      } catch (e) {
        toast.error("Google sign-in failed");
        navigate("/");
      }
    })();
  }, [loginWithGoogleSession, navigate]);

  return (
    <div className="min-h-screen grid place-items-center kbs-hero-bg">
      <div className="text-center">
        <div className="font-serif-kbs text-3xl">Signing you in…</div>
        <div className="text-xs text-[#8a6c1e] mt-1 tracking-widest uppercase">One moment</div>
      </div>
    </div>
  );
};

export default AuthCallback;
