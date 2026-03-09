import SectionLoader from '@/components/ui/SectionLoader'

export default function StudentLoading() {
  return (
    <div className="space-y-6">
      <SectionLoader type="cards" rows={4} />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        <SectionLoader type="list" rows={4} />
      </div>
    </div>
  )
}
