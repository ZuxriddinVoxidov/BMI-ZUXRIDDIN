import { 
  StatCardSkeleton, 
  TableRowSkeleton,
  TopStudentsSkeleton
} from '@/components/shared/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-indigo-600 
                     to-cyan-500 rounded-2xl p-6">
        <div className="animate-pulse space-y-2">
          <div className="w-48 h-7 bg-white/30 
                         rounded-xl" />
          <div className="w-64 h-4 bg-white/20 
                         rounded-xl" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 
                     lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Bottom 3 columns */}
      <div className="grid grid-cols-1 
                     lg:grid-cols-3 gap-6">
        {/* Applications */}
        <div className="bg-white rounded-2xl 
                       border border-gray-100 
                       shadow-sm">
          <div className="p-4 border-b 
                         border-gray-100">
            <div className="w-36 h-5 bg-gray-200 
                           rounded animate-pulse" />
          </div>
          {[1,2,3].map(i => (
            <TableRowSkeleton key={i} />
          ))}
        </div>

        {/* Clubs */}
        <div className="bg-white rounded-2xl 
                       border border-gray-100 
                       shadow-sm">
          <div className="p-4 border-b 
                         border-gray-100">
            <div className="w-28 h-5 bg-gray-200 
                           rounded animate-pulse" />
          </div>
          {[1,2,3].map(i => (
            <TableRowSkeleton key={i} />
          ))}
        </div>

        {/* Top students */}
        <div className="bg-white rounded-2xl 
                       border border-gray-100 
                       shadow-sm p-4">
          <div className="w-36 h-5 bg-gray-200 
                         rounded animate-pulse 
                         mb-4" />
          <TopStudentsSkeleton />
        </div>
      </div>
    </div>
  )
}
