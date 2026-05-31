"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, X, Search, LayoutGrid } from "lucide-react";
import { GENRES } from "@/lib/api";

const PREVIEW_COUNT = 20;

type Props = {
  activeGenreId?: number;
  currentFilter?: string;
};

export default function GenrePills({ activeGenreId, currentFilter = "all" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? GENRES.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
    : GENRES;

  // Build href preserving the current filter
  const genreHref = (id: number) => `/browse?filter=${currentFilter}&genre=${id}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [open]);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        {GENRES.slice(0, PREVIEW_COUNT).map((g) => (
          <Link
            key={g.id}
            href={genreHref(g.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              activeGenreId === g.id
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-transparent text-slate-400 border-white/10 hover:border-violet-500/40 hover:text-violet-300"
            }`}
          >
            {g.name}
          </Link>
        ))}

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-violet-500/40 text-violet-400 hover:bg-violet-600/15 hover:border-violet-400 transition-all"
        >
          <LayoutGrid size={11} />
          +{GENRES.length - PREVIEW_COUNT} more
          <ChevronDown size={11} />
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm slide-down">
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5 shrink-0">
              <div>
                <h2 className="text-white font-bold text-lg">All Genres</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  {GENRES.length} genres — combining with current filter
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-white/5 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search genres..."
                  className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              {filtered.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No genres match &ldquo;{query}&rdquo;</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filtered.map((g) => (
                    <Link
                      key={g.id}
                      href={genreHref(g.id)}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        activeGenreId === g.id
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-[#1a1a2e] text-slate-300 border-white/10 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-600/10"
                      }`}
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/5 shrink-0 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm rounded-lg transition-colors border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
