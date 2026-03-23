export default function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded-full" />
      </div>
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  )
}
