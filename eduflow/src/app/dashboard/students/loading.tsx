import { TableRowSkeleton } from '@/components/ui/skeleton-cards'

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white">
        <TableRowSkeleton rows={8} />
      </div>
    </div>
  )
}
