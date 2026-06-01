"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, Star, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { Anime } from "@/lib/api";
import dynamic from "next/dynamic";

const HeroParticles = dynamic(() => import("@/components/anime/HeroParticles"), { ssr: false });

export default function HeroCarousel({ items }: { items: Anime[] }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback(
    (next: number) => {
      setFading(true);
      setTimeout(() => {
        setIdx(next);
        setFading(false);
      }, 200);
    },
    []
  );

  const prev = () => go((idx - 1 + items.length) % items.length);
  const next = () => go((idx + 1) % items.length);

  useEffect(() => {
    const t = setInterval(() => go((idx + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [idx, items.length, go]);

  if (!items.length) return null;
  const anime = items[idx];
  const title = anime.title_english || anime.title;
  const img = anime.images?.jpg?.large_image_url;

  return (
    <div className="relative h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden">
      {/* Background */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        {/* Ambient layer — blurred, saturated */}
        {img && (
          <Image src={img} alt="" fill priority aria-hidden
            className="object-cover object-top scale-125"
            style={{ filter: 'blur(22px) brightness(0.45) saturate(1.4)' }}
            sizes="100vw"
          />
        )}
        {/* Sharp layer — right half, cinematic vignette mask */}
        {img && (
          <div
            className="absolute right-0 top-0 bottom-0 w-[50%]"
            style={{
              maskImage: `radial-gradient(ellipse 88% 90% at 65% 36%,
                black 0%,
                black 18%,
                rgba(0,0,0,0.85) 38%,
                rgba(0,0,0,0.25) 58%,
                transparent 72%)`,
              WebkitMaskImage: `radial-gradient(ellipse 88% 90% at 65% 36%,
                black 0%,
                black 18%,
                rgba(0,0,0,0.85) 38%,
                rgba(0,0,0,0.25) 58%,
                transparent 72%)`,
            }}
          >
            <Image src={img} alt={title} fill priority
              className="object-cover"
              style={{ objectPosition: '50% 33%' }}
              sizes="50vw"
              quality={100}
            />
          </div>
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14] from-25% via-[#0d0d14]/50 via-50% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/10 to-black/30" />
        <HeroParticles />
      </div>

      {/* Content */}
      <div
        className={`relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center pb-16 transition-all duration-300 ${
          fading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          {anime.score && (
            <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-3 py-1 text-xs font-semibold">
              <Star size={11} fill="currentColor" />
              {anime.score.toFixed(1)}
            </span>
          )}
          {anime.type && (
            <span className="bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-full px-3 py-1 text-xs font-semibold">
              {anime.type}
            </span>
          )}
          {anime.status && (
            <span className="bg-white/10 text-slate-300 rounded-full px-3 py-1 text-xs font-semibold">
              {anime.status}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-xl mb-2 drop-shadow-2xl">
          {title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
          {anime.year && (
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {anime.year}
            </span>
          )}
          {anime.episodes && <span>{anime.episodes} Episodes</span>}
          {anime.genres?.slice(0, 3).map((g) => (
            <span key={g.mal_id} className="text-violet-400">
              {g.name}
            </span>
          ))}
        </div>

        {/* Synopsis */}
        {anime.synopsis && (
          <p className="text-slate-300 text-sm max-w-lg mb-6 line-clamp-3 leading-relaxed">
            {anime.synopsis}
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/watch/${anime.mal_id}`}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors glow"
          >
            <Play size={17} fill="white" />
            Watch Now
          </Link>
          <Link
            href={`/anime/${anime.mal_id}`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/10"
          >
            <Info size={17} />
            Details
          </Link>
        </div>
      </div>

      {/* Carousel controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-colors border border-white/10"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-colors border border-white/10"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-6 flex gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === idx ? "w-6 bg-violet-400" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
