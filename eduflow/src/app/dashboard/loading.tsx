import CardSkeleton from '@/components/ui/CardSkeleton'
import TableSkeleton from '@/components/ui/TableSkeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-52 bg-gray-200 rounded-xl animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100">
        <TableSkeleton rows={6} cols={5} />
      </div>
    </div>
  )
}
