'use client'

import { markMessageRead, markMessageReplied } from '@/app/actions/contact';
import DataLoader from '@/components/ui/DataLoader';
import { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Msg = {
  id: string; full_name: string; email: string; phone?: string;
  subject: string; message: string; is_read: boolean; is_replied: boolean; created_at: string;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m} daqiqa oldin`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} soat oldin`
  const days = Math.floor(h / 24)
  return `${days} kun oldin`
}

const subjectColors: Record<string, string> = {
  'Umumiy savol': 'bg-blue-100 text-blue-700',
  "To'garaklarga yozilish": 'bg-indigo-100 text-indigo-700',
  'Texnik muammo': 'bg-red-100 text-red-700',
  'Taklif va shikoyat': 'bg-amber-100 text-amber-700',
  'Hamkorlik': 'bg-emerald-100 text-emerald-700',
  'Boshqa': 'bg-gray-100 text-gray-700',
}

export default function MessagesManager({ messages: initial }: { messages: Msg[] }) {
  const [messages, setMessages] = useState(initial)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all')
  const [detail, setDetail] = useState<Msg | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [dataReady, setDataReady] = useState(false)
  useEffect(() => { setDataReady(true) }, [])

  const unreadCount = messages.filter(m => !m.is_read).length
  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.is_read
    if (filter === 'read') return m.is_read && !m.is_replied
    if (filter === 'replied') return m.is_replied
    return true
  })

  async function handleMarkRead(id: string) {
    setLoading(id)
    await markMessageRead(id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
    setLoading(null)
  }

  async function handleMarkReplied(id: string) {
    setLoading(id)
    await markMessageReplied(id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true, is_replied: true } : m))
    setLoading(null)
    setDetail(null)
  }

  return (
    <DataLoader loading={!dataReady} minHeight="min-h-[300px]">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">📬 Bog&apos;lanish xabarlari</h1>
          <p className="text-sm text-gray-500 mt-1">{messages.length} ta xabar</p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {unreadCount} ta yangi
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { key: 'all' as const, label: `Hammasi (${messages.length})` },
          { key: 'unread' as const, label: `Yangi (${unreadCount})` },
          { key: 'read' as const, label: "O'qilgan" },
          { key: 'replied' as const, label: 'Javob berilgan' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${filter === tab.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-gray-500">Xabar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(msg => (
            <div key={msg.id}
              className={`bg-white rounded-2xl p-5 border transition-shadow ${!msg.is_read ? 'border-l-4 border-l-indigo-500 shadow-md' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {msg.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{msg.full_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subjectColors[msg.subject] || 'bg-gray-100 text-gray-600'}`}>
                        {msg.subject}
                      </span>
                      {!msg.is_read && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                      {msg.is_replied && <span className="text-xs text-emerald-600">✅ Javob berildi</span>}
                    </div>
                    <p className="text-xs text-gray-400">{msg.email}{msg.phone ? ` · ${msg.phone}` : ''}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(msg.created_at)}</span>
              </div>

              <p className="text-sm text-gray-600 mt-3 line-clamp-2">{msg.message}</p>

              <div className="flex gap-2 mt-3">
                <button onClick={() => setDetail(msg)}
                  className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">
                  👁 Ko&apos;rish
                </button>
                {!msg.is_read && (
                  <button onClick={() => handleMarkRead(msg.id)} disabled={loading === msg.id}
                    className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium disabled:opacity-50">
                    ✅ O&apos;qilgan
                  </button>
                )}
                {!msg.is_replied && (
                  <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                    className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium">
                    💬 Javob berish
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-4 p-0" onClick={() => setDetail(null)}>
          <div className="bg-white sm:rounded-2xl max-w-lg w-full h-full sm:h-auto sm:max-h-[90vh] p-4 sm:p-6 shadow-2xl overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">📬 Xabar tafsilotlari</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400">Ism</p><p className="text-sm font-medium">{detail.full_name}</p></div>
                <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium break-all">{detail.email}</p></div>
                {detail.phone && <div><p className="text-xs text-gray-400">Telefon</p><p className="text-sm font-medium">{detail.phone}</p></div>}
                <div><p className="text-xs text-gray-400">Mavzu</p><p className="text-sm font-medium">{detail.subject}</p></div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Xabar</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {detail.message}
                </div>
              </div>
              <p className="text-xs text-gray-400">Yuborilgan: {new Date(detail.created_at).toLocaleString('uz-UZ')}</p>
            </div>

            <div className="flex gap-2 shrink-0 mt-auto">
              {!detail.is_read && (
                <button onClick={() => { handleMarkRead(detail.id); setDetail({ ...detail, is_read: true }) }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                  ✅ O&apos;qilgan
                </button>
              )}
              <button onClick={() => handleMarkReplied(detail.id)}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                💬 Javob berildi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DataLoader>
  )
}
