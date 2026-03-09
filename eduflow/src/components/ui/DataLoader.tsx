'use client'
import { useEffect, useState } from 'react'

interface DataLoaderProps {
  loading: boolean
  children: React.ReactNode
  className?: string
  minHeight?: string
}

export default function DataLoader({ loading, children, className = '', minHeight = 'min-h-[200px]' }: DataLoaderProps) {
  const [visible, setVisible] = useState(loading)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (loading) {
      setVisible(true)
      setFading(false)
    } else {
      setFading(true)
      const timer = setTimeout(() => { setVisible(false); setFading(false) }, 400)
      return () => clearTimeout(timer)
    }
  }, [loading])

  return (
    <div className={`relative ${minHeight} ${className}`}>
      <div style={{ opacity: visible ? 0 : 1, transition: 'opacity 0.4s ease-in' }}>
        {children}
      </div>
      {visible && (
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{
            backdropFilter: fading ? 'blur(0px)' : 'blur(4px)',
            backgroundColor: fading ? 'rgba(248,250,252,0)' : 'rgba(248,250,252,0.8)',
            transition: fading ? 'all 0.4s ease-out' : 'none',
          }}
        >
          {!fading && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-500"
                    style={{ animation: 'dataloader-bounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span className="text-xs text-gray-400 font-medium">Yuklanmoqda...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
