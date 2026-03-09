import SectionLoader from '@/components/ui/SectionLoader'

export default function StudentsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-gray-200 rounded-xl animate-pulse" />
      <SectionLoader type="table" rows={6} cols={7} />
    </div>
  )
}
