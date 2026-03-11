import { AttendanceSkeleton } from 
  '@/components/shared/Skeleton'

export default function AttendanceLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse w-40 h-7 
                     bg-gray-200 rounded-xl" />
      <AttendanceSkeleton />
    </div>
  )
}
