import SectionLoader from '@/components/ui/SectionLoader'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-52 bg-gray-200 rounded-xl animate-pulse" />
      <SectionLoader type="cards" rows={4} />
      <SectionLoader type="table" rows={5} cols={5} />
    </div>
  )
}
