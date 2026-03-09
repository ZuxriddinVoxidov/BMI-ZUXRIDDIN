import SectionLoader from '@/components/ui/SectionLoader'

export default function TeacherLoading() {
  return (
    <div className="space-y-6">
      <SectionLoader type="cards" rows={4} />
      <SectionLoader type="table" rows={5} cols={4} />
    </div>
  )
}
