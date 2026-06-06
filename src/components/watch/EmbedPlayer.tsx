"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { usePersist } from "@/hooks/usePersist";
import { Server, Play, Sun, Maximize2, RefreshCw } from "lucide-react";
import Image from "next/image";

type Props = {
  malId: number;
  animeKaiBaseUrl: string | null;
  episode: number;
  title: string;
  titleEn?: string;
  posterUrl?: string;
  lightMode?: boolean;
  expanded?: boolean;
  onLightToggle?: () => void;
  onExpand?: () => void;
  onFetching?: (fetching: boolean) => void;
  onReload?: () => void;
};

export type EmbedPlayerHandle = { reload: () => void };

type Server_ = { label: string; url: string };

const storageKey = (malId: number, ep: number) => `watch_${malId}_ep${ep}`;

const EmbedPlayer = forwardRef<EmbedPlayerHandle, Props>(function EmbedPlayer({ malId, animeKaiBaseUrl, episode, title, titleEn, posterUrl, lightMode, expanded, onLightToggle, onExpand, onFetching, onReload }: Props, ref) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [servers, setServers] = useState<Server_[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [isDub, setIsDub] = usePersist<boolean>("player_isDub", false);
  const [savedServer, setSavedServer] = usePersist<string | null>("player_server", null);
  const [userClicked, setUserClicked] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true); // only on very first load
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const hasEverPlayed = useRef(false);
  const preferredServer = useRef<string | null>(null);
  // Sync savedServer into preferredServer ref on mount
  useEffect(() => {
    if (savedServer) preferredServer.current = savedServer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevEpisodeRef = useRef(episode);

  const activeUrl = servers[activeIdx]?.url ?? null;
  const noServers = fetched && servers.length === 0;


  // Build iframe src — append saved timestamp if available
  const buildSrc = (url: string) => {
    const saved = localStorage.getItem(storageKey(malId, episode));
    const t = saved ? Math.max(0, Math.floor(Number(saved)) - 3) : 0;
    if (!t) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${t}#t=${t}`;
  };

  // Fetch servers on mount / episode / dub change
  useEffect(() => {
    let cancelled = false; // cancel stale fetches when effect re-runs

    setFetching(true);
    onFetching?.(true);
    setFetched(false);
    setShowHint(false);
    if (hintTimer.current) clearTimeout(hintTimer.current);

    const episodeChanged = prevEpisodeRef.current !== episode;
    prevEpisodeRef.current = episode;

    if (!hasEverPlayed.current) {
      // First ever load — show overlay
      setActiveIdx(0);
      setServers([]);
      setUserClicked(false);
      setOverlayVisible(true);
      setIframeLoaded(false);
    } else if (episodeChanged) {
      // Episode changed — reset player fully
      setActiveIdx(0);
      setServers([]);
      setUserClicked(false);
      setOverlayVisible(false);
      setIframeLoaded(false);
    }
    // Audio mode switch — keep existing servers/iframe visible until new ones arrive

    const params = new URLSearchParams({ title, ep: String(episode) });
    if (titleEn) params.set("titleEn", titleEn);
    if (isDub) params.set("dub", "true");

    const gogoFetch = fetch(`/api/embed?${params.toString()}`)
      .then((r) => r.json())
      .then((data): Server_[] =>
        data.urls?.length
          ? data.urls.map((url: string, i: number) => ({ label: `Server ${i + 1}`, url }))
          : []
      )
      .catch((): Server_[] => []);

    const anikotoFetch = fetch(`/api/anikoto?${params.toString()}`)
      .then((r) => r.json())
      .then((data): Server_[] =>
        data.servers?.length
          ? data.servers.map((s: { name: string; url: string }) => ({ label: s.name, url: s.url }))
          : []
      )
      .catch((): Server_[] => []);

    Promise.all([gogoFetch, anikotoFetch])
      .then(([gogo, anikoto]) => {
        if (cancelled) return; // discard results from a stale episode

        const seen = new Set<string>();
        const all = [...gogo, ...anikoto].filter(s => {
          const key = s.label.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        if (!all.length) return;

        const defaultIdx = gogo.length === 0
          ? Math.max(0, all.findIndex(s => s.label.toLowerCase() === "vidcloud-1"))
          : 0;

        const resolvedIdx = (() => {
          if (preferredServer.current) {
            const match = all.findIndex(s => s.label.toLowerCase() === preferredServer.current!.toLowerCase());
            if (match !== -1) return match;
          }
          return defaultIdx;
        })();

        setServers(all);
        setActiveIdx(resolvedIdx);
        setUserClicked(true);
        hasEverPlayed.current = true;
      })
      .finally(() => { if (!cancelled) { setFetching(false); onFetching?.(false); setFetched(true); } });

    return () => { cancelled = true; };
  }, [malId, episode, title, titleEn, fetchKey, isDub]);

  // Listen for time updates from the iframe (megacloud / gogoanime players)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        const time: number | undefined =
          data?.event === "time" ? data.currentTime :
          data?.type === "timeupdate" ? data.time : undefined;

        if (typeof time === "number" && time > 0) {
          localStorage.setItem(storageKey(malId, episode), String(time));
        }

      } catch { /* non-JSON messages */ }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [malId, episode]);

  const handleClick = () => setUserClicked(true);

  const audioDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchAudio = (dub: boolean) => {
    if (dub === isDub) return; // already active
    if (audioDebounce.current) clearTimeout(audioDebounce.current);
    audioDebounce.current = setTimeout(() => {
      setIsDub(dub);
      setActiveIdx(0);
      setIframeLoaded(false);
    }, 300);
  };

  const switchServer = (idx: number) => {
    const label = servers[idx]?.label ?? null;
    preferredServer.current = label;
    setSavedServer(label);
    setActiveIdx(idx);
    setIframeLoaded(false);
    setShowHint(false);
    if (hintTimer.current) clearTimeout(hintTimer.current);
  };

  const reload = () => {
    setIframeLoaded(false);
    setUserClicked(false);
    setFetched(false);
    setFetching(false);
    setServers([]);
    setActiveIdx(0);
    setFetchKey(k => k + 1);
  };

  useImperativeHandle(ref, () => ({ reload }));

  const playerKey = `${malId}-${episode}`;

  return (
    <div className="w-full" key={playerKey}>

      {/* Player */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">


        {/* Not available */}
        {noServers && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d14] gap-5 p-6 text-center z-10">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-white/10 bg-[#0d0d14]" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1.5">Not Available</p>
              <p className="text-slate-500 text-sm max-w-[220px] leading-relaxed">
                This title isn&apos;t in our streaming library yet.
              </p>
            </div>
          </div>
        )}

        {/* Play overlay — shown as fallback until user clicks or iframe loads */}
        {overlayVisible && !noServers && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer group"
            onClick={() => { handleClick(); setOverlayVisible(false); hasEverPlayed.current = true; }}
          >
            {posterUrl && (
              <Image src={posterUrl} alt={title} fill
                className="object-cover opacity-20 -z-10"
                sizes="(max-width: 1280px) 100vw, 896px"
              />
            )}
            {fetching
              ? <div className="w-14 h-14 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin mb-4" />
              : (
                <div className="w-20 h-20 rounded-full bg-violet-600/90 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-violet-500 transition-colors glow">
                  <Play size={36} className="text-white ml-1" fill="white" />
                </div>
              )
            }
            <p className="text-white font-semibold text-lg drop-shadow">{title}</p>
            <p className="text-violet-300 text-sm mt-1">
              {fetching ? "Loading servers…" : `Episode ${episode} — Click to play`}
            </p>
          </div>
        )}

        {/* Loading spinner after click while iframe loads */}
        {userClicked && !iframeLoaded && !overlayVisible && !noServers && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d14] z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
              <p className="text-slate-400 text-sm">Loading episode {episode}…</p>
            </div>
          </div>
        )}

        {/* Iframe — renders in background as soon as servers are ready */}
        {userClicked && activeUrl && (
          <iframe
            ref={iframeRef}
            key={`${playerKey}-${activeIdx}`}
            src={buildSrc(activeUrl)}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => {
              setIframeLoaded(true);
              setOverlayVisible(false);
              hasEverPlayed.current = true;
              hintTimer.current = setTimeout(() => setShowHint(true), 5000);
            }}
          />
        )}

      </div>

      {/* Unified toolbar: servers left, controls right */}
      <div className="flex items-center gap-2 mt-4 mb-1 flex-wrap">
        {/* Sub / Dub toggle — only show Dub if available */}
        <div className="flex items-center bg-[#1a1a2e] border border-white/10 rounded-lg overflow-hidden mr-1">
          {(["Sub", "Dub"] as string[]).map((opt) => {
            const active = opt === "Dub" ? isDub : !isDub;
            return (
              <button
                key={opt}
                onClick={() => switchAudio(opt === "Dub")}
                disabled={active}
                className={`px-3 py-1 text-xs font-semibold transition-all ${
                  active
                    ? "bg-violet-600 text-white cursor-default"
                    : "text-slate-500 hover:text-slate-300 cursor-pointer"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <span className={`text-xs flex items-center gap-1 ${lightMode ? "text-white/20" : "text-slate-500"}`}>
          <Server size={11} /> Server:
        </span>
        {servers.map((s, i) => (
          <button
            key={i}
            onClick={() => switchServer(i)}
            disabled={activeIdx === i}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              lightMode
                ? activeIdx === i
                  ? "bg-white/10 text-white/40 border-white/15 cursor-default"
                  : "bg-white/5 text-white/20 border-white/8"
                : activeIdx === i
                  ? "bg-violet-600 text-white border-violet-600 cursor-default"
                  : "bg-[#1a1a2e] text-slate-400 border-white/10 hover:border-violet-500/40 hover:text-violet-300"
            }`}
          >
            {s.label}
          </button>
        ))}
        {fetching && (
          <span className="text-xs text-slate-600 px-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-violet-500/40 border-t-violet-400 animate-spin inline-block" />
            Loading servers…
          </span>
        )}
        {/* Light + Expand on the right */}
        <div className="ml-auto flex items-center gap-1.5">
          {onLightToggle && (
            <button
              onClick={onLightToggle}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                lightMode
                  ? "bg-white/5 text-slate-400 border-white/15 hover:border-white/25"
                  : "bg-[#1a1a2e] text-slate-500 border-white/8 hover:text-slate-300 hover:border-white/20"
              }`}
            >
              <Sun size={13} /> {lightMode ? "Light off" : "Light on"}
            </button>
          )}
          {onExpand && (
            <button
              onClick={onExpand}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                lightMode
                  ? "bg-white/5 text-white/20 border-white/5 hover:text-white/30"
                  : "bg-[#1a1a2e] text-slate-500 border-white/8 hover:text-slate-300 hover:border-white/20"
              }`}
            >
              <Maximize2 size={13} /> {expanded ? "Exit expand" : "Expand"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default EmbedPlayer;
