import AnimeCard from "@/components/anime/AnimeCard";
import type { Anime } from "@/lib/api";

type Props = {
  anime: Anime[];
  showRank?: boolean;
};

export default function AnimeGrid({ anime, showRank }: Props) {
  // Jikan API sometimes returns duplicate mal_ids — deduplicate before rendering
  const seen = new Set<number>();
  const unique = anime.filter((a) => {
    if (seen.has(a.mal_id)) return false;
    seen.add(a.mal_id);
    return true;
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {unique.map((a, i) => (
        <AnimeCard key={a.mal_id} anime={a} rank={showRank ? i + 1 : undefined} priority={i < 2} />
      ))}
    </div>
  );
}
