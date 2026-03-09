'use client'

import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Hozir'
  if (m < 60) return `${m} daqiqa oldin`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} soat oldin`
  return `${Math.floor(h / 24)} kun oldin`
}

export default function NotificationBell({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [resolvedUserId, setResolvedUserId] = useState(userId || '')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchNotifications = useCallback(async (uid: string) => {
    if (!uid) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data || [])
  }, [supabase])

  async function markAllRead() {
    if (!resolvedUserId) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', resolvedUserId).eq('is_read', false)
    fetchNotifications(resolvedUserId)
  }

  async function markOneRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    fetchNotifications(resolvedUserId)
  }

  useEffect(() => {
    async function init() {
      let uid = userId || ''
      if (!uid) {
        // Auto-resolve userId from auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase
          .from('profiles').select('id').eq('user_id', user.id).single()
        if (!profile) return
        uid = profile.id as string
        setResolvedUserId(uid)
      }
      fetchNotifications(uid)

      const channel = supabase
        .channel(`notif-${uid}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, () => fetchNotifications(uid!))
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [userId, supabase, fetchNotifications])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-800 text-sm">Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Hammasini o&apos;qilgan
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-gray-500 text-sm">Bildirishnomalar yo&apos;q</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} onClick={() => !n.is_read && markOneRead(n.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-indigo-50/50' : ''}`}>
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-indigo-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
