export const dynamic = "force-dynamic";

import { Search } from "lucide-react";
import AnimeGrid from "@/components/anime/AnimeGrid";
import { searchAnime } from "@/lib/api";
import type { Metadata } from "next";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search Anime" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;

  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center">
          <Search size={28} className="text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Search Anime</h1>
        <p className="text-slate-500 text-sm">Use the search bar above to find anime</p>
      </div>
    );
  }

  const { data, pagination } = await searchAnime(q, page);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Search results for{" "}
          <span className="text-violet-400">&ldquo;{q}&rdquo;</span>
        </h1>
        <p className="text-slate-500 text-sm">
          Page {pagination.current_page} of {pagination.last_visible_page}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-slate-400">No results found for &ldquo;{q}&rdquo;</p>
        </div>
      ) : (
        <>
          <AnimeGrid anime={data} />

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-10">
            {page > 1 && (
              <a
                href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}
                className="px-4 py-2 bg-[#1a1a2e] border border-white/10 text-white rounded-lg hover:bg-violet-600/20 hover:border-violet-500/30 transition-all text-sm font-medium"
              >
                ← Previous
              </a>
            )}
            <span className="text-sm text-slate-500">
              {page} / {pagination.last_visible_page}
            </span>
            {pagination.has_next_page && (
              <a
                href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}
                className="px-4 py-2 bg-[#1a1a2e] border border-white/10 text-white rounded-lg hover:bg-violet-600/20 hover:border-violet-500/30 transition-all text-sm font-medium"
              >
                Next →
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
