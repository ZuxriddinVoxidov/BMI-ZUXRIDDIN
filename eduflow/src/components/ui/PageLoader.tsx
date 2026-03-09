'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageLoader() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    setActive(true)
    setFading(false)
    const t1 = setTimeout(() => setFading(true), 350)
    const t2 = setTimeout(() => setActive(false), 750)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [pathname])

  if (!active) return null

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{
        backdropFilter: fading ? 'blur(0px)' : 'blur(8px)',
        backgroundColor: fading ? 'rgba(255,255,255,0)' : 'rgba(248,250,252,0.7)',
        transition: fading ? 'backdrop-filter 0.4s ease-out, background-color 0.4s ease-out' : 'none',
      }}
    >
      {!fading && (
        <div
          className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 via-blue-400 to-cyan-400 rounded-full"
          style={{ animation: 'eduflow-progress 0.5s ease-out forwards' }}
        />
      )}
    </div>
  )
}
