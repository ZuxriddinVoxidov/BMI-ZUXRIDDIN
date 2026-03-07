'use client'

import { applyToClub } from '@/app/actions/enrollment'
import { Search } from 'lucide-react'
import { useState, useTransition } from 'react'

const categories = [
  { key: 'all', label: 'Barchasi' },
  { key: 'texnologiya', label: 'Texnologiya' },
  { key: 'sport', label: 'Sport' },
  { key: "san'at", label: "San'at" },
  { key: 'fan', label: 'Fan' },
  { key: 'til', label: 'Til' },
]

const categoryColors: Record<string, string> = {
  texnologiya: 'bg-blue-100 text-blue-700',
  sport: 'bg-rose-100 text-rose-700',
  "san'at": 'bg-purple-100 text-purple-700',
  fan: 'bg-emerald-100 text-emerald-700',
  til: 'bg-amber-100 text-amber-700',
}

interface ClubCatalogProps {
  clubs: Record<string, unknown>[]
  myEnrollments: Record<string, unknown>[]
}

export default function ClubCatalog({ clubs, myEnrollments }: ClubCatalogProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
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
      activeCategory === 'all' || (club.category as string)?.toLowerCase() === activeCategory
    const matchesSearch = (club.name as string)?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
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

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="To'garak nomini qidiring..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
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

      {/* Club Cards Grid */}
      {filteredClubs.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredClubs.map((club) => {
            const teacher = club.teacher as Record<string, unknown> | null
            const status = getEnrollmentStatus(club.id as string)
            const category = (club.category as string)?.toLowerCase() || ''
            const maxStudents = (club.max_students as number) || 30
            const enrolledCount = (club.enrolled_count as number) || 0
            const progressPct = Math.min(Math.round((enrolledCount / maxStudents) * 100), 100)

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
                        categoryColors[category] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {String(club.category)}
                    </span>
                  )}

                  {/* Club Name */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{club.name as string}</h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
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
