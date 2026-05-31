export default function AnimeLoading() {
  return (
    <div className="min-h-screen bg-[#0d0d14]">

      {/* Hero banner */}
      <div className="skeleton h-[480px] md:h-[560px] w-full" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-20 md:-mt-24 relative z-10">

        {/* Poster + info row */}
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8">

          {/* Poster + buttons */}
          <div className="shrink-0 w-36 sm:w-44 md:w-52 flex flex-col gap-3">
            <div className="skeleton w-full aspect-[2/3] rounded-xl" />
            <div className="skeleton h-11 w-full rounded-xl" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-4 space-y-4">
            <div className="skeleton h-9 w-3/4 rounded-lg" />
            <div className="skeleton h-4 w-40 rounded" />
            <div className="flex gap-2 flex-wrap">
              <div className="skeleton h-6 w-28 rounded-full" />
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="skeleton h-10 w-32 rounded-xl" />
              <div className="skeleton h-8 w-20 rounded-xl" />
              <div className="skeleton h-8 w-28 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Details strip */}
        <div className="mt-8 flex gap-px rounded-2xl overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton flex-1 h-16 rounded-none first:rounded-l-2xl last:rounded-r-2xl" />
          ))}
        </div>

        {/* Synopsis + Details cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <div className="lg:col-span-2 skeleton rounded-2xl h-52" />
          <div className="skeleton rounded-2xl h-52" />
        </div>

        {/* Recommendations */}
        <div className="mt-12 mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="skeleton w-1 h-6 rounded-full" />
            <div className="skeleton h-6 w-44 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-[#1a1a2e] border border-white/5">
                <div className="skeleton aspect-[2/3] w-full" />
                <div className="p-2.5 space-y-2">
                  <div className="skeleton h-3.5 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
