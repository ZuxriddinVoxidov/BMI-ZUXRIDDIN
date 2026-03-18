'use client'

interface SectionLoaderProps {
  type?: 'table' | 'cards' | 'list'
  rows?: number
  cols?: number
}

export default function SectionLoader({ type = 'table', rows = 5, cols = 5 }: SectionLoaderProps) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse space-y-3">
            <div className="flex justify-between">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="w-14 h-5 bg-gray-100 rounded-full" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-lg" />
            <div className="w-32 h-3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="w-16 h-6 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  // table
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="grid gap-4 px-6 py-4 border-b bg-gray-50" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: i === 0 ? '80%' : '60%' }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid gap-4 px-6 py-4 border-b border-gray-50 last:border-0" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          </div>
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded animate-pulse self-center" style={{ width: `${50 + j * 10}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}
