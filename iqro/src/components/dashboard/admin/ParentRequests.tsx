'use client'

import { createClient } from '@/lib/supabase/client'
import { Check, Search, X, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { approveParentRequest, rejectParentRequest, searchStudentForParent } from '@/app/actions/admin-students'

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

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReq, setSelectedReq] = useState<RequestRecord | null>(null)
  const [matchedStudent, setMatchedStudent] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(false)

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

  async function handleBiriktirishClick(req: RequestRecord) {
    setSelectedReq(req)
    setMatchedStudent(null)
    setModalOpen(true)
    setSearchLoading(true)
    
    const { success, data } = await searchStudentForParent(req.child_name)
    if (success && data) {
      setMatchedStudent(data)
    }
    setSearchLoading(false)
  }

  async function handleConfirmApprove() {
    if (!selectedReq || !matchedStudent) return
    setProcessing(true)
    try {
      const result = await approveParentRequest(selectedReq.id, matchedStudent.id, selectedReq.chat_id, selectedReq.parent_name)
      
      if (result.success) {
        alert(`✅ ${selectedReq.parent_name} \u2192 ${matchedStudent.full_name} ga biriktirildi`)
        setRequests(reqs => reqs.filter(r => r.id !== selectedReq.id))
        setModalOpen(false)
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
                    onClick={() => handleBiriktirishClick(req)}
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

      {/* Confirmation Modal */}
      {modalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            {searchLoading ? (
              <div className="p-8 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium">O&apos;quvchi qidirilmoqda...</p>
              </div>
            ) : matchedStudent ? (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-green-600">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">O&apos;quvchi topildi</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p><span className="text-gray-500">Ota-ona:</span> <strong className="text-gray-900 dark:text-white">{selectedReq.parent_name}</strong></p>
                    <p><span className="text-gray-500">Farzand (bot yozgan):</span> <strong className="text-gray-900 dark:text-white">{selectedReq.child_name}</strong></p>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                    <p><span className="text-indigo-900 dark:text-indigo-200">Topilgan o&apos;quvchi:</span> <strong className="text-indigo-700 dark:text-indigo-400">{matchedStudent.full_name}</strong></p>
                    <p><span className="text-indigo-900 dark:text-indigo-200">Sinf:</span> <strong className="text-indigo-700 dark:text-indigo-400">{matchedStudent.grade || '-'}</strong></p>
                    <p><span className="text-indigo-900 dark:text-indigo-200">Maktab:</span> <strong className="text-indigo-700 dark:text-indigo-400">46-maktab</strong></p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setModalOpen(false)}
                    disabled={processing}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition disabled:opacity-50">
                    Bekor qilish
                  </button>
                  <button 
                    onClick={handleConfirmApprove}
                    disabled={processing}
                    className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Tasdiqlash
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <X className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">O&apos;quvchi topilmadi</h3>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-6 text-sm text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/50">
                  <p><strong>&quot;{selectedReq.child_name}&quot;</strong> ismli o&apos;quvchi tizimda mavjud emas.</p>
                  <p className="mt-2">Iltimos, ismni tekshiring yoki o&apos;quvchini avval tizimga qo&apos;shing.</p>
                </div>

                <button 
                  onClick={() => setModalOpen(false)}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition">
                  Yopish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
