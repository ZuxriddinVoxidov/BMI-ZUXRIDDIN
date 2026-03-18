'use client'

import { createClient } from '@/lib/supabase/client'
import { Check, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { approveParentRequest } from '@/app/actions/admin-students'

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
  const [showModal, setShowModal] = useState<RequestRecord | null>(null)
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [processing, setProcessing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setLoading(true)
    const { data } = await supabase
      .from('parent_registration_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    setRequests(data || [])
    
    // Pre-load students
    const { data: stds } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'student')
    setStudents(stds || [])
    
    setLoading(false)
  }

  async function handleApprove() {
    if (!showModal || !selectedStudent) return
    setProcessing(true)
    try {
      const result = await approveParentRequest(showModal.id, selectedStudent, showModal.chat_id)
      
      if (result.success) {
        alert("Muvaffaqiyatli biriktirildi!")
        setShowModal(null)
        setSelectedStudent('')
        setRequests(reqs => reqs.filter(r => r.id !== showModal.id))
      } else {
        alert("Xatolik: " + result.error)
      }
    } catch (e) {
      alert("Xatolik yuz berdi")
    }
    setProcessing(false)
  }

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return null
  if (requests.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 overflow-hidden mt-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-900">Telegram Ulanish So&apos;rovlari</h2>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {requests.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="py-3 px-4 font-medium">Ota-ona</th>
              <th className="py-3 px-4 font-medium">Farzand</th>
              <th className="py-3 px-4 font-medium text-right">Amal</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <td className="py-4 px-4 font-medium text-gray-900">
                  {req.parent_name}
                  <div className="text-xs text-gray-400 font-normal">Chat ID: {req.chat_id}</div>
                </td>
                <td className="py-4 px-4 text-gray-600">{req.child_name}</td>
                <td className="py-4 px-4 text-right">
                  <button 
                    onClick={() => {
                      setSearch(req.child_name)
                      setShowModal(req)
                    }}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-lg text-xs transition">
                    Biriktirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
             <button onClick={() => setShowModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
               <X size={20} />
             </button>
             
             <h3 className="font-bold text-lg text-gray-900 mb-1">O&apos;quvchiga biriktirish</h3>
             <p className="text-sm text-gray-500 mb-4">Qidirilgan matn: <span className="font-semibold text-gray-900">{showModal.child_name}</span></p>

             <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="O'quvchini izlash..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
             </div>

             <div className="border border-gray-100 rounded-xl divide-y max-h-48 overflow-y-auto mb-4">
               {filteredStudents.length > 0 ? filteredStudents.map(s => (
                 <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                   <input type="radio" name="student" onChange={() => setSelectedStudent(s.id)} checked={selectedStudent === s.id} className="text-indigo-600" />
                   <span className="text-sm font-medium text-gray-900">{s.full_name}</span>
                 </label>
               )) : (
                 <div className="p-4 text-center text-sm text-gray-500">O&apos;quvchi topilmadi</div>
               )}
             </div>

             <button 
                onClick={handleApprove}
                disabled={!selectedStudent || processing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                {processing ? 'Bajarilmoqda...' : <><Check size={16} /> Tasdiqlash</>}
             </button>
           </div>
        </div>
      )}
    </div>
  )
}
