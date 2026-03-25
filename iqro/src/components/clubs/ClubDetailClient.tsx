'use client'

import { applyToClub } from '@/app/actions/enrollment'
import { submitReview } from '@/app/actions/reviews'
import { getCategoryColor, getDefaultEmoji } from '@/lib/utils'
import Link from 'next/link'
import { useState, useTransition, useRef, useEffect } from 'react'
import { FileText, Download, Star, X, MessageSquare, Send, Paperclip } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ClubDetailClientProps {
  club: any
  enrolledCount: number
  avgRating: string | null
  userEnrollment: any
  userProfile: any
  reviews: any[]
  isEnrolled?: boolean
  resources?: Array<{id: string, title: string, file_url: string, file_name: string, file_size?: number}>
  existingReview?: {rating: number, comment: string | null} | null
  teacherId?: string
  initialMessages?: any[]
  currentUserId?: string
}

export default function ClubDetailClient({
  club, enrolledCount, avgRating, userEnrollment, userProfile, reviews,
  isEnrolled = false, resources = [], existingReview = null,
  teacherId, initialMessages = [], currentUserId
}: ClubDetailClientProps) {
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [localStatus, setLocalStatus] = useState(userEnrollment?.status || null)
  const [showResources, setShowResources] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  
  const [messages, setMessages] = useState<any[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const resourcesRef = useRef<HTMLDivElement>(null)
  const reviewRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setShowResources(false)
      }
      if (reviewRef.current && !reviewRef.current.contains(event.target as Node)) {
        setShowReview(false)
      }
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setShowChat(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (showChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [showChat, messages])

  // Mobile scroll lock when modals are open
  useEffect(() => {
    if (showResources || showReview || showChat) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showResources, showReview, showChat])

  const handleSubmitReview = async () => {
    if (!rating) {
      setToast({ message: 'Yulduzcha tanlang!', type: 'error' })
      setTimeout(() => setToast(null), 4000)
      return
    }
    
    startTransition(async () => {
      const result = await submitReview(club.id, rating, comment)
      if (result.success) {
        setToast({ message: 'Fikringiz saqlandi!', type: 'success' })
        setShowReview(false)
        window.location.reload()
      } else {
        setToast({ message: 'Xatolik: ' + result.error, type: 'error' })
      }
      setTimeout(() => setToast(null), 4000)
    })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !teacherId) return

    // Optimistik Update
    const tempId = Date.now().toString()
    const newMsg = {
      id: tempId,
      message: newMessage.trim(),
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      sender: { full_name: userProfile?.full_name || 'Siz' }
    }
    
    setMessages(prev => [...prev, newMsg])
    const sentMessage = newMessage.trim()
    setNewMessage('')

    // Import action dynamically to avoid top-level issues
    const { sendMessage } = await import('@/app/actions/messages')
    const result = await sendMessage(club.id, teacherId, sentMessage)
    
    if (!result.success) {
      setToast({ message: result.error || 'Xabar yuborishda xatolik', type: 'error' })
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setTimeout(() => setToast(null), 4000)
    } else {
      window.location.reload()
    }
  }

  const emoji = club.emoji || getDefaultEmoji(club.category || '')
  const catColor = getCategoryColor(club.category || '')
  const isFull = enrolledCount >= (club.max_students || 30)
  const spotsLeft = (club.max_students || 30) - enrolledCount

  const role = userProfile?.role
  const getBreadcrumbLinks = () => {
    switch(role) {
      case 'student': return { home: '/student', catalog: '/student/explore' }
      case 'admin': return { home: '/dashboard', catalog: '/dashboard/clubs' }
      case 'teacher': return { home: '/teacher', catalog: '/teacher/clubs' }
      default: return { home: '/', catalog: '/#clubs' }
    }
  }
  const { home, catalog } = getBreadcrumbLinks()

  const handleApply = () => {
    startTransition(async () => {
      const result = await applyToClub(club.id)
      if (result.success) {
        setLocalStatus('pending')
        setToast({ message: "Ariza muvaffaqiyatli yuborildi! 🎉", type: 'success' })
      } else {
        setToast({ message: result.error || 'Xatolik', type: 'error' })
      }
      setTimeout(() => setToast(null), 4000)
    })
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-gray-950 relative">
      {/* Blurred background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {club.cover_image_url && (
          <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110"
            style={{ backgroundImage: `url(${club.cover_image_url})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100/40 via-gray-100/80 to-gray-100 dark:from-gray-900/40 dark:via-gray-900/80 dark:to-gray-900" />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-3 flex items-center justify-between relative">
        <Link href={catalog} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
          <span className="text-xl">←</span>
          <span className="hidden sm:inline">Katalogga qaytish</span>
          <span className="sm:hidden">Ortga</span>
        </Link>
        <div className="flex items-center gap-2">
          {isEnrolled && (
            <>
              {/* Resources Dropdown / Bottom Sheet */}
              <div className="relative" ref={resourcesRef}>
                <button 
                  onClick={() => resources.length > 0 && setShowResources(!showResources)}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                    resources.length > 0 
                      ? showResources ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  aria-label="Manbaalar"
                >
                  <FileText size={18} />
                  {resources.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white border border-white">
                      {resources.length}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showResources && resources.length > 0 && (
                    <>
                      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowResources(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden md:absolute md:inset-auto md:right-0 md:bottom-auto md:mt-2 md:w-80 md:rounded-2xl md:shadow-xl md:border md:border-gray-100 dark:md:border-gray-800 flex flex-col"
                      >
                        <div className="md:hidden w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
                        <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800 flex-shrink-0">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
                            <FileText size={16} className="text-indigo-500" /> O&apos;quv materiallari
                          </h4>
                          <button onClick={() => setShowResources(false)} className="text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-1 hidden md:block">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="overflow-y-auto p-2 flex-1">
                          {resources.map(r => (
                            <a key={r.id} href={r.file_url} target="_blank" rel="noopener noreferrer" 
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors group">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 border border-transparent dark:border-indigo-800 flex items-center justify-center flex-shrink-0">
                                <FileText size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{r.title}</p>
                              </div>
                              <Download size={16} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Review Dropdown / Bottom Sheet */}
              <div className="relative" ref={reviewRef}>
                <button 
                  onClick={() => setShowReview(!showReview)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                    showReview ? 'bg-amber-500 text-white border-amber-500 dark:border-amber-600' : existingReview ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-500 dark:text-amber-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Fikr bildirish"
                >
                  <Star size={18} className={existingReview ? "fill-amber-400 text-amber-400" : ""} />
                </button>
                
                <AnimatePresence>
                  {showReview && (
                    <>
                      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowReview(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl overflow-y-auto md:absolute md:inset-auto md:right-0 md:bottom-auto md:mt-2 md:w-80 md:rounded-2xl md:shadow-xl md:border md:border-gray-100 dark:md:border-gray-800 p-5"
                      >
                        <div className="md:hidden w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
                        <div className="flex justify-between items-center mb-4 hidden md:flex">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                            {existingReview ? 'Fikringizni tahrirlash' : 'Yangi fikr bildirish'}
                          </h4>
                          <button onClick={() => setShowReview(false)} className="text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-1">
                            <X size={16} />
                          </button>
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg sm:text-sm mb-4 md:hidden text-center">
                          {existingReview ? 'Fikringizni tahrirlash' : 'Yangi fikr bildirish'}
                        </h4>
                        
                        <div className="flex gap-2 sm:gap-1 mb-6 sm:mb-4 justify-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" onClick={() => setRating(star)}
                              className="text-4xl sm:text-3xl transition-transform hover:scale-110 focus:outline-none w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center">
                              {star <= rating ? '⭐' : '☆'}
                            </button>
                          ))}
                        </div>
                        
                        <textarea
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="To'garak va ustoz haqida qisqacha fikringiz..."
                          rows={3}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base sm:text-sm outline-none resize-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 transition-all mb-4 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white dark:placeholder:text-gray-500 min-h-[100px]"
                        />
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button onClick={handleSubmitReview} disabled={isPending}
                            className="w-full sm:flex-1 py-3 sm:py-2.5 rounded-xl bg-amber-500 text-white text-base sm:text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors">
                            {isPending ? 'Saqlanmoqda...' : '💾 Saqlash'}
                          </button>
                          <button onClick={() => setShowReview(false)}
                            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-base sm:text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hidden md:block">
                            Bekor
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Dropdown / Bottom Sheet */}
              {teacherId && currentUserId && (
                <div className="relative" ref={chatRef}>
                  <button 
                    onClick={() => setShowChat(!showChat)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                      showChat ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
                    }`}
                    aria-label="Xabar"
                  >
                    <MessageSquare size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {showChat && (
                      <>
                        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowChat(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                          className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl h-[70vh] md:h-[400px] md:absolute md:inset-auto md:right-0 md:bottom-auto md:mt-2 md:w-96 md:rounded-2xl md:shadow-2xl md:border md:border-gray-100 dark:md:border-gray-800 flex flex-col overflow-hidden"
                        >
                          <div className="md:hidden w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
                          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-indigo-50/50 dark:bg-gray-800 flex-shrink-0">
                            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
                              <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" /> 
                              {club.teacher?.full_name || 'Ustoz'}
                            </h4>
                            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg p-1 transition-colors hidden md:block">
                              <X size={16} />
                            </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-gray-950/50">
                            {messages.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <MessageSquare size={32} className="mb-2 opacity-50" />
                                <p className="text-sm">Xabarlar yo&apos;q.</p>
                                <p className="text-xs">Birinchi bo&apos;lib xabar yozing!</p>
                              </div>
                            ) : (
                              messages.map((msg) => {
                                const isMe = msg.sender_id === currentUserId
                                const time = new Date(msg.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
                                return (
                                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13.5px] ${
                                      isMe 
                                        ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm border border-transparent dark:border-indigo-500' 
                                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm'
                                    }`}>
                                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                      {isMe ? 'Siz' : msg.sender?.full_name} • {time}
                                    </span>
                                  </div>
                                )
                              })
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                          
                          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-none">
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Xabar yozing..."
                                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2.5 text-[15px] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 dark:focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white dark:placeholder:text-gray-500 transition-colors"
                              />
                              <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors flex-shrink-0 shadow-sm"
                              >
                                <Send size={18} className="ml-0.5" />
                              </button>
                            </form>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href={home} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Asosiy</Link>
          <span>›</span>
          <Link href={catalog} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">To&apos;garaklar</Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white font-semibold">{club.name}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            {/* Club Info Card */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50 dark:border-gray-800/50">
              {/* Category + Rating */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${catColor}`}>
                  {club.category}
                </span>
                {avgRating && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={`text-sm ${s <= Math.round(Number(avgRating)) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                    <span className="text-sm text-gray-500 ml-1">{avgRating}</span>
                  </div>
                )}
              </div>

              {/* Member avatars */}
              <div className="flex items-center gap-1 mb-4">
                {['bg-indigo-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-cyan-400'].slice(0, Math.min(enrolledCount, 5)).map((color, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${color} border-2 border-white -ml-${i > 0 ? '2' : '0'}`} />
                ))}
                {enrolledCount > 5 && (
                  <span className="text-xs text-gray-500 ml-2">+{enrolledCount - 5}</span>
                )}
              </div>

              {/* Club Name */}
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                <span className="text-4xl">{emoji}</span>
                {club.name}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {club.description || "Ma'lumot kiritilmagan"}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Price */}
                <div className="p-5 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:border-indigo-600 dark:hover:border-indigo-600 group transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-2xl group-hover:bg-white group-hover:text-indigo-600">
                    💰
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-white/70">Narxi</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-white dark:group-hover:text-white text-sm">
                    {club.is_paid ? `${club.price?.toLocaleString('uz-UZ')} so'm` : 'Bepul'}
                  </p>
                </div>

                {/* Schedule */}
                <div className="p-5 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:border-indigo-600 dark:hover:border-indigo-600 group transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-2xl group-hover:bg-white group-hover:text-indigo-600">
                    📅
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-white/70">Jadval</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-white dark:group-hover:text-white text-sm">
                    {club.schedule || '—'}
                  </p>
                </div>

                {/* Students */}
                <div className="p-5 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:border-indigo-600 dark:hover:border-indigo-600 group transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-2xl group-hover:bg-white group-hover:text-indigo-600">
                    👥
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-white/70">O&apos;quvchilar</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-white dark:group-hover:text-white text-sm">
                    {enrolledCount} / {club.max_students || 30}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {(club.cover_image_url || (club.room_image_url && club.room_image_url !== club.cover_image_url)) && (
              <div className={`grid gap-4 ${
                club.cover_image_url && club.room_image_url && club.room_image_url !== club.cover_image_url
                  ? 'grid-cols-2' : 'grid-cols-1'
              }`}>
                {club.cover_image_url && (
                  <div className="h-48 rounded-xl bg-cover bg-center shadow-md hover:scale-[1.02] transition-transform"
                    style={{ backgroundImage: `url(${club.cover_image_url})` }} />
                )}
                {club.room_image_url && club.room_image_url !== club.cover_image_url && (
                  <div className="h-48 rounded-xl bg-cover bg-center shadow-md hover:scale-[1.02] transition-transform"
                    style={{ backgroundImage: `url(${club.room_image_url})` }} />
                )}
              </div>
            )}

            {/* Full Description */}
            {club.full_description && (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50 dark:border-gray-800/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">📖 Batafsil ma&apos;lumot</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{club.full_description}</p>
              </div>
            )}



            {/* Achievements */}
            {club.achievements && club.achievements.length > 0 && (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50 dark:border-gray-800/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🏆 Yutuqlar va imkoniyatlar</h2>
                <div className="flex flex-wrap gap-2">
                  {club.achievements.map((a: string, i: number) => (
                    <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      🏅 {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50 dark:border-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⭐ O&apos;quvchilar fikri</h2>
              
              {/* Average rating */}
              {avgRating && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-4xl font-black 
                                  text-gray-900 dark:text-white">
                    {avgRating}
                  </span>
                  <div>
                    <div className="flex text-amber-400">
                      {[1,2,3,4,5].map(s => (
                        <span key={s}>
                          {s <= Math.round(Number(avgRating)) 
                            ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {reviews?.length} ta fikr
                    </p>
                  </div>
                </div>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {(reviews || []).map(review => (
                  <div key={review.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center 
                                  justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 
                                    text-sm">
                          {(review.profiles as any)?.full_name || 
                          'O\'quvchi'}
                        </p>
                        {(review.profiles as any)?.grade && (
                          <p className="text-xs text-gray-400">
                            {(review.profiles as any).grade}-sinf
                          </p>
                        )}
                      </div>
                      <div className="flex text-amber-400 text-sm">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 
                                  leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}

                {(!reviews || reviews.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">💬</p>
                    <p className="text-sm">
                      Hali fikr bildirilmagan
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              {/* Teacher + Enrollment Card */}
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-indigo-100/50 dark:border-gray-800/50 relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-950/30 rounded-bl-full -mr-10 -mt-10" />

                {/* Teacher info */}
                <div className="relative text-center mb-6">
                  {club.teacher_image_url ? (
                    <img src={club.teacher_image_url} alt={club.teacher?.full_name || ''}
                      className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-indigo-600 ring-offset-4" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-2xl mx-auto ring-4 ring-indigo-600 ring-offset-4">
                      {club.teacher?.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mt-4">{club.teacher?.full_name || 'Belgilanmagan'}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mt-1">O&apos;qituvchi</p>
                  {club.teacher_bio && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-3 leading-relaxed">{club.teacher_bio}</p>
                  )}
                </div>

                <hr className="border-gray-100 dark:border-gray-800 my-5" />

                {/* Room & Schedule */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Jadval</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{club.schedule || '—'}</p>
                  </div>
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Xona</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{club.room ? `${club.room}` : '—'}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{enrolledCount} ta a&apos;zo</span>
                    <span>{club.max_students || 30} ta joy</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min((enrolledCount / (club.max_students || 30)) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Enrollment Button */}
                {!userProfile ? (
                  <Link href="/login"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all active:scale-95">
                    Kirish va ro&apos;yxatdan o&apos;tish 🚀
                  </Link>
                ) : userProfile.role !== 'student' ? null : localStatus === 'pending' ? (
                  <div className="w-full py-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900 text-center">
                    <p className="font-bold text-amber-700 dark:text-amber-500">⏳ Arizangiz ko&apos;rib chiqilmoqda</p>
                    <p className="text-sm text-amber-500 dark:text-amber-600 mt-1">Admin tasdiqlashini kuting</p>
                  </div>
                ) : localStatus === 'approved' ? (
                  <div className="w-full py-4 rounded-xl bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-900 text-center">
                    <p className="font-bold text-green-700 dark:text-green-500">✅ Siz bu to&apos;garak a&apos;zosisiz!</p>
                  </div>
                ) : localStatus === 'rejected' ? (
                  <button onClick={handleApply} disabled={isPending}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                    {isPending ? '⏳ Yuborilmoqda...' : '❌ Rad etildi — Qayta ariza'}
                  </button>
                ) : isFull ? (
                  <div className="w-full py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-center">
                    <p className="font-bold text-gray-600 dark:text-gray-400">😔 To&apos;garak to&apos;lgan</p>
                  </div>
                ) : (
                  <>
                    <button onClick={handleApply} disabled={isPending}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                      {isPending ? '⏳ Yuborilmoqda...' : "To'garakka a'zo bo'lish 🚀"}
                    </button>
                    <p className="mt-3 text-xs text-gray-500 text-center">
                      {spotsLeft} ta joy qoldi
                    </p>
                  </>
                )}
              </div>

              {/* Room Image */}
              {club.room_image_url && (
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 dark:border-gray-800/50 shadow-sm">
                  <img src={club.room_image_url} alt="Dars xonasi" className="w-full h-48 object-cover" />
                  <p className="text-center text-xs text-gray-500 py-3">📍 Dars xonasi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
