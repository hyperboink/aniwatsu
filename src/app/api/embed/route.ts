import { NextRequest, NextResponse } from "next/server";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

// Musical / special symbols GogoAnimes converts to words in slugs
const SYMBOL_MAP: [RegExp, string][] = [
  [/♭/g, "flat"],
  [/♯/g, "sharp"],
  [/★/g, "star"],
  [/☆/g, "star"],
  [/²/g, "2"],
  [/³/g, "3"],
  [/½/g, "half"],
  [/&/g, "and"],
];

/** Convert any title to a GogoAnimes-style slug */
function toSlug(t: string): string {
  let s = t;
  for (const [re, rep] of SYMBOL_MAP) s = s.replace(re, ` ${rep}`);
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Search GogoAnimes full-text and return { slug, title } list */
async function searchGogo(keyword: string): Promise<{ slug: string; title: string }[]> {
  const url = `https://gogoanimes.fi/search.html?keyword=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const html = await res.text();
  const pattern = /href="\/category\/([a-z0-9][a-z0-9-]*)"\s[^>]*>\s*([^<]+)/g;
  const results: { slug: string; title: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const slug = m[1].trim();
    const title = m[2].trim();
    if (title && !results.find((r) => r.slug === slug)) results.push({ slug, title });
  }
  return results;
}

/** Try a slug directly on GogoAnimes without search (bypasses search gaps) */
async function probeSlug(slug: string, episode: number): Promise<string[]> {
  return getEmbedUrls(slug, episode);
}

function scoreMatch(gogoTitle: string, query: string): number {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  const a = clean(gogoTitle);
  const b = clean(query);
  if (a === b) return 100;
  if (a.startsWith(b) || b.startsWith(a)) return 85;
  const dubPenalty = 0; // penalty applied externally based on dub param
  const wordsA = new Set(a.split(" "));
  const wordsB = b.split(" ");
  const overlap = wordsB.filter((w) => w.length > 2 && wordsA.has(w)).length;
  return Math.round((overlap / Math.max(wordsA.size, wordsB.length)) * 70) + dubPenalty;
}

/** All title variations to try as search queries + direct slugs */
function buildVariants(titleEn: string | null, title: string) {
  const seenQ = new Set<string>();
  const seenS = new Set<string>();
  const queries: string[] = [];
  const slugs: string[] = [];

  const addQ = (s: string) => { const t = s.trim(); if (t.length > 2 && !seenQ.has(t)) { seenQ.add(t); queries.push(t); } };
  const addS = (s: string) => { const t = s.trim(); if (t.length > 2 && !seenS.has(t)) { seenS.add(t); slugs.push(t); } };

  const candidates = [titleEn, title].filter(Boolean) as string[];

  for (const t of candidates) {
    addQ(t);
    addS(toSlug(t));

    // Strip subtitle after colon
    const noSub = t.replace(/\s*[:.].+$/, "").trim();
    addQ(noSub); addS(toSlug(noSub));

    // Strip season suffix
    const noSeason = t.replace(/\s*(season\s*\d+|\d+(?:st|nd|rd|th)\s*season)/i, "").trim();
    addQ(noSeason); addS(toSlug(noSeason));

    // Strip both
    const bare = noSub.replace(/\s*(season\s*\d+|\d+(?:st|nd|rd|th)\s*season)/i, "").trim();
    addQ(bare); addS(toSlug(bare));

    // First 3 words
    addQ(t.split(/\s+/).slice(0, 3).join(" "));
  }

  return { queries, slugs };
}

/** Fetch episode page and return all server embed URLs */
async function getEmbedUrls(slug: string, episode: number): Promise<string[]> {
  const url = `https://gogoanimes.fi/${slug}-episode-${episode}`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const html = await res.text();
  const matches = [...html.matchAll(/data-video="(https:\/\/gogoanime\.me\.uk\/newplayer\.php[^"]+)"/gi)];
  return matches.map((m) => m[1]);
}

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  const titleEn = req.nextUrl.searchParams.get("titleEn");
  const epParam = req.nextUrl.searchParams.get("ep");
  const dub = req.nextUrl.searchParams.get("dub") === "true";

  if (!title || !epParam) {
    return NextResponse.json({ error: "Missing title or ep" }, { status: 400 });
  }

  const episode = Math.max(1, Number(epParam) || 1);
  const { queries, slugs } = buildVariants(titleEn, title);

  // For dub: try <slug>-dub variants first
  const dubSlugs = slugs.map((s) => `${s}-dub`);
  const orderedSlugs = dub ? [...dubSlugs, ...slugs] : slugs;

  // 1. Try direct slug probes first (fast, no search round-trip)
  for (const slug of orderedSlugs) {
    try {
      const urls = await probeSlug(slug, episode);
      if (urls.length) return NextResponse.json({ urls, url: urls[0], slug, matched: slug });
    } catch { /* next */ }
  }

  // 2. Fall back to full-text search
  for (const query of queries) {
    try {
      const results = await searchGogo(dub ? `${query} dub` : query);
      if (!results.length) continue;

      const scored = results
        .map((r) => ({
          ...r,
          score: scoreMatch(r.title, query) + (dub && r.title.toLowerCase().includes("dub") ? 30 : 0),
        }))
        .filter((r) => r.score > 10)
        .sort((a, b) => b.score - a.score);

      for (const candidate of scored.slice(0, 4)) {
        const urls = await getEmbedUrls(candidate.slug, episode);
        if (urls.length) {
          return NextResponse.json({ urls, url: urls[0], slug: candidate.slug, matched: candidate.title });
        }
      }
    } catch { /* next */ }
  }

  return NextResponse.json({ error: "Stream not available" }, { status: 404 });
}

