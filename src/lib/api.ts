export type { Anime, PaginatedResponse } from "@/types/anime";
export { GENRES } from "@/constants/genres";

import type { Anime, PaginatedResponse } from "@/types/anime";

const BASE = "https://api.jikan.moe/v4";

async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
  return res.json();
}

export async function getCurrentSeasonAnime(page = 1) {
  return fetcher<PaginatedResponse<Anime>>(`/seasons/now?page=${page}&limit=24`);
}

export async function getTopAnime(filter = "bypopularity", page = 1) {
  return fetcher<PaginatedResponse<Anime>>(`/top/anime?filter=${filter}&page=${page}&limit=24`);
}

export async function getAnimeById(id: number) {
  return fetcher<{ data: Anime }>(`/anime/${id}/full`);
}

export async function searchAnime(q: string, page = 1) {
  return fetcher<PaginatedResponse<Anime>>(
    `/anime?q=${encodeURIComponent(q)}&page=${page}&limit=24&sfw=true`
  );
}

export async function getAnimeByGenre(genreId: number, page = 1) {
  return fetcher<PaginatedResponse<Anime>>(
    `/anime?genres=${genreId}&page=${page}&limit=24&order_by=score&sort=desc`
  );
}

// Combined genre + filter. Maps filter names to Jikan /anime query params.
const FILTER_TO_QUERY: Record<string, Record<string, string>> = {
  all:          {},
  bypopularity: { order_by: "members",    sort: "desc" },
  favorite:     { order_by: "score",      sort: "desc" },
  airing:       { status: "airing",       order_by: "score", sort: "desc" },
  upcoming:     { status: "upcoming",     order_by: "members", sort: "desc" },
  season:       { status: "airing",       order_by: "score", sort: "desc" },
  movie:        { type: "movie",          order_by: "score", sort: "desc" },
};

export async function getAnimeFiltered(opts: {
  genre?: number;
  filter?: string;
  page?: number;
}) {
  const { genre, filter = "bypopularity", page = 1 } = opts;
  const base = FILTER_TO_QUERY[filter] ?? FILTER_TO_QUERY.bypopularity;
  const params = new URLSearchParams({ page: String(page), limit: "24", ...base });
  if (genre) params.set("genres", String(genre));
  return fetcher<PaginatedResponse<Anime>>(`/anime?${params.toString()}`);
}

export async function getAnimeByType(type: string, page = 1) {
  return fetcher<PaginatedResponse<Anime>>(
    `/anime?type=${type}&page=${page}&limit=24&order_by=score&sort=desc&sfw=true`
  );
}

export async function getSeasonalAnime(year: number, season: string) {
  return fetcher<PaginatedResponse<Anime>>(`/seasons/${year}/${season}?limit=24`);
}

export async function getAnimeRecommendations(id: number) {
  const res = await fetcher<{ data: { entry: { mal_id: number } }[] }>(
    `/anime/${id}/recommendations`
  );
  const ids = res.data.slice(0, 12).map((r) => r.entry.mal_id);
  // Fetch full anime data so cards have score, type, genres, etc.
  const results = await Promise.allSettled(
    ids.map((mid) => fetcher<{ data: Anime }>(`/anime/${mid}`).then((r) => r.data))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Anime> => r.status === "fulfilled")
    .map((r) => r.value);
}
