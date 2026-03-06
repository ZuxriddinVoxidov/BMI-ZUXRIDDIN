export default function StudentWorksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Mening Ishlarim</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-[120px] h-[120px] bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">📁</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Hali hech qanday ish yuklanmagan
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          To&apos;garakdagi ishlaringizni bu yerga yuklang va o&apos;z yutuqlaringizni saqlang
        </p>
      </div>
    </div>
  )
}
