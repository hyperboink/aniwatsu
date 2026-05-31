export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getAnimeById } from "@/lib/api";
import WatchClient from "@/components/watch/WatchClient";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ep?: string }> };

/** Get AnimeKAI watch URL from MALSync (covers most anime, no iframe restrictions) */
async function getAnimeKaiUrl(malId: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api.malsync.moe/mal/anime/${malId}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const kai = data?.Sites?.AnimeKAI ?? {};
    const entry = Object.values(kai)[0] as { url?: string } | undefined;
    if (!entry?.url) return null;
    // Strip the #ep=N fragment — we'll append the right episode number ourselves
    return entry.url.replace(/#.*$/, "");
  } catch {
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const { ep } = await searchParams;
    const { data } = await getAnimeById(Number(id));
    const title = data.title_english || data.title;
    const episode = ep ? ` – Episode ${ep}` : "";
    const description = `Watch ${title}${episode} free online in HD on Aniwatsu. No sign-up required.`;
    const image = data.images?.jpg?.large_image_url;
    const url = `https://aniwatsu.com/watch/${id}`;
    return {
      title: `Watch ${title}${episode}`,
      description,
      alternates: { canonical: url },
      robots: { index: false, follow: false },
      openGraph: {
        title: `Watch ${title}${episode} | Aniwatsu`,
        description,
        url,
        siteName: "Aniwatsu",
        images: image ? [{ url: image, alt: title }] : [],
      },
      twitter: { card: "summary_large_image", title: `Watch ${title}${episode}`, description, images: image ? [image] : [] },
    };
  } catch {
    return { title: "Watch" };
  }
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ep } = await searchParams;
  const malId = Number(id);

  const [{ data: anime }, animeKaiBaseUrl] = await Promise.all([
    getAnimeById(malId).catch(() => notFound()),
    getAnimeKaiUrl(malId),
  ]);

  const totalEpisodes = anime.episodes && anime.episodes > 0 ? anime.episodes : 1;
  const startEpisode = Math.min(Math.max(Number(ep) || 1, 1), totalEpisodes);

  return (
    <div className="min-h-screen">
      <WatchClient
        anime={anime}
        totalEpisodes={totalEpisodes}
        startEpisode={startEpisode}
        animeKaiBaseUrl={animeKaiBaseUrl}
      />
    </div>
  );
}
