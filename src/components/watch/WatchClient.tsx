"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import EmbedPlayer, { type EmbedPlayerHandle } from "@/components/watch/EmbedPlayer";
import type { Anime } from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Play, List, RefreshCw } from "lucide-react";
import { usePersist } from "@/hooks/usePersist";

type Props = {
  anime: Anime;
  totalEpisodes: number;
  startEpisode: number;
  animeKaiBaseUrl: string | null;
};

// How many episodes to show per "page" in the sidebar
const PAGE_SIZE = 100;

export default function WatchClient({ anime, totalEpisodes, startEpisode, animeKaiBaseUrl }: Props) {
  const [currentEp, setCurrentEp] = useState(startEpisode);
  const [epSearch, setEpSearch] = useState("");
  const [epPage, setEpPage] = useState(0);
  const activeRef = useRef<HTMLButtonElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<EmbedPlayerHandle>(null);
  const router = useRouter();
  const pathname = usePathname();
  const title = anime.title_english || anime.title;

  const [lightMode,  setLightMode]  = usePersist("ctrl_lightMode",  false);

  // Light mode — dim everything except the player
  useEffect(() => {
    document.body.classList.toggle("light-mode", lightMode);
    return () => document.body.classList.remove("light-mode");
  }, [lightMode]);

  // Sync episode to URL so refresh restores it
  useEffect(() => {
    router.replace(`${pathname}?ep=${currentEp}`, { scroll: false });
  }, [currentEp, pathname, router]);

  const totalPages = Math.ceil(totalEpisodes / PAGE_SIZE);
  const pageStart = epPage * PAGE_SIZE + 1;
  const pageEnd = Math.min(pageStart + PAGE_SIZE - 1, totalEpisodes);
  const pageEpisodes = Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i);

  const filtered = epSearch.trim()
    ? Array.from({ length: totalEpisodes }, (_, i) => i + 1).filter((n) =>
        String(n).includes(epSearch.trim())
      )
    : pageEpisodes;

  // Auto-scroll active ep into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentEp, epPage]);

  // Jump to correct page when ep changes externally
  useEffect(() => {
    const page = Math.floor((currentEp - 1) / PAGE_SIZE);
    setEpPage(page);
  }, [currentEp]);

  const goNext = () => { if (currentEp < totalEpisodes) setCurrentEp((n) => n + 1); };
  const goPrev = () => { if (currentEp > 1) setCurrentEp((n) => n - 1); };

  const [expanded, setExpanded] = useState(false);

  const expand = () => setExpanded(e => !e);

  // Escape exits expand mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Back breadcrumb */}
      <Link
        href={`/anime/${anime.mal_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-2"
      >
        <ChevronLeft size={15} />
        {title}
      </Link>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* ── Left: player + controls ── */}
        <div className="flex-1 min-w-0">
          {/* Backdrop when expanded */}
          {expanded && (
            <div
              className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
              onClick={() => setExpanded(false)}
            />
          )}

          {/* Reload — top right above video */}
          <div className="flex justify-end mb-1">
            <button
              onClick={() => embedRef.current?.reload()}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-[#1a1a2e] text-slate-500 border border-white/10 hover:text-white hover:border-white/30 transition-all"
            >
              <RefreshCw size={11} /> Reload
            </button>
          </div>

          {/* Placeholder keeps layout space when expanded */}
          {expanded && <div className="aspect-video w-full rounded-xl bg-black/20 mb-2" />}

          <div
            ref={playerRef}
            className={`watch-player-area ${expanded ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] shadow-2xl shadow-black/80" : "relative"}`}
            style={{ zIndex: expanded ? 9999 : lightMode ? 9999 : undefined }}
          >
            <EmbedPlayer
              ref={embedRef}
              malId={anime.mal_id}
              animeKaiBaseUrl={animeKaiBaseUrl}
              episode={currentEp}
              title={anime.title}
              titleEn={anime.title_english}
              posterUrl={anime.images?.jpg?.large_image_url}
              lightMode={lightMode}
              expanded={expanded}
              onLightToggle={() => setLightMode(!lightMode)}
              onExpand={expand}
            />
          </div>{/* end watch-player-area */}

          {/* Prev / title / Next */}
          <div className="flex items-center gap-3 mt-3 mb-4">
            <button
              onClick={goPrev}
              disabled={currentEp <= 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a2e] border border-white/10 text-slate-300 rounded-lg hover:bg-violet-600/20 hover:border-violet-500/30 hover:text-white transition-all text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <ChevronLeft size={15} /> Prev
            </button>

            <div className="flex-1 min-w-0 text-center">
              <p className="text-white font-bold text-sm md:text-base truncate">{title}</p>
              <p className="text-violet-400 text-xs mt-0.5">Episode {currentEp}{totalEpisodes > 1 ? ` of ${totalEpisodes}` : ""}</p>
            </div>

            <button
              onClick={goNext}
              disabled={currentEp >= totalEpisodes}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a2e] border border-white/10 text-slate-300 rounded-lg hover:bg-violet-600/20 hover:border-violet-500/30 hover:text-white transition-all text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>

          {/* Anime info strip */}
          <div className="bg-[#13131f] rounded-xl border border-white/5 p-4 flex gap-4 items-start">
            {anime.images?.jpg?.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={anime.images.jpg.image_url}
                alt={title}
                className="w-14 h-20 object-cover rounded-lg shrink-0 border border-white/10"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {anime.status && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    anime.status === "Currently Airing"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-white/10 text-slate-300 border-white/10"
                  }`}>{anime.status}</span>
                )}
                {anime.type && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">{anime.type}</span>
                )}
                {anime.score && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">★ {anime.score.toFixed(1)}</span>
                )}
              </div>
              {anime.synopsis && (
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {anime.synopsis.replace(/\[Written by MAL Rewrite\]/g, "").trim()}
                </p>
              )}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {anime.genres.slice(0, 6).map((g) => (
                    <Link
                      key={g.mal_id}
                      href={`/browse?filter=all&genre=${g.mal_id}`}
                      className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded px-1.5 py-0.5 hover:bg-violet-500/20 transition-colors"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: episode list ── */}
        <div className="xl:w-72 shrink-0">
          <div
            className="xl:sticky xl:top-20 flex flex-col bg-[#13131f] rounded-xl border border-white/5 overflow-hidden"
            style={{ maxHeight: "min(640px, 80vh)" }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/5 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <List size={15} className="text-violet-400" />
                  <h3 className="text-white font-bold text-sm">Episodes</h3>
                </div>
                <span className="text-[11px] text-slate-500 bg-white/5 rounded-full px-2 py-0.5">
                  {totalEpisodes} total
                </span>
              </div>

              {/* Search */}
              {totalEpisodes > PAGE_SIZE && !epSearch && (
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setEpPage(i)}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        epPage === i
                          ? "bg-violet-600 text-white"
                          : "bg-white/5 text-slate-500 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {i * PAGE_SIZE + 1}–{Math.min((i + 1) * PAGE_SIZE, totalEpisodes)}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="number"
                  min={1}
                  max={totalEpisodes}
                  value={epSearch}
                  onChange={(e) => setEpSearch(e.target.value)}
                  placeholder={`Jump to episode (1–${totalEpisodes})…`}
                  className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Episode rows */}
            <div className="overflow-y-auto flex-1 py-2">
              {filtered.map((ep) => {
                const active = ep === currentEp;
                return (
                  <button
                    key={ep}
                    ref={active ? activeRef : undefined}
                    onClick={() => { setCurrentEp(ep); setEpSearch(""); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all group ${
                      active
                        ? "bg-violet-600/15 border-l-2 border-violet-500"
                        : "border-l-2 border-transparent hover:bg-white/5 hover:border-violet-500/40"
                    }`}
                  >
                    {/* Play icon or number */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                      active
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-slate-500 group-hover:bg-violet-600/20 group-hover:text-violet-300"
                    }`}>
                      {active
                        ? <Play size={11} fill="white" className="ml-0.5" />
                        : ep}
                    </div>

                    {/* Label */}
                    <div className="text-left min-w-0">
                      <p className={`text-sm font-medium leading-tight ${active ? "text-violet-300" : "text-slate-300 group-hover:text-white"}`}>
                        Episode {ep}
                      </p>
                    </div>

                    {/* Active dot */}
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
