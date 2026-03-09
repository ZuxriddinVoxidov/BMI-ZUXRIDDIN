import TableSkeleton from '@/components/ui/TableSkeleton'

export default function TeachersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-gray-200 rounded-xl animate-pulse" />
      <div className="bg-white rounded-2xl border border-gray-100">
        <TableSkeleton rows={5} cols={6} />
      </div>
    </div>
  )
}
