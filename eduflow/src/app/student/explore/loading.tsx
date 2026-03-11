import { ClubCardSkeleton } from 
  '@/components/shared/Skeleton'

export default function ExploreLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse w-48 h-7 
                     bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-1 
                     sm:grid-cols-2 
                     lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <ClubCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
