import SectionLoader from '@/components/ui/SectionLoader'

export default function DirectorLoading() {
  return (
    <div className="space-y-6">
      <SectionLoader type="cards" rows={4} />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
      <SectionLoader type="table" rows={4} cols={4} />
    </div>
  )
}
