import type { MetadataRoute } from "next";

export const revalidate = 86400;

const BASE = "https://aniwatsu.com";

async function getTopAnimeIds(): Promise<number[]> {
  try {
    const res = await fetch("https://api.jikan.moe/v4/top/anime?limit=25&type=tv", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data ?? []).map((a: { mal_id: number }) => a.mal_id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getTopAnimeIds();

  const animeEntries: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${BASE}/anime/${id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/browse`, changeFrequency: "daily", priority: 0.9 },
    ...animeEntries,
  ];
}
