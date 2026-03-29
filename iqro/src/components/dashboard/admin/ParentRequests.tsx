'use client'

import { createClient } from '@/lib/supabase/client'
import { Check, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { approveParentRequest, rejectParentRequest } from '@/app/actions/admin-students'

interface RequestRecord {
  id: string
  chat_id: number
  parent_name: string
  child_name: string
  status: string
  created_at: string
}

export default function ParentRequests() {
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadRequests()
  }, [page])

  async function loadRequests() {
    setLoading(true)
    const { data, count } = await supabase
      .from('parent_registration_requests')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range((page - 1) * 10, page * 10 - 1)
      
    setRequests(data as RequestRecord[] || [])
    if (count !== null) setHasMore(count > (page * 10))
    setLoading(false)
  }

  async function handleApprove(req: any) {
    setProcessing(true)
    try {
      const result = await approveParentRequest(req.id, req.child_name, req.chat_id, req.parent_name)
      
      if (result.success) {
        alert("Muvaffaqiyatli biriktirildi!")
        setRequests(reqs => reqs.filter(r => r.id !== req.id))
      } else {
        alert("Xatolik: ushbu ismdagi o'quvchi topilmadi yoki xato yuz berdi. " + result.error)
      }
    } catch (e) {
      alert("Xatolik yuz berdi")
    }
    setProcessing(false)
  }

  async function handleReject(requestId: string, chatId: number) {
    setProcessing(true)
    try {
      const result = await rejectParentRequest(requestId, chatId)
      if (result.success) {
        setRequests(reqs => reqs.filter(r => r.id !== requestId))
        if (requests.length === 1 && page > 1) {
          setPage(p => p - 1)
        } else {
          loadRequests() // Reload to fetch the next item filling the 10th spot
        }
      } else {
        alert("Xatolik: " + result.error)
      }
    } catch (e) {
      alert("Xatolik yuz berdi")
    }
    setProcessing(false)
  }

  if (loading) return null
  if (requests.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 overflow-hidden mt-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Telegram ulanish so&apos;rovlari</h2>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {requests.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400">
              <th className="py-3 px-4 font-medium">Ota-ona</th>
              <th className="py-3 px-4 font-medium">Farzand</th>
              <th className="py-3 px-4 font-medium text-right">Amal</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                  {req.parent_name}
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-normal">Chat ID: {req.chat_id}</div>
                </td>
                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{req.child_name}</td>
                <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleApprove(req)}
                    disabled={processing}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-lg text-xs transition disabled:opacity-50">
                    Biriktirish
                  </button>
                  <button 
                    onClick={() => handleReject(req.id, req.chat_id)}
                    disabled={processing}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition disabled:opacity-50">
                    Rad etish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading || processing}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition"
        >
          Oldingi
        </button>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Sahifa: {page}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore || loading || processing}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition"
        >
          Keyingi
        </button>
      </div>


    </div>
  )
}
