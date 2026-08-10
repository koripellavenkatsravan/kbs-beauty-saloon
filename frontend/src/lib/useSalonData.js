// KBS Salon — resilient data loader
// Priority: 1) LocalStorage cache for instant paint, 2) bundled static JSON as source of truth,
// 3) Live backend API sync in the background for any manager-edited prices/availability.

import { useEffect, useState } from "react";
import axios from "axios";
import salon from "../data/salon.json";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CACHE_KEY = "kbs_salon_cache_v1";

const merge = (base, live) => {
  if (!Array.isArray(live) || live.length === 0) return base;
  // Map live services by name so manager price/availability edits win even if ids differ (backend uses uuid)
  const byName = new Map(live.map((s) => [s.name, s]));
  return base.map((s) => {
    const l = byName.get(s.name);
    if (!l) return s;
    return {
      ...s,
      price: l.price ?? s.price,
      priceMax: l.priceMax ?? s.priceMax,
      available: l.available !== undefined ? l.available : s.available,
      // Keep static slug-id for cart stability; expose real backend id if needed
      backend_id: l.id,
    };
  });
};

export const useSalonData = () => {
  const [services, setServices] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && Array.isArray(cached.services)) return cached.services;
    } catch { /* noop */ }
    return salon.services;
  });
  const [stylists, setStylists] = useState(() => salon.stylists);
  const [source, setSource] = useState("static");

  useEffect(() => {
    // Background sync — never blocks the UI
    const controller = new AbortController();
    (async () => {
      try {
        const [sRes, stRes] = await Promise.all([
          axios.get(`${API}/services`, { signal: controller.signal, timeout: 8000 }),
          axios.get(`${API}/stylists`, { signal: controller.signal, timeout: 8000 }),
        ]);
        const merged = merge(salon.services, sRes.data);
        setServices(merged);
        if (Array.isArray(stRes.data) && stRes.data.length > 0) setStylists(stRes.data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ services: merged, ts: Date.now() }));
        setSource("live");
      } catch {
        setSource("static"); // still fine — bundled data already loaded
      }
    })();
    return () => controller.abort();
  }, []);

  return { services, stylists, source };
};
