export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="h-24 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
