'use client'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-8">
      <div className="text-6xl">😕</div>
      <h2 className="text-2xl font-bold text-gray-800">Xatolik yuz berdi</h2>
      <p className="text-gray-500 max-w-md">
        Sahifani yuklashda muammo bo&apos;ldi. Qayta urinib ko&apos;ring.
      </p>
      <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700">
        🔄 Qayta urinish
      </Button>
    </div>
  )
}
