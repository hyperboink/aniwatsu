export default function BrowseLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filter tabs skeleton */}
      <div className="flex items-center gap-2 flex-wrap mb-8 pb-4 border-b border-white/5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-28 rounded-lg" />
        ))}
      </div>

      {/* Genre pills skeleton */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="skeleton h-6 rounded-full" style={{ width: `${50 + (i % 5) * 18}px` }} />
        ))}
      </div>

      {/* Section header skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton w-1 h-6 rounded-full" />
        <div className="skeleton h-6 w-40 rounded-lg" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 24 }).map((_, i) => (
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
  );
}
