import { useEffect, useRef } from "react";

// Magnetic button hook: pulls the button toward the cursor within `radius` px.
// Add to any element via ref={magneticRef}
export const useMagnetic = (strength = 0.35, radius = 80) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // touch: skip
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        el.style.transform = "";
        return;
      }
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      el.style.transition = "transform 0.15s ease-out";
    };
    const onLeave = () => {
      el.style.transform = "";
      el.style.transition = "transform 0.35s cubic-bezier(0.22,1,0.36,1)";
    };
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, radius]);
  return ref;
};
