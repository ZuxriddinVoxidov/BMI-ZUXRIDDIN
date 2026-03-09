'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-black text-xl">E</div>
          <div className="absolute -inset-2 rounded-full border-[3px] border-indigo-200 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-xs text-gray-400 font-medium animate-pulse">Yuklanmoqda...</p>
      </div>
    </div>
  )
}
