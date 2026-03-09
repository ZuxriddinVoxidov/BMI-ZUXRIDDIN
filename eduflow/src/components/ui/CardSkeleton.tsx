export default function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="w-16 h-6 bg-gray-100 rounded-full" />
      </div>
      <div className="w-20 h-8 bg-gray-200 rounded-lg mb-2" />
      <div className="w-32 h-4 bg-gray-100 rounded" />
    </div>
  )
}
