'use client'

import { uploadResource, deleteResource, TeacherResource } from '@/app/actions/resources'
import { getStudentLevel } from '@/lib/levels'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronDown, MapPin, Users, Upload, Trash2, Download, FileText, Plus, X, MessageSquare, Send } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Club extends Record<string, unknown> {
  id: string
  name: string
  resources?: TeacherResource[]
  club_messages?: any[]
  enrollments?: Record<string, unknown>[]
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function TeacherClubs({ clubs }: { clubs: Record<string, unknown>[] }) {
  const [openClub, setOpenClub] = useState<string | null>(null)
  const [openResourcesClub, setOpenResourcesClub] = useState<string | null>(null)
  const [openMessagesClub, setOpenMessagesClub] = useState<string | null>(null)
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
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

  function handleReply(e: React.FormEvent, clubId: string, studentId: string) {
    e.preventDefault()
    if (!replyMessage.trim() || !studentId) return
    startTransition(async () => {
      const { sendMessage } = await import('@/app/actions/messages')
      const result = await sendMessage(clubId, studentId, replyMessage.trim())
      if (result.success) {
        setReplyMessage('')
        window.location.reload()
      } else {
        toast({ title: result.error || 'Xabar yuborishda xato', variant: 'destructive' })
      }
    })
  }

  async function handleMarkAsRead(clubId: string, studentId: string) {
    const { markMessagesRead } = await import('@/app/actions/messages')
    await markMessagesRead(clubId, studentId)
    // Silently mark as read, no need to reload unless wanted
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
          const clubMessages = club.club_messages || []
          
          // Group messages by student
          const studentMessages: Record<string, any[]> = {}
          let unreadTotalCount = 0
          
          clubMessages.forEach(msg => {
            // Find the other person in the conversation (the student)
            // Assuming the teacher is looking at their own clubs, the other person is the student
            const studentId = msg.sender_id === (club as any).teacher_id ? msg.receiver_id : msg.sender_id
            
            if (!studentMessages[studentId]) {
              studentMessages[studentId] = []
            }
            studentMessages[studentId].push(msg)
            
            // Count unread messages (received by teacher)
            if (!msg.is_read && msg.receiver_id === (club as any).teacher_id) {
              unreadTotalCount++
            }
          })
          
          // Sort messages inside groups
          Object.values(studentMessages).forEach(msgs => {
            msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          })

          return (
            <motion.div key={club.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden box-border">
              
              {/* Header Button */}
              <button onClick={() => setOpenClub(isOpen ? null : club.id)}
                className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-gray-50/50 transition-colors text-left border-b border-transparent">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg sm:text-xl flex-shrink-0 mt-1 sm:mt-0">📚</div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{club.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} />{(club.schedule as string) || '-'}</span>
                      {Boolean(club.room) && <span className="flex items-center gap-1"><MapPin size={12} />{String(club.room)}</span>}
                      {Array.isArray(club.target_grades) && club.target_grades.length > 0 && (
                        <span className="flex items-center gap-1">
                          🎓 {(club.target_grades as string[]).join(', ')}-sinf
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto mt-2 sm:mt-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMessagesClub(openMessagesClub === club.id ? null : club.id)
                      setOpenResourcesClub(null)
                      setActiveStudentId(null)
                    }}
                    className={`relative text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-colors border ${
                      openMessagesClub === club.id 
                        ? 'bg-amber-500 text-white border-amber-500' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare size={14} className={openMessagesClub === club.id ? "text-white" : "text-gray-400"} /> 
                    <span className="hidden sm:inline">Xabarlar</span>
                    {unreadTotalCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {unreadTotalCount}
                      </span>
                    )}
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenResourcesClub(isResOpen ? null : club.id)
                      setOpenMessagesClub(null)
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
                            className="w-full px-3 py-2 text-[16px] sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fayl tanlang (PDF, DOC, JPG, PNG)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            required
                            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:text-[16px] sm:file:text-xs file:font-semibold hover:file:bg-indigo-100 cursor-pointer"
                          />
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={isPending || !file || !title.trim()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2 bg-indigo-600 text-white text-[16px] sm:text-sm font-semibold rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
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

              {/* Messages Panel (Inline, below header) */}
              <AnimatePresence>
                {openMessagesClub === club.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-gray-100 bg-amber-50/30">
                    <div className="p-5 flex flex-col md:flex-row gap-4 h-[500px]">
                      
                      {/* Left Sidebar: Students List */}
                      <div className="md:w-1/3 border border-gray-200 rounded-xl bg-white flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                          <h4 className="text-xs font-bold text-gray-600 uppercase">Suhbatlar</h4>
                          <button onClick={() => setOpenMessagesClub(null)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors md:hidden">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {Object.keys(studentMessages).length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                              Hali xabarlar yo&apos;q
                            </div>
                          ) : (
                            Object.entries(studentMessages).map(([studId, msgs]) => {
                              // Find student name from first message
                              const studentName = msgs.find(m => m.sender_id === studId)?.sender?.full_name 
                                || msgs.find(m => m.receiver_id === studId)?.receiver?.full_name 
                                || 'O\&apos;quvchi';
                              
                              const unreadCount = msgs.filter(m => !m.is_read && m.receiver_id === (club as any).teacher_id).length;
                              const lastMsg = msgs[msgs.length - 1];
                              const isActive = activeStudentId === studId;

                              return (
                                <button 
                                  key={studId}
                                  onClick={() => {
                                    setActiveStudentId(studId);
                                    if (unreadCount > 0) handleMarkAsRead(club.id, studId);
                                  }}
                                  className={`w-full text-left p-3 border-b border-gray-50 transition-colors flex items-center justify-between ${
                                    isActive ? 'bg-amber-50 border-amber-100' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="min-w-0 pr-2">
                                    <p className={`text-sm truncate ${isActive || unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                      {studentName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                      {lastMsg.sender_id === (club as any).teacher_id ? 'Siz: ' : ''}{lastMsg.message}
                                    </p>
                                  </div>
                                  {unreadCount > 0 && (
                                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                      {unreadCount}
                                    </span>
                                  )}
                                </button>
                              )
                            })
                          )}
                        </div>
                      </div>

                      {/* Right Panel: Chat Thread */}
                      <div className="md:w-2/3 border border-gray-200 rounded-xl bg-white flex flex-col overflow-hidden">
                        {!activeStudentId ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare size={32} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">Suhbatni tanlang</p>
                          </div>
                        ) : (
                          <>
                            {/* Chat Header */}
                            <div className="p-3 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
                              <h4 className="text-sm font-bold text-gray-800">
                                {studentMessages[activeStudentId]?.find(m => m.sender_id === activeStudentId)?.sender?.full_name 
                                  || studentMessages[activeStudentId]?.find(m => m.receiver_id === activeStudentId)?.receiver?.full_name 
                                  || 'O\&apos;quvchi'}
                              </h4>
                              <button onClick={() => setOpenMessagesClub(null)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-lg hidden md:block transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                            
                            {/* Messages Overflow */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                              {studentMessages[activeStudentId]?.map((msg) => {
                                const isTeacher = msg.sender_id === (club as any).teacher_id
                                const time = new Date(msg.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
                                return (
                                  <div key={msg.id} className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] ${
                                      isTeacher 
                                        ? 'bg-amber-500 text-white rounded-br-sm shadow-sm' 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                    }`}>
                                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                      {isTeacher ? 'Siz' : msg.sender?.full_name} • {time}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Reply Input */}
                            <div className="p-3 border-t border-gray-100 bg-white">
                              <form onSubmit={(e) => handleReply(e, club.id, activeStudentId)} className="flex gap-2">
                                <input
                                  type="text"
                                  value={replyMessage}
                                  onChange={e => setReplyMessage(e.target.value)}
                                  placeholder="Javob yozish..."
                                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all bg-gray-50 focus:bg-white"
                                />
                                <button
                                  type="submit"
                                  disabled={!replyMessage.trim() || isPending}
                                  className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 disabled:opacity-50 transition-colors flex-shrink-0"
                                >
                                  <Send size={16} />
                                </button>
                              </form>
                            </div>
                          </>
                        )}
                      </div>

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
                        <div className="overflow-x-auto no-scrollbar pb-2">
                          <table className="w-full min-w-[500px]">
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
                        </div>
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
