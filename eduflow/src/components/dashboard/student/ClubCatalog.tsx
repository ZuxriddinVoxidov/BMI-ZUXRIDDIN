'use client'

import { applyToClub } from '@/app/actions/enrollment'
import { Search } from 'lucide-react'
import { useState, useTransition } from 'react'

const categories = [
  { key: 'all', label: 'Barchasi' },
  { key: 'Texnologiya', label: '💻 Texnologiya' },
  { key: 'Sport', label: '⚽ Sport' },
  { key: "San'at", label: "🎨 San'at" },
  { key: 'Fan', label: '🔬 Fan' },
  { key: 'Til', label: '📚 Til' },
  { key: 'Musiqa', label: '🎵 Musiqa' },
  { key: 'Boshqa', label: '⭐ Boshqa' },
]

const categoryColors: Record<string, string> = {
  Texnologiya: 'bg-blue-100 text-blue-700',
  Sport: 'bg-rose-100 text-rose-700',
  "San'at": 'bg-purple-100 text-purple-700',
  Fan: 'bg-emerald-100 text-emerald-700',
  Til: 'bg-amber-100 text-amber-700',
  Musiqa: 'bg-pink-100 text-pink-700',
  Boshqa: 'bg-gray-100 text-gray-700',
}

interface ClubCatalogProps {
  clubs: Record<string, unknown>[]
  myEnrollments: Record<string, unknown>[]
}

export default function ClubCatalog({ clubs, myEnrollments }: ClubCatalogProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [isPending, startTransition] = useTransition()
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [localEnrollments, setLocalEnrollments] = useState(myEnrollments)

  const getEnrollmentStatus = (clubId: string) => {
    const enrollment = localEnrollments.find((e) => e.club_id === clubId)
    return enrollment?.status as string | undefined
  }

  const filteredClubs = clubs.filter((club) => {
    const matchesCategory =
      activeCategory === 'all' || (club.category as string) === activeCategory
    const matchesSearch =
      (club.name as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((club.teacher as Record<string, unknown>)?.full_name as string)?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice =
      priceFilter === 'all' ? true :
      priceFilter === 'free' ? !club.is_paid :
      Boolean(club.is_paid)
    return matchesCategory && matchesSearch && matchesPrice
  })

  const handleApply = async (clubId: string) => {
    setApplyingId(clubId)
    startTransition(async () => {
      const result = await applyToClub(clubId)
      if (result.success) {
        setLocalEnrollments([...localEnrollments, { club_id: clubId, status: 'pending' }])
        setToast({ message: "Ariza muvaffaqiyatli yuborildi! Admin tasdiqlashini kuting.", type: 'success' })
      } else {
        setToast({ message: result.error || 'Xatolik yuz berdi', type: 'error' })
      }
      setApplyingId(null)
      setTimeout(() => setToast(null), 4000)
    })
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Search + Price Filter */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="To'garak qidiring..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { key: 'all', label: 'Hammasi' },
            { key: 'free', label: '🆓 Bepul' },
            { key: 'paid', label: '💳 Pulli' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setPriceFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                priceFilter === f.key
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">{filteredClubs.length} ta to&apos;garak topildi</p>

      {/* Club Cards Grid */}
      {filteredClubs.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredClubs.map((club) => {
            const teacher = club.teacher as Record<string, unknown> | null
            const status = getEnrollmentStatus(club.id as string)
            const maxStudents = (club.max_students as number) || 30
            const enrolledCount = (club.enrolled_count as number) || 0
            const progressPct = Math.min(Math.round((enrolledCount / maxStudents) * 100), 100)
            const targetGrades = club.target_grades as string[] | null

            return (
              <div
                key={club.id as string}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Category Badge */}
                  {Boolean(club.category) && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                        categoryColors[club.category as string] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {String(club.category)}
                    </span>
                  )}

                  {/* Club Name */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{club.name as string}</h3>

                  {/* Price & Grade badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {club.is_paid ? (
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                        💳 {(club.price as number)?.toLocaleString('uz-UZ')} so&apos;m/oy
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                        🆓 Bepul
                      </span>
                    )}
                    {targetGrades && targetGrades.length > 0 ? (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                        📚 {targetGrades.sort((a, b) => Number(a) - Number(b)).join(', ')}-sinf
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                        📚 Barcha sinflar
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {(club.description as string) || "Ta'rif mavjud emas"}
                  </p>

                  {/* Teacher */}
                  <p className="text-sm text-gray-500 mb-1">
                    O&apos;qituvchi:{' '}
                    <span className="font-medium text-gray-700">
                      {(teacher?.full_name as string) || 'Belgilanmagan'}
                    </span>
                  </p>

                  {/* Schedule */}
                  <p className="text-sm text-gray-500 mb-3">
                    📅 {(club.schedule as string) || 'Jadval belgilanmagan'}
                  </p>

                  {/* Students progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>O&apos;quvchilar</span>
                      <span>{enrolledCount}/{maxStudents}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  {!status && (
                    <button
                      onClick={() => handleApply(club.id as string)}
                      disabled={isPending && applyingId === (club.id as string)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isPending && applyingId === (club.id as string)
                        ? 'Yuborilmoqda...'
                        : 'Ariza yuborish'}
                    </button>
                  )}
                  {status === 'pending' && (
                    <div className="w-full py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold text-center">
                      ⏳ Ko&apos;rib chiqilmoqda
                    </div>
                  )}
                  {status === 'approved' && (
                    <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold text-center">
                      ✅ A&apos;zosiz
                    </div>
                  )}
                  {status === 'rejected' && (
                    <button
                      onClick={() => handleApply(club.id as string)}
                      disabled={isPending && applyingId === (club.id as string)}
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isPending && applyingId === (club.id as string)
                        ? 'Yuborilmoqda...'
                        : 'Qayta ariza yuborish'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-[100px] h-[100px] bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            To&apos;garaklar topilmadi
          </h2>
          <p className="text-gray-500 text-sm">
            Boshqa qidiruv so&apos;zi yoki kategoriyani sinab ko&apos;ring
          </p>
        </div>
      )}
    </>
  )
}
