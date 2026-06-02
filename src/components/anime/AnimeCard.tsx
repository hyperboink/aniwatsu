import Link from "next/link";
import Image from "next/image";
import { Star, Tv, Play } from "lucide-react";
import type { Anime } from "@/lib/api";

type Props = {
  anime: Anime;
  rank?: number;
};

export default function AnimeCard({ anime, rank }: Props) {
  const title = anime.title_english || anime.title;
  const img = anime.images?.webp?.large_image_url ?? anime.images?.webp?.image_url
           ?? anime.images?.jpg?.large_image_url ?? anime.images?.jpg?.image_url;
  const genres = anime.genres?.slice(0, 3) ?? [];

  return (
    <Link href={`/anime/${anime.mal_id}`} className="group block" prefetch={false}>
      <div className="card-hover relative rounded-xl overflow-hidden bg-[var(--bg-card)] border border-white/5 flex flex-col">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden shrink-0">
          {img ? (
            <Image
              src={img}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
              quality={90}
            />
          ) : (
            <div className="w-full h-full bg-[#22223a] flex items-center justify-center">
              <Tv size={32} className="text-slate-600" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Play button on hover */}
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-violet-600/90 backdrop-blur-sm flex items-center justify-center glow">
              <Play size={20} className="text-white ml-0.5" fill="white" />
            </div>
          </div>

          {/* Rank badge */}
          {rank && (
            <div className="absolute top-2 left-2 w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
              {rank}
            </div>
          )}

          {/* Score badge */}
          {anime.score && (
            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
              <Star size={10} className="text-yellow-400" fill="currentColor" />
              <span className="text-xs font-semibold text-white">{anime.score.toFixed(1)}</span>
            </div>
          )}

          {/* Type badge */}
          {anime.type && (
            <div className="absolute bottom-2 left-2 text-xs bg-violet-600/80 backdrop-blur-sm text-white rounded px-1.5 py-0.5 font-medium">
              {anime.type}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5 flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-violet-300 transition-colors">
            {title}
          </h3>

          {/* Year · Episodes */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {anime.year && <span>{anime.year}</span>}
            {anime.episodes && (
              <>
                <span>·</span>
                <span>{anime.episodes} eps</span>
              </>
            )}
          </div>

          {/* Genre tags */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.map((g) => (
                <span
                  key={g.mal_id}
                  className="text-[10px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded px-1.5 py-0.5 leading-none"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
