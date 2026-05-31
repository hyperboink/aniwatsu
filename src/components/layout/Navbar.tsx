"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, Tv, Flame, Star, Calendar, ChevronDown } from "lucide-react";
import Image from "next/image";

type Suggestion = {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: { jpg: { image_url: string } };
  type: string | null;
  score: number | null;
  year: number | null;
  season: string | null;
  status: string | null;
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [sugOpen, setSugOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sugRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setBrowseOpen(false);
    setSugOpen(false);
    setSuggestions([]);
    setActiveIdx(-1);
  }, [pathname]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") { setSearchOpen(false); setSugOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); setSugOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSugLoading(true);
      try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=6&sfw=false`);
        const data = await res.json();
        setSuggestions(data.data ?? []);
        setSugOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSugLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      handleSuggestionClick(suggestions[activeIdx].mal_id);
      return;
    }
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
      setSugOpen(false);
      setActiveIdx(-1);
    }
  };

  const handleSuggestionClick = (id: number) => {
    router.push(`/anime/${id}`);
    setSearchOpen(false);
    setSearchQ("");
    setSugOpen(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!sugOpen || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: <Tv size={15} /> },
    { href: "/browse?filter=airing", label: "Trending", icon: <Flame size={15} /> },
    { href: "/browse?filter=bypopularity", label: "Popular", icon: <Star size={15} /> },
    { href: "/browse?filter=upcoming", label: "Upcoming", icon: <Calendar size={15} /> },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0d0d14]/95 backdrop-blur-md shadow-lg shadow-black/40"
            : "bg-gradient-to-b from-black/60 to-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center glow">
              <Tv size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Ani<span className="text-violet-400">watsu</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "text-violet-400 bg-violet-500/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.icon}
                {l.label}
              </Link>
            ))}

            {/* Browse dropdown */}
            <div className="relative">
              <button
                onClick={() => setBrowseOpen((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Browse
                <ChevronDown size={14} className={`transition-transform ${browseOpen ? "rotate-180" : ""}`} />
              </button>
              {browseOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden slide-down">
                  {[
                    { label: "By Genre", href: "/browse" },
                    { label: "This Season", href: "/browse?filter=season" },
                    { label: "Top Rated", href: "/browse?filter=favorite" },
                    { label: "Movies", href: "/browse?type=movie" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-violet-500/10 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen((p) => !p)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-white/5 bg-[#0d0d14]/98 backdrop-blur-md px-4 py-3 slide-down">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative" ref={sugRef}>
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQ}
                  onChange={(e) => { setSearchQ(e.target.value); fetchSuggestions(e.target.value); setActiveIdx(-1); }}
                  onFocus={() => { if (suggestions.length) setSugOpen(true); }}
                  onBlur={() => setTimeout(() => setSugOpen(false), 150)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search anime... (⌘K)"
                  className="w-full pl-10 pr-20 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {sugLoading
                    ? <div className="w-3.5 h-3.5 border border-violet-500/50 border-t-violet-400 rounded-full animate-spin" />
                    : searchQ && <kbd className="text-[10px] text-slate-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">↵</kbd>
                  }
                </div>

                {/* Suggestions dropdown */}
                {sugOpen && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#13131f] border border-white/8 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden z-50 slide-down">
                    <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Suggestions</span>
                      <span className="text-[10px] text-slate-700">↑↓ navigate · ↵ select · esc close</span>
                    </div>
                    {suggestions.map((s, i) => (
                      <button
                        key={s.mal_id}
                        type="button"
                        onMouseDown={() => handleSuggestionClick(s.mal_id)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors group text-left ${
                          activeIdx === i ? "bg-violet-500/15" : "hover:bg-white/5"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-9 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5 ring-1 ring-white/5">
                          {s.images?.jpg?.image_url && (
                            <Image src={s.images.jpg.image_url} alt={s.title} width={36} height={48} className="w-full h-full object-cover" />
                          )}
                        </div>

                        {/* Title + meta */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate transition-colors ${activeIdx === i ? "text-violet-300" : "text-white group-hover:text-violet-300"}`}>
                            {s.title_english || s.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {s.title_english && s.title !== s.title_english && (
                              <span className="text-[11px] text-slate-500 truncate max-w-[140px]">{s.title}</span>
                            )}
                            {s.year && <span className="text-[11px] text-slate-600">{s.year}</span>}
                            {s.status === "Currently Airing" && (
                              <span className="text-[10px] text-green-400 font-medium">● Airing</span>
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {s.type && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/20 font-medium">
                              {s.type}
                            </span>
                          )}
                          {s.score && (
                            <span className="text-[11px] text-yellow-400 font-semibold">★ {s.score.toFixed(1)}</span>
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Footer */}
                    <div className="border-t border-white/5">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-500 hover:text-violet-400 hover:bg-white/5 transition-colors"
                      >
                        <span>See all results for <span className="text-white font-medium">&ldquo;{searchQ}&rdquo;</span></span>
                        <span className="text-slate-600">↵</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0d0d14]/98 px-4 py-3 slide-down">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {l.icon}
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Backdrop for dropdown */}
      {browseOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setBrowseOpen(false)} />
      )}
    </>
  );
}
