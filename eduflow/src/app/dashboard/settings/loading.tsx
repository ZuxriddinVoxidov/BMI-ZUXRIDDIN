import { ProfileCardSkeleton } from 
  '@/components/shared/Skeleton'

export default function SettingsLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse w-48 h-7 
                     bg-gray-200 rounded-xl mb-6" />
      <ProfileCardSkeleton />
    </div>
  )
}
