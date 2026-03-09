import { StatCardSkeleton, TableRowSkeleton } from '@/components/ui/skeleton-cards'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="rounded-2xl border bg-white">
        <TableRowSkeleton rows={5} />
      </div>
    </div>
  )
}
