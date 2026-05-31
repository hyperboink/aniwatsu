import { Flame, Star, Clock, TrendingUp } from "lucide-react";
import HeroCarousel from "@/components/anime/HeroCarousel";
import AnimeGrid from "@/components/anime/AnimeGrid";
import SectionHeader from "@/components/anime/SectionHeader";
import { getCurrentSeasonAnime, getTopAnime } from "@/lib/api";

export const revalidate = 3600;

async function safeGetTopAnime(filter: string) {
  try { return await getTopAnime(filter); } catch { return { data: [] }; }
}
async function safeGetSeason() {
  try { return await getCurrentSeasonAnime(); } catch { return { data: [] }; }
}

export default async function Home() {
  const [seasonData, popularData, topData, upcomingData] = await Promise.all([
    safeGetSeason(),
    safeGetTopAnime("bypopularity"),
    safeGetTopAnime("favorite"),
    safeGetTopAnime("upcoming"),
  ]);

  const heroSource = seasonData.data.length > 0 ? seasonData.data : popularData.data;
  const heroItems = heroSource
    .filter((a) => a.score && a.score >= 7 && a.images?.jpg?.large_image_url)
    .slice(0, 8);

  return (
    <main>
      <HeroCarousel items={heroItems} />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">
        {seasonData.data.length > 0 && (
          <section className="fade-in">
            <SectionHeader
              title="Currently Airing"
              icon={<Clock size={18} />}
              href="/browse?filter=airing"
            />
            <AnimeGrid anime={seasonData.data.slice(0, 12)} />
          </section>
        )}

        {popularData.data.length > 0 && (
          <section className="fade-in">
            <SectionHeader
              title="Most Popular"
              icon={<TrendingUp size={18} />}
              href="/browse?filter=bypopularity"
            />
            <AnimeGrid anime={popularData.data.slice(0, 12)} />
          </section>
        )}

        {topData.data.length > 0 && (
          <section className="fade-in">
            <SectionHeader
              title="Top Rated All Time"
              icon={<Star size={18} />}
              href="/browse?filter=favorite"
            />
            <AnimeGrid anime={topData.data.slice(0, 12)} showRank />
          </section>
        )}

        {upcomingData.data.length > 0 && (
          <section className="fade-in">
            <SectionHeader
              title="Upcoming Anime"
              icon={<Flame size={18} />}
              href="/browse?filter=upcoming"
            />
            <AnimeGrid anime={upcomingData.data.slice(0, 12)} />
          </section>
        )}
      </div>
    </main>
  );
}
