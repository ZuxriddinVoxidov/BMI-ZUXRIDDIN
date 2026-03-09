import SectionLoader from '@/components/ui/SectionLoader'

export default function TeachersLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-gray-200 rounded-xl animate-pulse" />
      <SectionLoader type="table" rows={5} cols={6} />
    </div>
  )
}
