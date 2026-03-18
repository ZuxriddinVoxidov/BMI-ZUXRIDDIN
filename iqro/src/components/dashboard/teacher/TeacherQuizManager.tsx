'use client'

import { useState, useTransition } from 'react'
import { Plus, X, List, Calendar, HelpCircle, Save, CheckCircle, Clock, Trash2, ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { Quiz, QuizQuestion, createQuiz, updateQuiz, publishQuiz, startQuiz, finishQuiz, deleteQuiz } from '@/app/actions/quiz'

interface TeacherQuizManagerProps {
  clubs: Record<string, unknown>[]
  quizzes: Quiz[]
  participants?: any[]
  sessions?: { quiz_id: string, started_at: string, finished_at: string | null }[]
}

type QuizState = 'list' | 'generate' | 'edit'

export default function TeacherQuizManager({ clubs, quizzes: initialQuizzes, participants, sessions }: TeacherQuizManagerProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes)
  const [currentState, setCurrentState] = useState<QuizState>('list')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Generate State Variables
  const [selClubId, setSelClubId] = useState('')
  const [topic, setTopic] = useState('')
  const [qCount, setQCount] = useState<number>(10)
  const [durationMins, setDurationMins] = useState<number>(15)

  // Edit State Variables
  const [editQuizId, setEditQuizId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editDurationSecs, setEditDurationSecs] = useState<number>(900)
  const [editQuestions, setEditQuestions] = useState<QuizQuestion[]>([])

  // Filter State Variables
  const [filterClub, setFilterClub] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredQuizzes = quizzes.filter(q => {
    const clubMatch = filterClub === 'all' || q.club_id === filterClub
    const statusMatch = filterStatus === 'all' || q.status === filterStatus
    return clubMatch && statusMatch
  })

  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null)

  // ----- Actions -----

  async function handleAIGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!selClubId || !topic.trim() || !qCount || !durationMins) return

    const selectedClub = clubs.find(c => c.id === selClubId) as Record<string, any> | undefined

    startTransition(async () => {
      try {
        const response = await fetch('/api/ai/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic, 
            count: qCount, 
            clubId: selClubId,
            clubName: selectedClub?.name,
            targetGrades: (selectedClub?.target_grades as string[])?.join(', ') || ''
          })
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Server xatosi')
        }

        const data = await response.json()
        const fetchedQs = data.questions || []
        
        setEditQuizId(null) // It's a new quiz
        setEditTitle(`${topic} (AI Test)`)
        setEditDesc('')
        setEditDurationSecs(durationMins * 60)
        setEditQuestions(fetchedQs)
        setCurrentState('edit')

      } catch (err: any) {
        toast({ title: err.message || 'Xatolik', variant: 'destructive' })
      }
    })
  }

  function handleAddEmptyQuestion() {
    setEditQuestions([
      ...editQuestions, 
      { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', order_index: editQuestions.length }
    ])
  }

  function handleDelQuestion(idx: number) {
    setEditQuestions(editQuestions.filter((_, i) => i !== idx))
  }

  function handleUpdateQ(idx: number, field: keyof QuizQuestion, val: string) {
    const updated = [...editQuestions]
    updated[idx] = { ...updated[idx], [field]: val }
    setEditQuestions(updated)
  }

  async function handleSaveDraft() {
    if (!selClubId || !editTitle.trim() || editQuestions.length === 0) return
    startTransition(async () => {
      let result;
      if (editQuizId) {
        result = await updateQuiz(editQuizId, editTitle, editDesc, editDurationSecs, editQuestions)
      } else {
        result = await createQuiz(selClubId, editTitle, editDesc, editDurationSecs, editQuestions)
      }

      if (result.success) {
        toast({ title: 'Saqlandi' })
        window.location.reload()
      } else {
        toast({ title: result.error || 'Xatolik', variant: 'destructive' })
      }
    })
  }

  async function handlePublish() {
    if (!selClubId || !editTitle.trim() || editQuestions.length === 0) return
    if (!confirm('Test nashr qilinsinmi? (O\'quvchilarga ko\'rinadi, lekin hali boshlanmaydi)')) return
    
    startTransition(async () => {
      let result;
      let qId = editQuizId;
      if (editQuizId) {
        result = await updateQuiz(editQuizId, editTitle, editDesc, editDurationSecs, editQuestions)
      } else {
        result = await createQuiz(selClubId, editTitle, editDesc, editDurationSecs, editQuestions)
        qId = result.quizId || null
      }

      if (result.success && qId) {
        const pRes = await publishQuiz(qId)
        if (pRes.success) {
          toast({ title: 'Nashr qilindi' })
          window.location.reload()
        } else {
          toast({ title: pRes.error || 'Xatolik', variant: 'destructive' })
        }
      } else {
        toast({ title: result.error || 'Saqlashda xatolik', variant: 'destructive' })
      }
    })
  }

  async function handleActionClick(q: Quiz, action: 'publish' | 'start' | 'finish' | 'delete') {
    startTransition(async () => {
      let res;
      if (action === 'publish') res = await publishQuiz(q.id)
      if (action === 'start') res = await startQuiz(q.id)
      if (action === 'finish') {
        if (!confirm('Testni yakunlab bali hisoblansinmi?')) return
        res = await finishQuiz(q.id)
      }
      if (action === 'delete') {
        if (!confirm('Ushbu testni butunlay o\'chirib tashlashni tasdiqlaysizmi?')) return
        res = await deleteQuiz(q.id)
      }
      
      if (res?.success) {
        toast({ title: 'Muvaffaqiyatli' })
        window.location.reload()
      } else {
        toast({ title: res?.error || 'Xatolik', variant: 'destructive' })
      }
    })
  }

  function openEdit(q: Quiz) {
    setSelClubId(q.club_id)
    setEditQuizId(q.id)
    setEditTitle(q.title)
    setEditDesc(q.description || '')
    setEditDurationSecs(q.duration_seconds)
    setEditQuestions(q.quiz_questions || [])
    setCurrentState('edit')
  }

  // ----- Renders -----

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('uz-UZ', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tashkent'
    })
  }

  const renderQuizCard = (q: Quiz) => {
    const clubName = (clubs.find(c => c.id === q.club_id) as any)?.name || 'To\'garak'
    const qCount = q.quiz_questions?.length || 0

    const session = sessions?.find(s => s.quiz_id === q.id)
    const displayDate = (q.status === 'finished' && session?.started_at) 
      ? session.started_at 
      : q.created_at

    return (
      <div key={q.id}>
      <div className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-200 transition-colors">
        <div>
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            {q.title}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
              ${q.status === 'draft' ? 'bg-gray-100 text-gray-600' : ''}
              ${q.status === 'waiting' ? 'bg-blue-100 text-blue-600' : ''}
              ${q.status === 'active' ? 'bg-amber-100 text-amber-600' : ''}
              ${q.status === 'finished' ? 'bg-emerald-100 text-emerald-600' : ''}
            `}>
              {q.status === 'draft' && 'Qoralama'}
              {q.status === 'waiting' && 'Kutmoqda'}
              {q.status === 'active' && 'Jarayonda'}
              {q.status === 'finished' && 'Yakunlangan'}
            </span>
          </h4>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span>{clubName}</span>
            <span className="flex items-center gap-1"><HelpCircle size={12}/>{qCount} ta savol</span>
            <span className="flex items-center gap-1"><Clock size={12}/>{Math.round(q.duration_seconds/60)} daq</span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              🗓 {formatDate(displayDate)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          {q.status === 'draft' && (
            <>
              <button disabled={isPending} onClick={() => openEdit(q)} className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors">Tahrirlash</button>
              <button disabled={isPending} onClick={() => handleActionClick(q, 'publish')} className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors">Nashr qilish</button>
            </>
          )}
          {q.status === 'waiting' && (
            <Link href={`/teacher/quiz/${q.id}/live`} className="w-full sm:w-auto px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors animate-pulse flex items-center justify-center gap-1.5"><Play size={14}/> Boshlash</Link>
          )}
          {q.status === 'active' && (
            <Link href={`/teacher/quiz/${q.id}/live`} className="w-full sm:w-auto px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">Davom etish <ArrowRight size={14}/></Link>
          )}
          {q.status === 'finished' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setExpandedQuizId(expandedQuizId === q.id ? null : q.id)} 
                className="px-4 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors"
               >
                📊 Natijalar
              </button>
              <button disabled={isPending} onClick={() => handleActionClick(q, 'delete')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={16}/>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {q.status === 'finished' && expandedQuizId === q.id && (
        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="bg-gray-50 border-x border-b rounded-b-xl p-4 -mt-2 mb-2">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Ishtirokchilar natijalari ({new Date(q.created_at).toLocaleDateString()})</h4>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 font-semibold text-gray-600 w-16 text-center">O&apos;rin</th>
                  <th className="px-4 py-2 font-semibold text-gray-600">O&apos;quvchi</th>
                  <th className="px-4 py-2 font-semibold text-gray-600 text-right">Natija</th>
                  <th className="px-4 py-2 font-semibold text-gray-600 w-20 text-right">Ball</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {participants?.filter(p => p.quiz_id === q.id).sort((a,b) => (b.score || 0) - (a.score || 0)).map((p, i) => {
                  const points = i === 0 ? 15 : i === 1 ? 12 : i === 2 ? 9 : i === 3 ? 6 : i === 4 ? 3 : 0;
                  return (
                  <tr key={p.student_id} className={i < 3 ? 'bg-amber-50/30' : ''}>
                    <td className="px-4 py-3 text-center text-lg">
                      {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : <span className="text-sm font-bold text-gray-500">{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.profiles?.full_name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-indigo-600">{p.score || 0}</span>
                      <span className="text-gray-400 text-xs ml-1">/{qCount}</span>
                      <span className="text-xs text-gray-400 ml-1">({Math.round(((p.score || 0)/qCount)*100) || 0}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-black ${points > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                        {points > 0 ? `+${points}` : '-'}
                      </span>
                    </td>
                  </tr>
                )})}
                {(!participants || participants.filter(p => p.quiz_id === q.id).length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">Ishtirokchilar topilmadi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      </div>
    )
  }

  const selectedClubObj = clubs.find(c => c.id === selClubId) as Record<string, any> | undefined
  const getPlaceholder = (category: string | null) => {
    const cat = (category || '').toLowerCase()
    if (cat.includes('biologiya') || cat.includes('bio')) 
      return 'Masalan: Hujayraning tuzilishi, Fotosintez, Odam anatomiyasi'
    if (cat.includes('matematika') || cat.includes('mat')) 
      return 'Masalan: Kasrlar, Uchburchaklar, Algebraik ifodalar'
    if (cat.includes('fizika')) 
      return 'Masalan: Mexanika, Elektr, Optika'
    if (cat.includes('kimyo')) 
      return 'Masalan: Davriy jadval, Kimyoviy reaksiyalar'
    if (cat.includes('tarix')) 
      return 'Masalan: Mustaqillik davri, Buyuk ipak yoli'
    if (cat.includes('ingliz') || cat.includes('til') || cat.includes('english')) 
      return 'Masalan: Past tense, Vocabulary, Grammar'
    if (cat.includes('adabiyot')) 
      return 'Masalan: Navoiy asarlari, She\'riy janrlar'
    if (cat.includes('informatika') || cat.includes('it') || cat.includes('texno')) 
      return 'Masalan: Algoritm, Dasturlash asoslari'
    return 'Masalan: Mavzu nomi, Bob yoki bo\'lim nomi'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          Testlar
          {isPending && <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full animate-pulse">Yuklanmoqda...</span>}
        </h1>
        {currentState === 'list' && (
          <button 
            onClick={() => {
              setCurrentState('generate')
              const firstClub = clubs[0] as Record<string, any> | undefined
              if (firstClub) {
                setSelClubId(firstClub.id)
                setTopic('')
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus size={16} /> Yangi test
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* ================= STATE 1: LIST ================= */}
        {currentState === 'list' && (
          <motion.div key="list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-8">
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 mb-2">
              <select 
                value={filterClub} 
                onChange={e => setFilterClub(e.target.value)}
                className="px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm font-medium"
              >
                <option value="all">Barcha to&apos;garaklar</option>
                {clubs.map(c => (
                  <option key={c.id as string} value={c.id as string}>{c.name as string}</option>
                ))}
              </select>

              <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                 {[
                   { id: 'all', label: 'Barchasi' },
                   { id: 'draft', label: 'Qoralama' },
                   { id: 'finished', label: 'Yakunlangan' }
                 ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setFilterStatus(tab.id)}
                     className={`px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap transition-colors ${filterStatus === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                     {tab.label}
                   </button>
                 ))}
              </div>
            </div>

            {filteredQuizzes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <HelpCircle size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Testlar topilmadi</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Filtrga mos test mavjud emas yoki yangi test yarating</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuizzes.map(renderQuizCard)}
              </div>
            )}
          </motion.div>
        )}

        {/* ================= STATE 2: GENERATE ================= */}
        {currentState === 'generate' && (
          <motion.div key="gen" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="bg-white rounded-2xl border p-6 max-w-2xl mx-auto shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Yangi test yaratish</h2>
              <button disabled={isPending} onClick={() => setCurrentState('list')} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20}/></button>
            </div>

            <form onSubmit={handleAIGenerate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qaysi to&apos;garak uchun?</label>
                <select value={selClubId} onChange={e => {
                  const newId = e.target.value
                  setSelClubId(newId)
                  const targetClub = clubs.find(c => c.id === newId) as Record<string, any> | undefined
                  if (targetClub) {
                    setTopic('')
                  }
                }} required className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 bg-gray-50 text-sm">
                  {clubs.map(c => (
                    <option key={c.id as string} value={c.id as string}>{c.name as string}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mavzu (AI shu bo&apos;yicha test tuzadi)</label>
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder={getPlaceholder(selectedClubObj?.category as string | null)} required className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 bg-gray-50 text-sm"/>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Savollar soni</label>
                  <input type="number" min={5} max={25} value={qCount} onChange={e => setQCount(parseInt(e.target.value))} required className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 bg-gray-50 text-sm"/>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Davomiyligi (Daqiqa)</label>
                  <input type="number" min={1} max={60} value={durationMins} onChange={e => setDurationMins(parseInt(e.target.value))} required className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 bg-gray-50 text-sm"/>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={isPending} onClick={() => {
                  setEditQuizId(null)
                  setEditTitle('Yangi Test')
                  setEditDesc('')
                  setEditDurationSecs(15*60)
                  setEditQuestions([])
                  setCurrentState('edit')
                }} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Qo&apos;lda tuzish
                </button>
                <button type="submit" disabled={isPending || !topic.trim()} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2">
                  {isPending ? 'AI Yaratmoqda...' : '✨ AI bilan yaratish'}
                </button>
              </div>

              {isPending && (
                <div className="text-center mt-4">
                  <p className="text-sm text-indigo-600 animate-pulse font-medium">Iltimos kuting, Sun&apos;iy intellekt savollarni shakllantirmoqda...</p>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {/* ================= STATE 3: EDIT ================= */}
        {currentState === 'edit' && (
          <motion.div key="edit" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="bg-white rounded-2xl border shadow-lg overflow-hidden flex flex-col h-[calc(100vh-140px)]">
            
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-gray-50/50 p-4 px-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{editTitle || 'Yangi test'}</h2>
                <p className="text-xs text-gray-500">{editQuestions.length} ta savol | {Math.round(editDurationSecs/60)} daqiqa</p>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={isPending} onClick={() => {if(confirm('Tahrirlashni bekor qilasizmi?')) setCurrentState('list')}} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border rounded-lg hover:bg-gray-50">Bekor qilish</button>
                <button disabled={isPending} onClick={handleSaveDraft} className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-sm flex items-center gap-1"><Save size={14}/>Qoralama</button>
                <button disabled={isPending} onClick={handlePublish} className="px-4 py-1.5 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.3)]">Darhol Nashr Qilish</button>
              </div>
            </div>

            {/* Content body Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Meta Inputs */}
                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Test Sarlavhasi</label>
                    <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="w-full text-lg font-bold text-gray-900 border-b-2 border-transparent focus:border-indigo-500 py-1 outline-none transition-colors" placeholder="Test nomini kiriting..."/>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Davomiyligi (Daqiqa)</label>
                      <input type="number" value={Math.round(editDurationSecs/60)} onChange={e=>setEditDurationSecs(parseInt(e.target.value)*60)} className="w-full text-sm bg-gray-50 border rounded-lg p-2.5 outline-none"/>
                    </div>
                    {/* Club Select needed if manually created */}
                    {!editQuizId && (
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">To&apos;garak</label>
                        <select value={selClubId} onChange={e=>setSelClubId(e.target.value)} className="w-full text-sm bg-gray-50 border rounded-lg p-2.5 outline-none">
                          <option value="" disabled>Tanlang</option>
                          {clubs.map(c => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase pl-2">Savollar ro&apos;yxati ({editQuestions.length})</h3>
                  
                  {editQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative group">
                      <div className="absolute top-4 right-4 animate-fade-in group-hover:opacity-100 opacity-0 transition-opacity">
                         <button disabled={isPending} onClick={() => handleDelQuestion(idx)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                      
                      <div className="flex gap-3 pr-10">
                        <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">{idx + 1}</span>
                        <div className="flex-1 space-y-4">
                          <textarea 
                            value={q.question} 
                            onChange={e=>handleUpdateQ(idx, 'question', e.target.value)} 
                            placeholder="Savol matnini kiriting..." 
                            rows={2}
                            className="w-full text-base font-medium text-gray-900 outline-none resize-none bg-transparent placeholder-gray-300"
                          />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {['A','B','C','D'].map(opt => {
                              const valKey = `option_${opt.toLowerCase()}` as keyof QuizQuestion;
                              const isCorrect = q.correct_answer === opt;
                              return (
                                <div key={opt} className={`flex items-center gap-2 border rounded-xl p-2.5 transition-colors ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                  <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                                    <input type="radio" name={`correct-${idx}`} checked={isCorrect} onChange={() => handleUpdateQ(idx, 'correct_answer', opt)} className="w-4 h-4 text-emerald-600"/>
                                    <span className={`font-bold text-sm ${isCorrect ? 'text-emerald-700' : 'text-gray-500'}`}>{opt}:</span>
                                  </label>
                                  <input 
                                    value={q[valKey] as string} 
                                    onChange={e=>handleUpdateQ(idx, valKey, e.target.value)} 
                                    className="flex-1 min-w-0 bg-transparent text-sm text-gray-800 outline-none" 
                                    placeholder="Variant matni..."
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button disabled={isPending} onClick={handleAddEmptyQuestion} className="w-full py-4 border-2 border-dashed border-indigo-200 text-indigo-500 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2">
                    <Plus size={18} /> Yangi savol qo&apos;shish
                  </button>
                </div>

              </div>
            </div>
            
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
