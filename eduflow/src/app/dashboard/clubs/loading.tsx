import { ClubCardSkeleton } from '@/components/ui/skeleton-cards'

export default function ClubsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ClubCardSkeleton count={6} />
      </div>
    </div>
  )
}
