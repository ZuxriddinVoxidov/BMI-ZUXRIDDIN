'use client'

import {
  createNewSession,
  getOrCreateTodaySession,
  getSessionMessages,
  getUserSessions,
  saveMessage,
  deleteSession,
} from '@/app/actions/ai-chat'
import {
  ArrowLeft,
  Download,
  Loader2,
  Menu,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface Session {
  id: string
  date: string
  title: string
  created_at: string
}

interface AIChatPageProps {
  userId: string
  userRole: 'student' | 'teacher' | 'director'
  userName: string
  apiRoute: string
}

const ROLE_CONFIG = {
  student: {
    title: "AI O'quv Yordamchi 🎓",
    subtitle: 'Savollaringizga javob beraman',
    greeting:
      "Salom! Men sizning shaxsiy AI yordamchingizman 🎓\nTo'garaklar, darslar va balllaringiz haqida bemalol so'rang!",
    suggestions: [
      "Qaysi to'garakka qo'shilishni maslahat berasan?",
      'Ballarimni qanday oshiraman?',
      "Bugungi dars jadvalim qanday?",
    ],
    color: 'from-indigo-500 to-blue-600',
    accent: '#6366F1',
  },
  teacher: {
    title: 'AI Dars Tahlilchisi 📚',
    subtitle: "Davomat va o'quvchilar tahlili",
    greeting:
      "Salom! Dars va davomat bo'yicha tahlil qilaman 📚\nStatistika yoki maslahat kerakmi?",
    suggestions: [
      'Bu oylik davomat hisobotini chiqar',
      "Eng ko'p qatnashgan o'quvchilarni ko'rsat",
      'Dars samaradorligini tahlil qil',
    ],
    color: 'from-emerald-500 to-teal-600',
    accent: '#10B981',
  },
  director: {
    title: 'AI Maktab Tahlilchisi 📊',
    subtitle: 'Statistika va hisobotlar',
    greeting:
      "Salom! Maktab statistikasi bo'yicha tahlil qilaman 📊\nHisobot yoki tahlil kerakmi?",
    suggestions: [
      'Maktab umumiy statistikasini chiqar',
      "O'qituvchilar samaradorligi hisoboti",
      'PDF hisobot tayyorla',
    ],
    color: 'from-purple-500 to-indigo-600',
    accent: '#8B5CF6',
  },
}

function formatTime(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupSessionsByDate(sessions: Session[]) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const groups: { label: string; sessions: Session[] }[] = [
    { label: 'Bugun', sessions: [] },
    { label: 'Kecha', sessions: [] },
    { label: 'Oldingi', sessions: [] },
  ]

  for (const s of sessions) {
    if (s.date === today) groups[0].sessions.push(s)
    else if (s.date === yesterday) groups[1].sessions.push(s)
    else groups[2].sessions.push(s)
  }

  return groups.filter(g => g.sessions.length > 0)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportToPDF(content: string, title: string) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #6366F1; font-size: 24px; }
          h2 { color: #4F46E5; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #6366F1; color: white; }
          tr:nth-child(even) { background: #f9f9f9; }
          p { line-height: 1.6; }
          ul { padding-left: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #6366F1; padding-bottom: 10px; }
          .footer { margin-top: 40px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>IQRO — 46-maktab</h1>
          <p>${new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
        <div>${content.replace(/\n/g, '<br>')}</div>
        <div class="footer">
          IQRO tizimi orqali yaratildi • ${new Date().toLocaleString('uz-UZ')}
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

export default function AIChatPage({
  userId,
  userRole,
  userName,
  apiRoute,
}: AIChatPageProps) {
  const config = ROLE_CONFIG[userRole]
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize: load sessions and today's session
  useEffect(() => {
    async function init() {
      try {
        const [allSessions, todaySession] = await Promise.all([
          getUserSessions(userId),
          getOrCreateTodaySession(userId),
        ])
        setSessions(allSessions as Session[])
        if (todaySession) {
          setCurrentSession(todaySession as Session)
          const msgs = await getSessionMessages(todaySession.id)
          if (msgs.length > 0) {
            setMessages(msgs as Message[])
          } else {
            setMessages([
              { role: 'assistant', content: config.greeting },
            ])
          }
        }
      } catch (e) {
        console.error('Init error:', e)
        setMessages([{ role: 'assistant', content: config.greeting }])
      } finally {
        setInitializing(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  async function loadSession(session: Session) {
    setCurrentSession(session)
    setShowSidebar(false)
    const msgs = await getSessionMessages(session.id)
    setMessages(
      msgs.length > 0 ? (msgs as Message[]) : [{ role: 'assistant', content: config.greeting }]
    )
  }

  async function handleNewChat() {
    const newSession = await createNewSession(userId)
    if (newSession) {
      setCurrentSession(newSession as Session)
      setMessages([{ role: 'assistant', content: config.greeting }])
      const allSessions = await getUserSessions(userId)
      setSessions(allSessions as Session[])
    }
    setShowSidebar(false)
  }

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || isLoading || !currentSession) return

    setInput('')
    setIsLoading(true)

    const userMsg: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])

    // Save user message
    await saveMessage(currentSession.id, 'user', msg)

    // Build history for API
    const history = [...messages, userMsg]
      .filter(m => m.content !== config.greeting)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const data = await response.json()
      const reply =
        data.reply || data.response || 'Kechirasiz, javob olishda xatolik yuz berdi.'

      const aiMsg: Message = { role: 'assistant', content: reply }
      setMessages(prev => [...prev, aiMsg])

      // Save AI message
      await saveMessage(currentSession.id, 'assistant', reply)
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Kechirasiz, xatolik yuz berdi. Qayta urinib ko'ring.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isReportMessage = (content: string) => {
    const keywords = ['hisobot', 'statistika', 'jami', 'foiz', 'natija', 'jadval', 'umumiy']
    return keywords.some(k => content.toLowerCase().includes(k)) && content.length > 200
  }

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">AI yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  const sessionGroups = groupSessionsByDate(sessions)

  return (
    <div className="flex h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] -m-4 md:-m-6 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Left sidebar - sessions history */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0
          transform transition-transform duration-300
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-r ${config.color} flex items-center justify-center`}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">AI Tahlilchi</span>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${config.color} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
          >
            <Plus size={16} />
            Yangi suhbat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {sessionGroups.map(group => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.sessions.map(s => (
                  <div key={s.id} className="group relative flex items-center">
                    <button
                      onClick={() => loadSession(s)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all truncate pr-8 ${
                        currentSession?.id === s.id
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s.title}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingId(s.id)
                      }}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Hali suhbatlar yo&apos;q</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        {/* Chat header */}
        <div className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center gap-3 px-4 flex-shrink-0">
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} className="text-gray-500" />
          </button>
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-r ${config.color} flex items-center justify-center flex-shrink-0`}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-800 truncate">
              {config.title}
            </h2>
            <p className="text-xs text-gray-400 truncate">{config.subtitle}</p>
          </div>
          <div className="ml-auto hidden sm:block">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
              {userName}
            </span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Show suggestions if only greeting */}
          {messages.length <= 1 && (
            <div className="max-w-lg mx-auto mt-4 sm:mt-8">
              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${config.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  {config.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{config.subtitle}</p>
              </div>
              <div className="space-y-2">
                {config.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(suggestion)}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-sm text-gray-700 transition-all disabled:opacity-50"
                  >
                    <span className="text-indigo-500 mr-2">→</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2.5 max-w-[90%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-r ${config.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {msg.created_at && (
                      <p className="text-[10px] text-gray-300 px-1">
                        {formatTime(msg.created_at)}
                      </p>
                    )}
                    {msg.role === 'assistant' &&
                      isReportMessage(msg.content) &&
                      (userRole === 'teacher' || userRole === 'director') && (
                        <button
                          onClick={() =>
                            exportToPDF(msg.content, `IQRO Hisobot - ${new Date().toLocaleDateString('uz-UZ')}`)
                          }
                          className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors"
                        >
                          <Download size={10} />
                          PDF yuklab olish
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-r ${config.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400 ml-1">
                      O&apos;ylayapman...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`${userName.split(' ')[0]}, savolingizni yozing...`}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none overflow-hidden"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0`}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-300 mt-2 hidden sm:block">
            Enter — yuborish · Shift+Enter — yangi qator
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-gray-900 mb-2">
              Suhbatni o&apos;chirish
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Bu suhbat va uning barcha xabarlari batamom o&apos;chib ketadi. Davom etamizmi?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  await deleteSession(deletingId)
                  setSessions(prev => prev.filter(s => s.id !== deletingId))
                  if (currentSession?.id === deletingId) {
                    setCurrentSession(null)
                    setMessages([{ role: 'assistant', content: config.greeting }])
                  }
                  setDeletingId(null)
                }}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
