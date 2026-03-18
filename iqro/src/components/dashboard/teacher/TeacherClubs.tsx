'use client'

import { uploadResource, deleteResource, TeacherResource } from '@/app/actions/resources'
import { getStudentLevel } from '@/lib/levels'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronDown, MapPin, Users, Upload, Trash2, Download, FileText, Plus, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Club extends Record<string, unknown> {
  id: string
  name: string
  resources?: TeacherResource[]
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function TeacherClubs({ clubs }: { clubs: Record<string, unknown>[] }) {
  const [openClub, setOpenClub] = useState<string | null>(null)
  const [openResourcesClub, setOpenResourcesClub] = useState<string | null>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleUpload(e: React.FormEvent, clubId: string) {
    e.preventDefault()
    if (!file || !title.trim()) return
    const formData = new FormData()
    formData.set('file', file)
    formData.set('title', title.trim())
    formData.set('club_id', clubId)
    startTransition(async () => {
      const result = await uploadResource(formData)
      if (result.success) {
        toast({ title: 'Material yuklandi' })
        setFile(null)
        setTitle('')
        window.location.reload()
      } else {
        toast({ title: result.error || 'Xatolik', variant: 'destructive' })
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    startTransition(async () => {
      const result = await deleteResource(id)
      if (result.success) {
        toast({ title: "O'chirildi" })
        window.location.reload()
      } else {
        toast({ title: result.error || 'Xatolik', variant: 'destructive' })
      }
    })
  }

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl mb-4">🏫</span>
        <h3 className="text-lg font-bold text-gray-900">Sizga to&apos;garak biriktirilmagan</h3>
        <p className="text-sm text-gray-500 mt-1">Admin bilan bog&apos;laning</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Mening to&apos;garaklarim</h1>
      
      {/* Toast popup */}
      <div className="space-y-4">
        {clubs.map((c) => {
          const club = c as unknown as Club
          const enrollments = (club.enrollments as Record<string, unknown>[]) || []
          const approvedStudents = enrollments.filter(e => e.status === 'approved')
          const isOpen = openClub === club.id
          const isResOpen = openResourcesClub === club.id
          const resources = club.resources || []

          return (
            <motion.div key={club.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden box-border">
              
              {/* Header Button */}
              <button onClick={() => setOpenClub(isOpen ? null : club.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors text-left border-b border-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">📚</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{club.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} />{(club.schedule as string) || '-'}</span>
                      {Boolean(club.room) && <span className="flex items-center gap-1"><MapPin size={12} />{String(club.room)}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenResourcesClub(isResOpen ? null : club.id)
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-colors border ${
                      isResOpen 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <FileText size={14} className={isResOpen ? "text-white" : "text-gray-400"} /> 
                    Manbaalar ({resources.length})
                  </button>
                  
                  <span className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-medium flex items-center gap-1">
                    <Users size={14} /> {approvedStudents.length} o&apos;quvchi
                  </span>
                  
                  <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Resources Panel (Inline, below header) */}
              <AnimatePresence>
                {isResOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-gray-100 bg-gray-50/50">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <FileText size={16} className="text-indigo-500" />
                          O&apos;quv materiallari
                        </h4>
                        <button onClick={() => setOpenResourcesClub(null)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      </div>

                      <form onSubmit={(e) => handleUpload(e, club.id)} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3 shadow-sm">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Material sarlavhasi</label>
                          <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Masalan: 1-Mavzu taqdimoti"
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fayl tanlang (PDF, DOC, JPG, PNG)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            required
                            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:text-xs file:font-semibold hover:file:bg-indigo-100 cursor-pointer"
                          />
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isPending || !file || !title.trim()}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                          >
                            <Upload size={14} />
                            {isPending ? 'Yuklanmoqda...' : 'Yuklash'}
                          </button>
                        </div>
                      </form>

                      {resources.length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-200">
                          <FileText size={24} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500 font-medium">Hali hech qanday material yuklanmagan</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {resources.map(r => (
                            <div key={r.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-indigo-200 transition-colors group">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                  <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-800 truncate">{r.title}</p>
                                  <p className="text-xs text-gray-500 truncate">{r.file_name} {formatBytes(r.file_size) && `· ${formatBytes(r.file_size)}`}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                  <Download size={14} />
                                </a>
                                <button onClick={() => handleDelete(r.id)} disabled={isPending} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Accordion Content (Students) */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      {approvedStudents.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Hali o&apos;quvchi yo&apos;q</p>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="text-left">
                              <th className="text-xs font-semibold text-gray-400 uppercase pb-3">O&apos;quvchi</th>
                              <th className="text-xs font-semibold text-gray-400 uppercase pb-3">Daraja</th>
                              <th className="text-xs font-semibold text-gray-400 uppercase pb-3">A&apos;zo bo&apos;lgan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvedStudents.map((e) => {
                              const student = e.student as Record<string, unknown>
                              const totalPts = ((student?.student_points as Record<string, unknown>)?.total_points) as number || 0
                              const level = getStudentLevel(totalPts)
                              const initials = ((student?.full_name as string) || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                              const date = new Date(e.created_at as string)
                              const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                              return (
                                <tr key={e.id as string} className="border-t border-gray-50">
                                  <td className="py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{initials}</div>
                                      <span className="text-sm font-medium text-gray-900">{student?.full_name as string}</span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                                      {level.emoji} {level.name}
                                    </span>
                                  </td>
                                  <td className="py-3 text-sm text-gray-500">{dateStr}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
