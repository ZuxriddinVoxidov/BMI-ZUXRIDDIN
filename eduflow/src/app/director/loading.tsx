import { 
  StatCardSkeleton, 
  ChartSkeleton 
} from '@/components/shared/Skeleton'

export default function DirectorLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse w-48 h-7 
                     bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-2 
                     lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 
                     lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}
