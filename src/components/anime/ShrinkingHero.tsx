"use client";

import { useEffect, useRef } from "react";

export default function ShrinkingHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const full = el.offsetHeight;

    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const newH = Math.max(full - window.scrollY * 0.35, full * 0.5);
        el.style.height = `${newH}px`;
        el.style.setProperty("--shrink-offset", `${full - newH}px`);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div ref={ref} style={{ overflow: "hidden", contain: "layout" }}>
      {children}
    </div>
  );
}
