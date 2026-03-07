'use client'

import { markAllNotificationsRead } from '@/app/actions/notifications'
import { Bell, X } from 'lucide-react'
import { useState, useTransition } from 'react'

interface Notification {
  id: string
  message: string
  is_read: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Hozirgina'
  if (mins < 60) return `${mins} daqiqa oldin`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  return `${days} kun oldin`
}

export default function StudentHeader({
  fullName,
  profileId,
  notifications,
  unreadCount,
}: {
  fullName: string
  profileId: string
  notifications: Notification[]
  unreadCount: number
}) {
  const firstName = fullName?.split(' ')[0] || "O'quvchi"
  const initials = fullName
    ? fullName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'OQ'

  const [showPanel, setShowPanel] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [localUnread, setLocalUnread] = useState(unreadCount)
  const [localNotifs, setLocalNotifs] = useState(notifications)

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead(profileId)
      setLocalUnread(0)
      setLocalNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    })
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <p className="text-sm font-semibold text-gray-900">
        Salom, {firstName}! 👋
      </p>
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {localUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {localUnread}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showPanel && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
                <h3 className="font-bold text-sm text-gray-800">Bildirishnomalar</h3>
                <div className="flex items-center gap-2">
                  {localUnread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={isPending}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Hammasini o&apos;qilgan
                    </button>
                  )}
                  <button onClick={() => setShowPanel(false)}><X size={16} className="text-gray-400" /></button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {localNotifs.length > 0 ? (
                  localNotifs.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-gray-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-300">
                    <p className="text-2xl mb-2">🔔</p>
                    <p className="text-sm">Bildirishnomalar yo&apos;q</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700">{firstName}</span>
        </div>
      </div>
    </header>
  )
}
