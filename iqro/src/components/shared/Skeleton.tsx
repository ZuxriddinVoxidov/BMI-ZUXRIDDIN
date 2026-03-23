export function SkeletonBox({ 
  className = '' 
}: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 
                    rounded-xl ${className}`} />
  )
}

// Stat card skeleton (for KPI cards)
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 
                   border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center 
                     justify-between mb-4">
        <SkeletonBox className="w-12 h-12 
                               rounded-xl" />
        <SkeletonBox className="w-16 h-5 
                               rounded-full" />
      </div>
      <SkeletonBox className="w-16 h-8 mb-2" />
      <SkeletonBox className="w-32 h-4" />
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 
                   p-4 border-b border-gray-50 dark:border-gray-800">
      <SkeletonBox className="w-10 h-10 
                             rounded-full 
                             flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="w-40 h-4" />
        <SkeletonBox className="w-24 h-3" />
      </div>
      <SkeletonBox className="w-20 h-6 
                             rounded-full" />
    </div>
  )
}

// Club card skeleton
export function ClubCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl 
                   border border-gray-100 dark:border-gray-800
                   shadow-sm overflow-hidden">
      <SkeletonBox className="w-full h-40 
                             rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="w-3/4 h-5" />
        <SkeletonBox className="w-1/2 h-4" />
        <div className="flex gap-2">
          <SkeletonBox className="w-16 h-6 
                                 rounded-full" />
          <SkeletonBox className="w-20 h-6 
                                 rounded-full" />
        </div>
        <SkeletonBox className="w-full h-10 
                               rounded-xl mt-2" />
      </div>
    </div>
  )
}

// Top students skeleton
export function TopStudentsSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} 
          className="flex items-center gap-3 p-3">
          <SkeletonBox className="w-8 h-8 
                                 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBox className="w-32 h-4" />
            <SkeletonBox className="w-16 h-3" />
          </div>
          <SkeletonBox className="w-14 h-4" />
        </div>
      ))}
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 
                   border border-gray-100 dark:border-gray-800 shadow-sm">
      <SkeletonBox className="w-40 h-5 mb-6" />
      <div className="flex items-end gap-3 h-40">
        {[60,80,45,90,70,55,85].map((h, i) => (
          <div key={i} 
            className="flex-1 bg-gray-200 dark:bg-gray-800
                      rounded-t-lg animate-pulse"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex gap-3 mt-3">
        {[1,2,3,4,5,6,7].map(i => (
          <SkeletonBox key={i} 
            className="flex-1 h-3" />
        ))}
      </div>
    </div>
  )
}

// Attendance skeleton
export function AttendanceSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl 
                   border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <SkeletonBox className="w-48 h-5" />
      </div>
      {[1,2,3,4,5].map(i => (
        <div key={i} 
          className="flex items-center gap-4 
                    p-4 border-b border-gray-50 dark:border-gray-800">
          <SkeletonBox className="w-10 h-10 
                                 rounded-full" />
          <SkeletonBox className="flex-1 h-4" />
          <SkeletonBox className="w-20 h-8 
                                 rounded-xl" />
          <SkeletonBox className="w-20 h-8 
                                 rounded-xl" />
          <SkeletonBox className="w-20 h-8 
                                 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

// Profile card skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl 
                   border border-gray-100 dark:border-gray-800
                   shadow-sm overflow-hidden">
      <SkeletonBox className="w-full h-32 
                             rounded-none" />
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 
                       -mt-8 mb-4">
          <SkeletonBox className="w-16 h-16 
                                 rounded-2xl 
                                 border-4 border-white dark:border-gray-900" />
          <div className="pb-1 space-y-2">
            <SkeletonBox className="w-40 h-5" />
            <SkeletonBox className="w-24 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} 
                className="flex justify-between py-2 
                          border-b border-gray-100 dark:border-gray-800">
                <SkeletonBox className="w-20 h-4" />
                <SkeletonBox className="w-28 h-4" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} 
                className="flex justify-between py-2 
                          border-b border-gray-100 dark:border-gray-800">
                <SkeletonBox className="w-16 h-4" />
                <SkeletonBox className="w-32 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
