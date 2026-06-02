"use client";

import { useEffect, useRef } from "react";

export default function ParallaxBg({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    // Desktop only — skip on mobile to avoid jank & CLS
    if (window.innerWidth < 768) return;

    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        // Clamp so image never moves outside its container
        el.style.transform = `translateY(${Math.min(window.scrollY * 0.25, 80)}px)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ willChange: "transform", position: "absolute", inset: 0 }}
    >
      {children}
    </div>
  );
}
