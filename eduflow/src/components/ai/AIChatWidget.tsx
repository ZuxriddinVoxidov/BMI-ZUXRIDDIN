'use client'
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatWidgetProps {
  apiRoute: '/api/ai/student' | '/api/ai/teacher' | '/api/ai/director' | '/api/ai/chat'
  placeholder?: string
  title?: string
  subtitle?: string
  color?: string
}

const GREETINGS: Record<string, string> = {
  '/api/ai/student': 'Salom! Men sizning AI yordamchingizman 🎓\nTo\'garaklar haqida savollaringiz bo\'lsa, bemalol so\'rang!',
  '/api/ai/teacher': 'Salom! Dars va davomat bo\'yicha yordam beraman 📚\nStatistika yoki maslahat kerakmi?',
  '/api/ai/director': 'Salom! Maktab statistikasi bo\'yicha tahlil qilaman 📊\nNima haqida bilmoqchisiz?',
  '/api/ai/chat': 'Salom! Men EduFlow AI yordamchisiman 😊\nPlatforma haqida savollaringiz bo\'lsa, bemalol yozing!',
}

export default function AIChatWidget({
  apiRoute,
  placeholder = 'Savolingizni yozing...',
  title = 'AI Yordamchi',
  subtitle = 'Sizga yordam beraman!',
  color = 'from-indigo-500 to-blue-600',
}: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: GREETINGS[apiRoute] || GREETINGS['/api/ai/chat'],
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Lock body scroll on mobile when widget is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  async function sendMessage() {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const res = await fetch(apiRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const reply = data.reply || data.response || data.error || 'Xatolik yuz berdi'

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Kechirasiz, xatolik yuz berdi. Qayta urinib ko\'ring.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Mobile: full-screen overlay */}
          <div className="sm:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setIsOpen(false)} />

          <div
            className={
              'fixed inset-0 sm:relative sm:inset-auto ' +
              'sm:mb-4 sm:w-[400px] bg-white sm:rounded-2xl shadow-2xl sm:border sm:border-gray-100 ' +
              'flex flex-col overflow-hidden z-50'
            }
            style={{ height: typeof window !== 'undefined' && window.innerWidth < 640 ? '100dvh' : '500px' }}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${color} p-4 flex items-center justify-between flex-shrink-0`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/80 text-xs">{subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span className="text-xs text-gray-400">Javob tayyorlanmoqda...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={placeholder}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 bg-gradient-to-r ${color} rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all hover:shadow-xl`}
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Pulse animation */}
      {!isOpen && (
        <span className="absolute top-0 right-0 w-3 h-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex rounded-full w-3 h-3 bg-indigo-500" />
        </span>
      )}
    </div>
  )
}
