import { NextRequest, NextResponse } from "next/server";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
  "Referer": "https://anikototv.to/",
};

const BASE = "https://anikototv.to";

async function searchSlug(title: string): Promise<string | null> {
  const url = `${BASE}/ajax/anime/search?keyword=${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = await res.json();
  const html: string = data?.result?.html ?? "";
  const match = html.match(/\/watch\/([a-z0-9-]+)/);
  return match ? match[1] : null;
}

function scoreTitle(anikotoHtml: string, query: string): { slug: string; score: number }[] {
  const slugs = [...anikotoHtml.matchAll(/href="https:\/\/anikototv\.to\/watch\/([a-z0-9-]+)"/g)].map(m => m[1]);
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const q = clean(query);
  return slugs.map(slug => {
    const slugWords = slug.replace(/-[a-z0-9]{5,6}$/, "").replace(/-/g, " ");
    const score = slugWords === q ? 100 : slugWords.includes(q) || q.includes(slugWords) ? 70 : 30;
    return { slug, score };
  }).sort((a, b) => b.score - a.score);
}

async function getAnimeId(slug: string): Promise<number | null> {
  const res = await fetch(`${BASE}/watch/${slug}`, {
    headers: { ...HEADERS, "X-Requested-With": "" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const match = html.match(/data-id="(\d+)"/);
  return match ? Number(match[1]) : null;
}

async function getEpisodeDataIds(animeId: number, episode: number): Promise<string | null> {
  const res = await fetch(`${BASE}/ajax/episode/list/${animeId}`, {
    headers: HEADERS,
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const html: string = data?.result ?? "";
  const epPattern = new RegExp(`data-num="${episode}"[^>]*data-ids="([^"]+)"`);
  const match = html.match(epPattern);
  return match ? match[1] : null;
}

type AnikotoServer = { name: string; linkId: string };

async function getServerLinkIds(dataIds: string): Promise<AnikotoServer[]> {
  const res = await fetch(`${BASE}/ajax/server/list?servers=${encodeURIComponent(dataIds)}`, {
    headers: HEADERS,
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (data?.status !== 200) return [];
  const html: string = data.result ?? "";
  const matches = [...html.matchAll(/data-link-id="([^"]+)"[^>]*>([^<]+)</g)];
  return matches.map(m => ({ linkId: m[1], name: m[2].trim() }));
}

async function resolveEmbedUrl(linkId: string): Promise<string | null> {
  const res = await fetch(`${BASE}/ajax/server?get=${encodeURIComponent(linkId)}`, {
    headers: HEADERS,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.result?.url ?? null;
}

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  const titleEn = req.nextUrl.searchParams.get("titleEn");
  const epParam = req.nextUrl.searchParams.get("ep");

  if (!title || !epParam) {
    return NextResponse.json({ error: "Missing title or ep" }, { status: 400 });
  }

  const episode = Math.max(1, Number(epParam) || 1);
  const queries = [titleEn, title].filter(Boolean) as string[];

  let slug: string | null = null;
  for (const q of queries) {
    slug = await searchSlug(q);
    if (slug) break;
  }
  if (!slug) return NextResponse.json({ error: "Not found on AniKoto" }, { status: 404 });

  const animeId = await getAnimeId(slug);
  if (!animeId) return NextResponse.json({ error: "Could not resolve anime ID" }, { status: 404 });

  const dataIds = await getEpisodeDataIds(animeId, episode);
  if (!dataIds) return NextResponse.json({ error: "Episode not found" }, { status: 404 });

  const servers = await getServerLinkIds(dataIds);
  if (!servers.length) return NextResponse.json({ error: "No servers found" }, { status: 404 });

  const resolved = await Promise.all(
    servers.map(async s => {
      const url = await resolveEmbedUrl(s.linkId);
      return url ? { name: s.name, url } : null;
    })
  );

  const results = resolved.filter(Boolean) as { name: string; url: string }[];
  if (!results.length) return NextResponse.json({ error: "Could not resolve embed URLs" }, { status: 404 });

  return NextResponse.json({ servers: results });
}
