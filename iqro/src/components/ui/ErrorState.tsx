export default function ErrorState({ message = "Ma'lumotlarni yuklashda xatolik", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-600 mb-2">Xatolik yuz berdi</h3>
      <p className="text-gray-400 text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 border border-red-200 transition-colors">
          🔄 Qayta urinish
        </button>
      )}
    </div>
  )
}
