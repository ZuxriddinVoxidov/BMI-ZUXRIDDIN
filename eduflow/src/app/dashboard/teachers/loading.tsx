import { TableRowSkeleton } from 
  '@/components/shared/Skeleton'

export default function TeachersLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse w-48 h-7 
                     bg-gray-200 rounded-xl" />
      <div className="bg-white rounded-2xl 
                     border border-gray-100 
                     shadow-sm">
        {[1,2,3,4,5,6,7,8].map(i => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
