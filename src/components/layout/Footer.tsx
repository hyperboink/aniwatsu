import Link from "next/link";
import { Tv, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer aria-label="Site footer" className="border-t border-white/5 bg-[#0d0d14] mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" aria-label="Aniwatsu home" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center" aria-hidden="true">
                <Tv size={14} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Ani<span className="text-violet-400">watsu</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Your go-to destination for streaming the latest anime series and movies. Updated daily with new episodes.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Browse</h4>
            <ul className="space-y-2">
              {[
                { label: "Currently Airing", href: "/browse?filter=airing" },
                { label: "Most Popular", href: "/browse?filter=bypopularity" },
                { label: "Top Rated", href: "/browse?filter=favorite" },
                { label: "Upcoming", href: "/browse?filter=upcoming" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-500 hover:text-violet-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Genres</h4>
            <ul className="space-y-2">
              {[
                { label: "Action", href: "/browse?genre=1" },
                { label: "Romance", href: "/browse?genre=22" },
                { label: "Fantasy", href: "/browse?genre=10" },
                { label: "Sci-Fi", href: "/browse?genre=24" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-500 hover:text-violet-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2025 Aniwatsu
          </p>
        </div>
      </div>
    </footer>
  );
}
