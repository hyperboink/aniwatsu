export default function WatchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">

      {/* Breadcrumb row */}
      <div className="skeleton h-4 w-40 rounded mb-2" />

      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex-1 min-w-0">
          {/* Player */}
          <div className="skeleton aspect-video w-full rounded-xl" />

          {/* Toolbar */}
          <div className="h-9 mt-2 mb-1" />

          {/* Nav row */}
          <div className="flex items-center gap-3 mt-3 mb-4">
            <div className="skeleton h-9 w-20 rounded-lg shrink-0" />
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-3.5 w-24 rounded" />
            </div>
            <div className="skeleton h-9 w-20 rounded-lg shrink-0" />
          </div>

          {/* Info strip */}
          <div className="skeleton h-28 w-full rounded-xl" />
        </div>

        {/* Episode sidebar */}
        <div className="xl:w-72 shrink-0">
          <div className="skeleton rounded-xl" style={{ height: "min(640px, 80vh)" }} />
        </div>
      </div>
    </div>
  );
}
