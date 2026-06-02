export const revalidate = 3600;

import Image from "next/image";
import Link from "next/link";
import { Star, Play, ChevronLeft, Users, BarChart2, Tv, BookOpen, Info, Layers, Clock, Calendar, Building2, ShieldCheck, Hash } from "lucide-react";
import AnimeGrid from "@/components/anime/AnimeGrid";
import SectionHeader from "@/components/anime/SectionHeader";
import { getAnimeById, getAnimeRecommendations } from "@/lib/api";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const { data } = await getAnimeById(Number(id));
    const title = data.title_english || data.title;
    const description = (data.synopsis?.replace(/\[Written by MAL Rewrite\]/g, "").trim() ?? `Watch ${title} online free in HD on Aniwatsu.`).slice(0, 155);
    const image = data.images?.jpg?.large_image_url ?? data.images?.jpg?.image_url;
    const url = `https://aniwatsu.com/anime/${id}`;
    return {
      title: `${title} – Watch Online Free`,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "video.tv_show",
        title: `${title} – Watch Online Free | Aniwatsu`,
        description,
        url,
        siteName: "Aniwatsu",
        images: image ? [{ url: image, width: 225, height: 320, alt: title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} – Watch Online Free`,
        description,
        images: image ? [image] : [],
      },
    };
  } catch {
    return { title: "Anime" };
  }
}

export default async function AnimePage({ params }: Props) {
  const { id } = await params;
  const [{ data: anime }, recs] = await Promise.all([
    getAnimeById(Number(id)),
    getAnimeRecommendations(Number(id)).catch(() => []),
  ]);

  const title = anime.title_english || anime.title;
  const img = anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url;
  const imgThumb = anime.images?.webp?.image_url ?? anime.images?.jpg?.image_url;
  const synopsis = anime.synopsis?.replace(/\[Written by MAL Rewrite\]/g, "").trim();

  const infoRows = [
    { icon: <Tv size={11} />,           label: "Type",      value: anime.type },
    { icon: <Layers size={11} />,       label: "Episodes",  value: anime.episodes ? String(anime.episodes) : null },
    { icon: <Clock size={11} />,        label: "Duration",  value: anime.duration?.replace("per ep", "/ ep") },
    { icon: <Hash size={11} />,         label: "Status",    value: anime.status },
    { icon: <Calendar size={11} />,     label: "Season",    value: anime.season && anime.year ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : null },
    { icon: <Building2 size={11} />,    label: "Studio",    value: anime.studios?.map(s => s.name).join(", ") || null },
    { icon: <ShieldCheck size={11} />,  label: "Rating",    value: anime.rating },
    { icon: <Users size={11} />,        label: "Members",   value: anime.members?.toLocaleString() },
  ].filter(r => r.value) as { icon: React.ReactNode; label: string; value: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": anime.type === "Movie" ? "Movie" : "TVSeries",
    name: title,
    alternateName: anime.title !== title ? anime.title : undefined,
    description: synopsis,
    image: img,
    url: `https://aniwatsu.com/anime/${id}`,
    aggregateRating: anime.score ? {
      "@type": "AggregateRating",
      ratingValue: anime.score,
      bestRating: 10,
      ratingCount: anime.scored_by,
    } : undefined,
    genre: anime.genres?.map((g) => g.name),
    numberOfEpisodes: anime.episodes ?? undefined,
    startDate: anime.year ? String(anime.year) : undefined,
  };

  return (
    <main className="min-h-screen bg-[#0d0d14]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ══════════════════════════════════════
          HERO — full cinematic image, no blur
          Info overlaid on the dark left side
      ══════════════════════════════════════ */}
      <div className="relative h-[480px] md:h-[560px] overflow-hidden">

        {/* Ambient layer — blurred, saturated, fills the whole hero with colour */}
        {img && (
          <Image src={img} alt="" fill priority aria-hidden
            className="object-cover object-top scale-125"
            style={{ filter: 'blur(22px) brightness(0.45) saturate(1.4)' }}
            sizes="100vw"
            quality={60}
          />
        )}

        {/* Sharp layer — right half, cinematic vignette mask on all edges */}
        {img && (
          <div
            className="absolute right-0 top-0 bottom-0 w-[50%]"
            style={{
              maskImage: `radial-gradient(ellipse 88% 90% at 65% 36%,
                black 0%,
                black 18%,
                rgba(0,0,0,0.85) 38%,
                rgba(0,0,0,0.25) 58%,
                transparent 72%)`,
              WebkitMaskImage: `radial-gradient(ellipse 88% 90% at 65% 36%,
                black 0%,
                black 18%,
                rgba(0,0,0,0.85) 38%,
                rgba(0,0,0,0.25) 58%,
                transparent 72%)`,
            }}
          >
            <Image src={img} alt={title} fill priority
              className="object-cover"
              style={{ objectPosition: '50% 33%' }}
              sizes="50vw"
              quality={100}
            />
          </div>
        )}

        {/* Left-side text gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14] from-25% via-[#0d0d14]/50 via-50% to-transparent" />
        {/* Bottom page-blend gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/10 to-[#0d0d14]/30" />

        {/* Overlaid content — left-aligned on the dark gradient */}
        <div className="absolute inset-0 flex flex-col justify-between max-w-6xl mx-auto px-4 md:px-6 py-6 w-full left-0 right-0">

          {/* Back */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mt-14 w-fit">
            <ChevronLeft size={15} /> Back to home
          </Link>

          {/* Bottom info block */}
          <div className="max-w-xl pb-4 overflow-hidden">

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {anime.status && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  anime.status === "Currently Airing"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-white/10 text-slate-300 border-white/15"
                }`}>{anime.status}</span>
              )}
              {anime.type && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {anime.type}
                </span>
              )}
              {anime.season && anime.year && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15 capitalize">
                  {anime.season} {anime.year}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-1 drop-shadow-lg">
              {title}
            </h1>
            {anime.title !== title && (
              <p className="text-white/40 text-sm mb-3">{anime.title}</p>
            )}

            {/* Score row */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {anime.score && (
                <div className="flex items-center gap-1.5">
                  <Star size={18} className="text-yellow-400" fill="currentColor" />
                  <span className="text-2xl font-black text-white">{anime.score.toFixed(2)}</span>
                  {anime.scored_by && (
                    <span className="text-white/40 text-xs">{(anime.scored_by / 1000).toFixed(0)}k</span>
                  )}
                </div>
              )}
              {anime.rank && (
                <div className="flex items-center gap-1 text-sm text-white/60">
                  <BarChart2 size={13} />
                  <span>Rank <span className="text-white font-bold">#{anime.rank}</span></span>
                </div>
              )}
              {anime.popularity && (
                <div className="flex items-center gap-1 text-sm text-white/60">
                  <Users size={13} />
                  <span>Popularity <span className="text-white font-bold">#{anime.popularity}</span></span>
                </div>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5 max-w-full">
                {anime.genres.map((g) => (
                  <Link key={g.mal_id} href={`/browse?genre=${g.mal_id}`}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/70 hover:bg-violet-500/30 hover:text-violet-200 border border-white/10 transition-all whitespace-nowrap">
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CONTENT — poster + synopsis + details
      ══════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Poster + main content */}
        <div className="flex flex-col md:flex-row gap-6 -mt-20 md:-mt-24 relative z-10">

          {/* Poster + actions */}
          <div className="shrink-0 w-36 sm:w-44 md:w-52 flex flex-col gap-3">
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/80">
              {img
                ? <Image src={img} alt={title} fill className="object-cover" sizes="208px" quality={100} />
                : <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center"><Tv size={36} className="text-slate-600" /></div>
              }
            </div>
            <Link href={`/watch/${anime.mal_id}`}
              className="relative flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors glow">
              <Play size={17} fill="white" />
              Watch Now
            </Link>
            {anime.trailer?.youtube_id && (
              <a href={`https://youtube.com/watch?v=${anime.trailer.youtube_id}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold py-3 rounded-xl text-sm transition-all">
                <Play size={17} />
                Trailer
              </a>
            )}
          </div>

          {/* Synopsis + Details */}
          <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Synopsis */}
            {synopsis && (
              <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#13131f] p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70 mb-3 flex items-center gap-1.5"><BookOpen size={11} /> Synopsis</p>
                <p className="text-slate-300 text-sm leading-[1.85] line-clamp-[10]">{synopsis}</p>
              </div>
            )}

            {/* Details */}
            <div className="rounded-2xl border border-white/5 bg-[#13131f] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70 flex items-center gap-1.5"><Info size={11} /> Details</p>
              </div>
              <dl className="divide-y divide-white/[0.04]">
                {infoRows.map((r) => (
                  <div key={r.label} className="flex items-start justify-between gap-3 px-5 py-3">
                    <dt className="flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0 pt-px">
                      <span className="text-slate-600">{r.icon}</span>
                      {r.label}
                    </dt>
                    <dd className="text-[11px] text-slate-200 font-semibold text-right leading-snug">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            RECOMMENDATIONS
        ══════════════════════════════════════ */}
        {recs.length > 0 && (
          <section className="mt-12 mb-16">
            <SectionHeader title="You Might Also Like" />
            <AnimeGrid anime={recs} />
          </section>
        )}
      </div>

    </main>
  );
}
