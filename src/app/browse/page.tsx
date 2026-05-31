export const dynamic = "force-dynamic";

import AnimeGrid from "@/components/anime/AnimeGrid";
import SectionHeader from "@/components/anime/SectionHeader";
import { getAnimeFiltered, GENRES } from "@/lib/api";
import GenrePills from "@/components/anime/GenrePills";
import Link from "next/link";
import { Flame, Star, TrendingUp, Calendar, Film, LayoutGrid, X } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

type Props = { searchParams: Promise<{ filter?: string; genre?: string; page?: string }> };

const FILTER_META: Record<string, { label: string; icon: ReactNode; desc: string }> = {
  all:          { label: "All",              icon: <LayoutGrid size={16} />, desc: "All anime" },
  bypopularity: { label: "Most Popular",     icon: <TrendingUp size={16} />, desc: "Ranked by member count" },
  favorite:     { label: "Top Rated",        icon: <Star size={16} />,       desc: "Highest scored anime of all time" },
  airing:       { label: "Currently Airing", icon: <Flame size={16} />,      desc: "Anime currently airing new episodes" },
  upcoming:     { label: "Upcoming",         icon: <Calendar size={16} />,   desc: "Anime coming soon" },
  season:       { label: "This Season",      icon: <LayoutGrid size={16} />, desc: "Current season anime" },
  movie:        { label: "Movies",           icon: <Film size={16} />,       desc: "Anime feature films" },
};

import type { Anime, PaginatedResponse } from "@/lib/api";

const EMPTY: PaginatedResponse<Anime> = { data: [], pagination: { current_page: 1, last_visible_page: 1, has_next_page: false } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { filter = "bypopularity", genre } = await searchParams;
  const genreName = genre ? GENRES.find((g) => g.id === Number(genre))?.name : null;
  const filterLabel = FILTER_META[filter]?.label ?? "Browse";
  const title = genreName
    ? `${filterLabel} · ${genreName}`
    : filterLabel;
  return { title };
}

export default async function BrowsePage({ searchParams }: Props) {
  const { filter = "bypopularity", genre, page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;
  const genreId = genre ? Number(genre) : undefined;
  const activeGenre = genreId ? GENRES.find((g) => g.id === genreId) : null;
  const meta = FILTER_META[filter] ?? FILTER_META.bypopularity;

  let data = EMPTY;
  try {
    data = await getAnimeFiltered({ genre: genreId, filter, page });
  } catch {
    // API error — show empty state
  }

  const pagination = data.pagination ?? EMPTY.pagination;

  const buildHref = (p: number) => {
    const params = new URLSearchParams({ filter });
    if (genre) params.set("genre", genre);
    if (p > 1) params.set("page", String(p));
    return `/browse?${params.toString()}`;
  };

  // Build title from active combination
  const pageTitle = [meta.label, activeGenre?.name].filter(Boolean).join(" · ");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6 pb-5 border-b border-white/5">
        {Object.entries(FILTER_META).map(([key, val]) => {
          // Keep genre when switching filter
          const href = `/browse?filter=${key}${genre ? `&genre=${genre}` : ""}`;
          const active = filter === key;
          return (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                  : "bg-[#1a1a2e] text-slate-400 hover:text-white border border-white/5 hover:border-violet-500/30"
              }`}
            >
              {val.icon}
              {val.label}
            </Link>
          );
        })}
      </div>

      {/* Genre pills — passes current filter so it's preserved on genre click */}
      <GenrePills activeGenreId={activeGenre?.id} currentFilter={filter} />

      {/* Active combination chips */}
      {(filter !== "all" || activeGenre) && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs text-slate-500 uppercase tracking-widest">Filtering by:</span>
          {filter !== "all" && (
            <span className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-full px-3 py-1 text-xs font-medium">
              {meta.icon}
              {meta.label}
              <Link
                href={`/browse${activeGenre ? `?filter=all&genre=${activeGenre.id}` : ""}`}
                className="hover:text-white transition-colors ml-0.5"
                title="Remove sort filter"
              >
                <X size={11} />
              </Link>
            </span>
          )}
          {activeGenre && (
            <>
              {filter !== "all" && <span className="text-slate-600 text-xs">+</span>}
              <span className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-full px-3 py-1 text-xs font-medium">
                {activeGenre.name}
                <Link
                  href={`/browse?filter=${filter}`}
                  className="hover:text-white transition-colors ml-0.5"
                  title="Remove genre filter"
                >
                  <X size={11} />
                </Link>
              </span>
            </>
          )}
        </div>
      )}

      {/* Section header */}
      <SectionHeader title={pageTitle} icon={meta.icon} />

      {data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <Film size={40} className="opacity-30" />
          <p>No anime found. Try a different combination.</p>
        </div>
      ) : (
        <>
          <AnimeGrid anime={data.data} />

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-10">
            {page > 1 && (
              <Link
                href={buildHref(page - 1)}
                className="px-4 py-2 bg-[#1a1a2e] border border-white/10 text-white rounded-lg hover:bg-violet-600/20 hover:border-violet-500/30 transition-all text-sm font-medium"
              >
                ← Previous
              </Link>
            )}
            <span className="text-sm text-slate-500">
              Page {pagination.current_page} of {pagination.last_visible_page}
            </span>
            {pagination.has_next_page && (
              <Link
                href={buildHref(page + 1)}
                className="px-4 py-2 bg-[#1a1a2e] border border-white/10 text-white rounded-lg hover:bg-violet-600/20 hover:border-violet-500/30 transition-all text-sm font-medium"
              >
                Next →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
