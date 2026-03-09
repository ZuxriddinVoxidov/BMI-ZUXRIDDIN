'use client'

import { updateStudentGrade } from '@/app/actions/profile'
import { GRADES } from '@/lib/utils'
import { useState, useTransition } from 'react'

export default function GradeSelector({ currentGrade }: { currentGrade?: string }) {
  const [grade, setGrade] = useState(currentGrade || '')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleChange = (value: string) => {
    setGrade(value)
    setSaved(false)
    startTransition(async () => {
      await updateStudentGrade(value)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">📚 Sinf:</span>
        <select
          value={grade}
          onChange={e => handleChange(e.target.value)}
          disabled={isPending}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 disabled:opacity-50"
        >
          <option value="">Sinfni tanlang</option>
          {GRADES.map(g => (
            <option key={g} value={g}>{g}-sinf</option>
          ))}
        </select>
        {isPending && <span className="text-xs text-gray-400">Saqlanmoqda...</span>}
        {saved && <span className="text-xs text-emerald-500">✅ Saqlandi</span>}
      </div>

      {!grade && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <span>⚠️</span>
          <p className="text-xs text-amber-800">
            Sinfingizni belgilang — katalogda sinfingizga mos to&apos;garaklar ko&apos;rinadi
          </p>
        </div>
      )}
    </div>
  )
}
