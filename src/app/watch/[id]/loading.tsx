export default function WatchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">

      {/* Back breadcrumb */}
      <div className="skeleton h-4 w-48 rounded mb-4" />

      <div className="flex flex-col xl:flex-row gap-5">

        {/* Left: player + controls */}
        <div className="flex-1 min-w-0">

          {/* Server tabs */}
          <div className="flex items-center gap-2 mb-2">
            <div className="skeleton h-4 w-16 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-7 w-20 rounded-lg" />
            ))}
            <div className="ml-auto skeleton h-7 w-16 rounded-lg" />
          </div>

          {/* Video player */}
          <div className="skeleton aspect-video w-full rounded-xl" />

          {/* Prev / title / Next */}
          <div className="flex items-center gap-3 mt-3 mb-4">
            <div className="skeleton h-9 w-20 rounded-lg shrink-0" />
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-3.5 w-24 rounded" />
            </div>
            <div className="skeleton h-9 w-20 rounded-lg shrink-0" />
          </div>

          {/* Anime info strip */}
          <div className="bg-[#13131f] rounded-xl border border-white/5 p-4 flex gap-4">
            <div className="skeleton w-14 h-20 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="flex gap-2">
                <div className="skeleton h-5 w-24 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-14 rounded-full" />
              </div>
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-3/4 rounded" />
              <div className="flex gap-1.5 mt-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-5 w-16 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: episode list */}
        <div className="xl:w-72 shrink-0">
          <div className="bg-[#13131f] rounded-xl border border-white/5 overflow-hidden" style={{ maxHeight: "min(640px, 80vh)" }}>
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
              <div className="skeleton h-8 w-full rounded-lg" />
            </div>
            {/* Episode rows */}
            <div className="py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="skeleton w-7 h-7 rounded-lg shrink-0" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
