'use client'

import {
  createNewSession,
  getOrCreateTodaySession,
  getSessionMessages,
  getUserSessions,
  saveMessage,
  deleteSession,
} from '@/app/actions/ai-chat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import {
  Download,
  Loader2,
  Menu,
  Plus,
  Send,
  Trash2,
  X,
  GraduationCap,
  BookOpen,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
  isError?: boolean
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
    title: 'AI Yordamchi',
    badge: "O'quvchi yordamchisi",
    badgeColor: 'bg-green-100 text-green-700 border-green-200',
    icon: GraduationCap,
    subtitle: "Sizning shaxsiy ta'lim yordamchingiz",
    suggestions: [
      "📚 Bugungi darsim haqida savol beraman",
      "✏️ Menga test tuz",
      "📊 Mening statistikam",
      "🎯 Qaysi mavzuni o'rganay?",
    ],
    placeholder: 'Savolingizni yozing...',
  },
  teacher: {
    title: 'AI Yordamchi',
    badge: "O'qituvchi tahlilchisi",
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: BookOpen,
    subtitle: 'Dars va davomat tahlilchisi',
    suggestions: [
      "📊 O'quvchilarim statistikasi",
      "✏️ Test yaratishda yordam",
      "📈 Davomat tahlili",
      "💡 Dars rejasi tayyorla",
    ],
    placeholder: "Tahlil yoki yordam so'rang...",
  },
  director: {
    title: 'AI Yordamchi',
    badge: 'Direktor tahlilchisi',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: BarChart3,
    subtitle: "Maktab boshqaruvi bo'yicha tahlilchi",
    suggestions: [
      '📊 Maktab statistikasi',
      "🏆 Eng faol o'quvchilar",
      '📈 Davomat tahlili',
      "👨‍🏫 O'qituvchilar samaradorligi",
    ],
    placeholder: "Hisobot yoki tahlil so'rang...",
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

function exportToPDF(content: string, title: string) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #4F46E5; font-size: 24px; }
          h2 { color: #6366F1; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #4F46E5; color: white; }
          tr:nth-child(even) { background: #f9f9f9; }
          p { line-height: 1.6; }
          ul, ol { padding-left: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
          .footer { margin-top: 40px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>IQRO — 46-maktab</h1>
          <p>${new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
        <div>${content.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}</div>
        <div class="footer">
          IQRO AI tizimi orqali yaratildi • ${new Date().toLocaleString('uz-UZ')}
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
  const [slowResponse, setSlowResponse] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize
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
          }
        }
      } catch (e) {
        console.error('Init error:', e)
      } finally {
        setInitializing(false)
      }
    }
    init()
  }, [userId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setSlowResponse(true)
      }, 10000)
      return () => clearTimeout(timer)
    } else {
      setSlowResponse(false)
    }
  }, [isLoading])

  async function loadSession(session: Session) {
    setCurrentSession(session)
    setShowSidebar(false)
    const msgs = await getSessionMessages(session.id)
    setMessages(msgs as Message[])
  }

  async function handleNewChat() {
    const newSession = await createNewSession(userId)
    if (newSession) {
      setCurrentSession(newSession as Session)
      setMessages([])
      const allSessions = await getUserSessions(userId)
      setSessions(allSessions as Session[])
    }
    setShowSidebar(false)
  }

  async function executeFetch(history: {role: string, content: string}[], currentSessionId: string, aiMessageTempId: string) {
    try {
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, sessionId: currentSessionId })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setMessages(prev => prev.map(m => 
          m.id === aiMessageTempId 
            ? { ...m, content: data.error || "Xatolik yuz berdi. Qayta urinib ko'ring.", isError: true }
            : m
        ))
        return
      }

      // Replace placeholder with actual response
      setMessages(prev => prev.map(m =>
        m.id === aiMessageTempId
          ? { ...m, content: data.reply, id: Date.now().toString() }
          : m
      ))
    } catch (err) {
      setMessages(prev => prev.map(m => 
        m.id === aiMessageTempId
          ? { ...m, content: "Xatolik yuz berdi. Internet aloqasini tekshiring va qayta urinib ko'ring.", isError: true }
          : m
      ))
    } finally {
      setIsLoading(false)
      setSlowResponse(false)
    }
  }

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || isLoading || !currentSession) return

    setInput('')
    setIsLoading(true)
    setSlowResponse(false)

    // Remove any previous errors
    setMessages(prev => prev.filter(m => !m.isError))

    // Step 1: Add user message
    const userMsgId = Date.now().toString()
    const userMsg: Message = { 
      id: userMsgId,
      role: 'user', 
      content: msg,
      created_at: new Date().toISOString()
    }
    
    // Step 2: Add temporary AI placeholder with unique ID
    const tempId = `temp-${Date.now()}`
    const tempAiMsg: Message = {
      id: tempId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsg, tempAiMsg])

    await saveMessage(currentSession.id, 'user', msg)

    const history = [...messages.filter(m => !m.isError), userMsg]
      .map(m => ({ role: m.role, content: m.content }))

    await executeFetch(history, currentSession.id, tempId)
  }

  async function handleRetry() {
    if (isLoading || !currentSession) return
    setIsLoading(true)
    setSlowResponse(false)
    
    setMessages(prev => prev.filter(m => !m.isError))
    
    // Create new temporary AI message
    const tempId = `temp-${Date.now()}`
    const tempAiMsg: Message = {
      id: tempId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, tempAiMsg])
    
    const history = messages
      .filter(m => !m.isError)
      .map(m => ({ role: m.role, content: m.content }))

    await executeFetch(history, currentSession.id, tempId)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isReportMessage = (content: string) => {
    const keywords = ['hisobot', 'statistika', 'jami', 'foiz', 'natija', 'jadval', 'umumiy']
    return keywords.some(k => content.toLowerCase().includes(k)) && content.length > 150
  }

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-base font-bold mt-4 mb-2 text-gray-800 dark:text-white">{line.slice(3)}</h3>
      if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-indigo-900 dark:text-white">{line.slice(2)}</h2>
      
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="dark:text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')

      if (formattedLine.startsWith('- ') || formattedLine.startsWith('• ')) {
        return <li key={i} className="ml-5 list-disc mb-1 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: formattedLine.slice(2) }} />
      }
      if (/^\d+\.\s/.test(formattedLine)) {
        return <li key={i} className="ml-5 list-decimal mb-1 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\d+\.\s/, '') }} />
      }
      if (formattedLine.trim() === '') return <div key={i} className="h-3" />
      return <p key={i} className="mb-1 text-gray-700 dark:text-gray-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
    })
  }

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-gray-950/50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">AI yordamchi yuklanmoqda...</p>
      </div>
    )
  }

  const sessionGroups = groupSessionsByDate(sessions)
  const Icon = config.icon

  return (
    <div className="flex h-[calc(100dvh-4rem)] md:h-[calc(100vh-5rem)] -m-4 md:-m-6 overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR — always overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 shadow-2xl"
          >
        {/* Sidebar Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 text-white">
              <Icon size={22} className="opacity-90" />
              <h2 className="font-bold text-lg tracking-tight">{config.title}</h2>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-1.5 rounded-full hover:bg-white/20 text-white/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 hover:bg-opacity-90 dark:hover:bg-gray-700 text-indigo-600 dark:text-gray-200 border dark:border-gray-700 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            Yangi suhbat
          </button>
        </div>

        {/* Sidebar Sessions */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 custom-scrollbar">
          {sessionGroups.map(group => (
            <div key={group.label}>
              <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.sessions.map(s => {
                  const isActive = currentSession?.id === s.id
                  return (
                    <div key={s.id} className="group relative">
                      <button
                         onClick={() => loadSession(s)}
                         className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all truncate pr-8 border-l-2
                           ${isActive
                             ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium border-indigo-500 dark:border-indigo-700'
                             : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                           }`}
                      >
                         {s.title}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingId(s.id)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400"
                        title="O'chirish"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Hali suhbatlar yo&apos;q</p>
              <p className="text-xs text-gray-400 mt-1">Yangi suhbat boshlang</p>
            </div>
          )}
        </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* RIGHT MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center px-4 md:px-6 flex-shrink-0 z-10 transition-all">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 -ml-2 mr-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-colors"
            title={showSidebar ? "Tarixni yopish" : "AI tarixini ko'rish"}
          >
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md border-2 border-white ring-2 ring-indigo-50">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-gray-900 dark:text-white leading-tight">IQRO AI</h1>
                <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border ${config.badgeColor} hidden sm:inline-block`}>
                  {config.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Gemini 2.5 Flash Lite</p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{userName}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-1"><Icon size={10} /> {userRole}</span>
             </div>
             <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden md:block mx-1"></div>
             <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
               {currentSession ? 'Faol suhbat' : sessions.length + ' ta suhbat'}
             </span>
          </div>
        </header>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 scroll-smooth">
          
          {/* WELCOME STATE */}
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200 mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                Salom, {userName.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto">
                {config.subtitle}. Sizga qanday yordam bera olaman?
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3 w-full">
                {config.suggestions.map((suggestion, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(suggestion)}
                    disabled={isLoading}
                    className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md dark:hover:bg-gray-700 transition-all text-left text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 flex items-center gap-3 group"
                  >
                    <span className="flex-1">{suggestion}</span>
                    <span className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      →
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* MESSAGES LIST */}
          <div className="space-y-6 max-w-6xl mx-auto pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[95%] md:max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    
                    {/* AVATAR FOR AI */}
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0 mt-1">
                        <span className="text-sm">🤖</span>
                      </div>
                    )}

                    {/* MESSAGE BUBBLE */}
                    <div className="flex flex-col relative group">
                      <div
                        className={`px-5 py-3.5 text-[15px] shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm border-l-[3px] border-indigo-400 dark:border-l-indigo-500'
                        }`}
                      >
                         {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                         ) : msg.id?.startsWith('temp-') && msg.content === '' ? (
                            <div className="flex gap-1.5 py-1">
                              <span className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                         ) : (
                            <div className="prose prose-sm md:prose-base prose-indigo max-w-none dark:prose-invert">
                               <ReactMarkdown
                                 remarkPlugins={[remarkGfm, remarkMath]}
                                 rehypePlugins={[rehypeKatex]}
                               >
                                 {msg.content}
                               </ReactMarkdown>
                            </div>
                         )}
                      </div>
                      
                      {/* MESSAGE META / ACTIONS */}
                      <div className={`flex items-center gap-3 mt-1.5 px-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          {formatTime(msg.created_at) || formatTime(new Date().toISOString())}
                        </span>
                        
                        {msg.isError && (
                          <button
                            onClick={handleRetry}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-all"
                          >
                            <RefreshCw size={12} />
                            Qayta urinish
                          </button>
                        )}
                        
                        {msg.role === 'assistant' && !msg.isError &&
                          isReportMessage(msg.content) &&
                          (userRole === 'teacher' || userRole === 'director') && (
                            <button
                              onClick={() =>
                                exportToPDF(msg.content, `IQRO AI Hisobot — ${new Date().toLocaleDateString('uz-UZ')}`)
                              }
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-gray-300 bg-indigo-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-transparent dark:border-gray-600 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-all"
                            >
                              <Download size={12} />
                              PDF ga saqlash
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Slow response hint (only shown when temp bubble is visible) */}
            {isLoading && slowResponse && (
              <p className="text-xs text-gray-400 animate-pulse ml-14 -mt-3 max-w-4xl mx-auto">
                AI javob tayyorlamoqda... Bu biroz vaqt olishi mumkin
              </p>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4 shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none relative z-20">
          <div className="max-w-6xl mx-auto relative">
            <div className="flex gap-3 items-end bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-2 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-900/20 transition-all shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={config.placeholder}
                className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-2.5 px-3 text-[16px] sm:text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-800 dark:text-white"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-2">
               <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">IQRO AI · Gemini 2.5 Flash Lite</p>
               <p className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block">
                 <kbd className="font-sans px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mx-0.5">Enter</kbd> yuborish, <kbd className="font-sans px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mx-0.5">Shift+Enter</kbd> yangi qator
               </p>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 bg-gray-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border dark:border-gray-800"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                Suhbatni o&apos;chirish
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center leading-relaxed">
                Bu suhbat va uning barcha xabarlari batamom o&apos;chib ketadi. Buni ortga qaytarib bo&apos;lmaydi. Davom etamizmi?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={async () => {
                    await deleteSession(deletingId)
                    setSessions(prev => prev.filter(s => s.id !== deletingId))
                    if (currentSession?.id === deletingId) {
                      setCurrentSession(null)
                      setMessages([])
                    }
                    setDeletingId(null)
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-md transition-colors"
                >
                  O&apos;chirish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  )
}
