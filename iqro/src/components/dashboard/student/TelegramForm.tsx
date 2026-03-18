'use client'

import { updateParentTelegram } from '@/app/actions/profile'
import { Send } from 'lucide-react'
import { useState } from 'react'

interface TelegramFormProps {
  initialName: string
  initialChatId: string
}

export default function TelegramForm({ initialName, initialChatId }: TelegramFormProps) {
  const [parentName, setParentName] = useState(initialName)
  const [chatId, setChatId] = useState(initialChatId)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatId.trim()) {
      showToast('Telegram Chat ID kiriting', 'error')
      return
    }
    setLoading(true)
    const result = await updateParentTelegram({
      parent_name: parentName.trim(),
      parent_telegram_id: chatId.trim(),
    })
    setLoading(false)
    if (result.success) {
      showToast("Telegram ma'lumotlari saqlandi! ✅", 'success')
    } else {
      showToast(result.error || 'Xatolik yuz berdi', 'error')
    }
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Ota-ona ismi</label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Masalan: Karimov Sardor"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Telegram Chat ID</label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Masalan: 123456789"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Chat ID olish uchun: Telegramda <span className="font-semibold text-indigo-500">@iqro_notify_bot</span> ga <code className="bg-gray-100 px-1 rounded">/start</code> yuboring
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={14} />
          {loading ? 'Saqlanmoqda...' : "💾 Saqlash"}
        </button>
      </form>
    </>
  )
}
