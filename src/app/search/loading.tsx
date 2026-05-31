export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-2">
        <div className="skeleton h-7 w-64 rounded-lg" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
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
