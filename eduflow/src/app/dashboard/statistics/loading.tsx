export default function StatisticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="space-y-2"><div className="w-16 h-6 bg-gray-200 rounded" /><div className="w-24 h-4 bg-gray-100 rounded" /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-72 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        <div className="h-72 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      </div>
    </div>
  )
}
