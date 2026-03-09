
export default function ClubsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-44 bg-gray-200 rounded-xl animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
