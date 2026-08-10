import React, { useEffect, useRef, useState } from "react";

// Desktop cursor follower — luxury salon micro-interaction
// - Scales up + inverts colour when hovering any clickable element
// - Automatically disabled on touch devices (prefers-reduced-motion honoured too)
const CursorFollower = () => {
  const [enabled, setEnabled] = useState(true);
  const [hover, setHover] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) { setEnabled(false); return; }

    const onMove = (e) => { target.current.x = e.clientX; target.current.y = e.clientY; };
    const onOver = (e) => {
      const el = e.target;
      const clickable = el.closest("a, button, [role='button'], input, textarea, select, [data-magnetic]");
      setHover(!!clickable);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    let raf;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.22;
      current.current.y += (target.current.y - current.current.y) * 0.22;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-1.5 h-1.5 rounded-full bg-[#D4AF37] transition-[width,height,background] duration-200"
        style={{ marginLeft: "-3px", marginTop: "-3px", mixBlendMode: "difference" }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className={`fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border transition-[width,height,border-color,background] duration-300 ease-out ${
          hover
            ? "w-8 h-8 border-[#D4AF37]/70 bg-[#D4AF37]/10 -ml-4 -mt-4"
            : "w-5 h-5 border-[#D4AF37]/45 -ml-2.5 -mt-2.5"
        }`}
      />
    </>
  );
};

export default CursorFollower;
