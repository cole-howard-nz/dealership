export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-28 rounded-lg mb-2" style={{ backgroundColor: "#E4E5E8" }} />
        <div className="h-4 w-44 rounded-md" style={{ backgroundColor: "#F3F4F6" }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "#E4E5E8" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="h-4 w-28 rounded" style={{ backgroundColor: "#F3F4F6" }} />
              <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: "#F3F4F6" }} />
            </div>
            <div className="h-8 w-12 rounded mb-3" style={{ backgroundColor: "#E4E5E8" }} />
            <div className="h-3 w-full rounded" style={{ backgroundColor: "#F3F4F6" }} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white shadow-sm" style={{ borderColor: "#E4E5E8" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#E4E5E8" }}>
          <div className="h-4 w-32 rounded" style={{ backgroundColor: "#E4E5E8" }} />
          <div className="h-3 w-12 rounded" style={{ backgroundColor: "#F3F4F6" }} />
        </div>
        <div className="px-5 divide-y" style={{ borderColor: "#E4E5E8" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <div className="mt-0.5 h-6 w-6 rounded-full shrink-0" style={{ backgroundColor: "#E4E5E8" }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded" style={{ backgroundColor: "#F3F4F6" }} />
                <div className="h-3 w-1/3 rounded" style={{ backgroundColor: "#F3F4F6" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
