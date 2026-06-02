"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, Trophy, Flame, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Hit = {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: { jpg: { image_url: string } };
  type: string | null;
  score: number | null;
  year: number | null;
  status: string | null;
  episodes: number | null;
};

const PAGE_SIZE = 15;

type Props = { open: boolean; onClose: () => void };

export default function SearchModal({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeIdx, setActiveIdx] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryRef = useRef("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else { setQ(""); setHits([]); setActiveIdx(-1); setPage(1); setHasMore(false); }
  }, [open]);

  const doFetch = useCallback(async (query: string, pg: number, append: boolean) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${PAGE_SIZE}&page=${pg}&sfw=true`);
      const data = await res.json();
      if (queryRef.current !== query) return;
      const items: Hit[] = data.data ?? [];
      setHits(prev => append ? [...prev, ...items] : items);
      setHasMore(data.pagination?.has_next_page ?? false);
      setPage(pg);
    } catch {
      if (!append) setHits([]);
    } finally { setLoading(false); setLoadingMore(false); }
  }, []);

  const search = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    queryRef.current = val;
    if (val.trim().length < 2) { setHits([]); setHasMore(false); return; }
    debounceRef.current = setTimeout(() => doFetch(val, 1, false), 300);
  }, [doFetch]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const fn = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80 && hasMore && !loadingMore)
        doFetch(queryRef.current, page + 1, true);
    };
    el.addEventListener("scroll", fn);
    return () => el.removeEventListener("scroll", fn);
  }, [hasMore, loadingMore, page, doFetch]);

  const goSearch = () => {
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  const goAnime = (id: number) => { router.push(`/anime/${id}`); onClose(); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "Enter") { e.preventDefault(); activeIdx >= 0 && hits[activeIdx] ? goAnime(hits[activeIdx].mal_id) : goSearch(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, hits.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
  };

  if (!open) return null;

  const hasQuery = q.trim().length >= 2;
  const empty = hasQuery && !loading && hits.length === 0;

  const categories = [
    { icon: <Flame size={15} />, label: "Trending", href: "/browse?filter=airing", color: "text-slate-500" },
    { icon: <Star size={15} />, label: "Popular", href: "/browse?filter=bypopularity", color: "text-slate-500" },
    { icon: <Trophy size={15} />, label: "Top Rated", href: "/browse?filter=favorite", color: "text-slate-500" },
    { icon: <Clock size={15} />, label: "Upcoming", href: "/browse?filter=upcoming", color: "text-slate-500" },
  ];

  return (
    <div role="dialog" aria-modal="true" aria-label="Search anime" className="fixed inset-0 z-[9999] flex items-start justify-center px-4" style={{ paddingTop: "68px" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      {/* Card */}
      <div className="sm-card relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 90px)" }}>

        {/* Search input */}
        <div className="flex items-center gap-4 px-5 py-4" style={{ background: "#0f0f1c", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {loading
            ? <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin shrink-0" />
            : <Search size={18} className="text-slate-400 shrink-0" />
          }
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); search(e.target.value); setActiveIdx(-1); }}
            onKeyDown={onKeyDown}
            placeholder='Search for anime ex: "Naruto"'
            aria-label="Search for anime"
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-autocomplete="list"
            className="flex-1 bg-transparent text-white text-base placeholder-slate-600 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {q ? (
            <button onClick={() => { setQ(""); setHits([]); inputRef.current?.focus(); }}
              aria-label="Clear search"
              className="shrink-0 text-slate-500 hover:text-white transition-colors">
              <X size={16} aria-hidden="true" />
            </button>
          ) : (
            <button onClick={onClose} aria-label="Close search" className="shrink-0 text-[11px] text-slate-600 border border-white/10 rounded-md px-2 py-1 hover:text-slate-400 transition-colors">
              esc
            </button>
          )}
        </div>

        {/* Body */}
        <div ref={listRef} className="overflow-y-auto flex-1" style={{ background: "#0f0f1c" }}>

          {/* Browse categories — empty state */}
          {!hasQuery && (
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3 px-1">Browse</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(c => (
                  <Link key={c.href} href={c.href} onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  >
                    <span className={c.color}>{c.icon}</span>
                    <span className="text-sm text-slate-300 font-medium">{c.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {hits.length > 0 && (
            <div className="py-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-5 pb-2">{hits.length} results</p>
              {hits.map((h, i) => {
                const title = h.title_english || h.title;
                const active = activeIdx === i;
                return (
                  <button key={`${h.mal_id}-${i}`} type="button"
                    onMouseDown={() => goAnime(h.mal_id)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors"
                    style={{ background: active ? "rgba(139,92,246,0.1)" : undefined }}
                    onMouseLeave={() => setActiveIdx(-1)}
                  >
                    {/* Poster */}
                    <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                      {h.images?.jpg?.image_url &&
                        <Image src={h.images.jpg.image_url} alt={title} fill sizes="40px" className="object-cover" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${active ? "text-violet-300" : "text-white"}`}>{title}</p>
                      {h.title_english && h.title !== h.title_english && (
                        <p className="text-[11px] text-slate-500 truncate">{h.title}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        {h.type && <span className="text-[10px] text-slate-500 bg-white/5 rounded px-1.5 py-0.5">{h.type}</span>}
                        {h.year && <span className="text-[10px] text-slate-600">{h.year}</span>}
                        {h.episodes && <span className="text-[10px] text-slate-600">· {h.episodes} eps</span>}
                        {h.status === "Currently Airing" && <span className="text-[10px] font-medium" style={{ color: "#4ade80" }}>· Airing</span>}
                      </div>
                    </div>

                    {/* Score */}
                    {h.score && (
                      <div className="shrink-0 flex items-center gap-1">
                        <Star size={11} className="text-yellow-400" />
                        <span className="text-sm font-semibold text-slate-300">{h.score.toFixed(1)}</span>
                      </div>
                    )}
                  </button>
                );
              })}

              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="w-4 h-4 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
                </div>
              )}
              {!hasMore && !loadingMore && hits.length > 0 && (
                <p className="text-center text-[11px] text-slate-700 py-3">End of results</p>
              )}
            </div>
          )}

          {/* No results */}
          {empty && (
            <div className="flex flex-col items-center py-14 gap-2">
              <Search size={28} className="text-slate-700" />
              <p className="text-slate-400 text-sm font-medium">No results for &ldquo;{q}&rdquo;</p>
              <p className="text-slate-600 text-xs">Try searching with a different title</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ background: "#0c0c18", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {hits.length > 0 ? (
            <button type="button" onClick={goSearch}
              className="text-xs text-slate-500 hover:text-violet-400 transition-colors">
              See all results for <span className="font-medium text-slate-300">&ldquo;{q}&rdquo;</span> →
            </button>
          ) : (
            <span className="text-xs text-slate-700">Start typing to search</span>
          )}
          <div className="flex items-center gap-3 text-[10px] text-slate-700">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </div>
        </div>
      </div>

      <style>{`
        .sm-card { animation: smPop 0.16s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes smPop { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
