"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight animated film-grain overlay.
 * - Renders a small offscreen canvas (256×256) and tiles it via CSS.
 * - Throttled to ~12 fps so CPU impact is negligible.
 * - Canvas is 64KB max; no external deps.
 */
export default function GrainOverlay({ opacity = 0.045 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const SIZE = 256;
  const FPS = 12;
  const INTERVAL = 1000 / FPS;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (ts: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (ts - lastRef.current < INTERVAL) return;
      lastRef.current = ts;

      const img = ctx.createImageData(SIZE, SIZE);
      const buf = img.data;
      for (let i = 0; i < buf.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        buf[i] = buf[i + 1] = buf[i + 2] = v;
        buf[i + 3] = (Math.random() * 40) | 0; // subtle alpha
      }
      ctx.putImageData(img, 0, 0);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        opacity,
        imageRendering: "auto",
        backgroundRepeat: "repeat",
        zIndex: 5,
        mixBlendMode: "overlay",
      }}
    />
  );
}
