'use client'

import { useState, useTransition } from 'react'
import { Plus, X, List, Calendar, HelpCircle, Save, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { Quiz, QuizQuestion, createQuiz, updateQuiz, publishQuiz, startQuiz, finishQuiz } from '@/app/actions/quiz'

interface TeacherQuizManagerProps {
  clubs: Record<string, unknown>[]
  quizzes: Quiz[]
}

type QuizState = 'list' | 'generate' | 'edit'

export default function TeacherQuizManager({ clubs, quizzes: initialQuizzes }: TeacherQuizManagerProps) {
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

  // Helper groupings
  const drafts = quizzes.filter(q => q.status === 'draft')
  const waiting = quizzes.filter(q => q.status === 'waiting')
  const active = quizzes.filter(q => q.status === 'active')
  const finished = quizzes.filter(q => q.status === 'finished')

  // ----- Actions -----

  async function handleAIGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!selClubId || !topic.trim() || !qCount || !durationMins) return

    startTransition(async () => {
      try {
        const response = await fetch('/api/ai/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, count: qCount, clubId: selClubId })
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

  async function handleActionClick(q: Quiz, action: 'publish' | 'start' | 'finish') {
    startTransition(async () => {
      let res;
      if (action === 'publish') res = await publishQuiz(q.id)
      if (action === 'start') res = await startQuiz(q.id)
      if (action === 'finish') {
        if (!confirm('Testni yakunlab bali hisoblansinmi?')) return
        res = await finishQuiz(q.id)
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

  const renderQuizCard = (q: Quiz) => {
    const clubName = (clubs.find(c => c.id === q.club_id) as any)?.name || 'To\'garak'
    const qCount = q.quiz_questions?.length || 0

    return (
      <div key={q.id} className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-200 transition-colors">
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
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {q.status === 'draft' && (
            <>
              <button disabled={isPending} onClick={() => openEdit(q)} className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors">Tahrirlash</button>
              <button disabled={isPending} onClick={() => handleActionClick(q, 'publish')} className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors">Nashr qilish</button>
            </>
          )}
          {q.status === 'waiting' && (
            <button disabled={isPending} onClick={() => handleActionClick(q, 'start')} className="w-full sm:w-auto px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors animate-pulse">Boshlash</button>
          )}
          {q.status === 'active' && (
            <button disabled={isPending} onClick={() => handleActionClick(q, 'finish')} className="w-full sm:w-auto px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors">Yakunlash</button>
          )}
          {q.status === 'finished' && (
            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle size={16}/> Natijalar hisoblangan</span>
          )}
        </div>
      </div>
    )
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
              setSelClubId(clubs[0]?.id as string || '')
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
            {quizzes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <HelpCircle size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Hozircha testlar yo&apos;q</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Tepa o&apos;ngdagi tugma orqali test yarating</p>
              </div>
            ) : (
              <>
                {active.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-2">Jarayondagi testlar</h3>
                    {active.map(renderQuizCard)}
                  </div>
                )}
                
                {waiting.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-2">Kutmoqda (Boshlash mumkin)</h3>
                    {waiting.map(renderQuizCard)}
                  </div>
                )}

                {drafts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">Qoralamalar</h3>
                    {drafts.map(renderQuizCard)}
                  </div>
                )}

                {finished.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-2">Yakunlangan</h3>
                    {finished.map(renderQuizCard)}
                  </div>
                )}
              </>
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
                <select value={selClubId} onChange={e => setSelClubId(e.target.value)} required className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 bg-gray-50 text-sm">
                  {clubs.map(c => (
                    <option key={c.id as string} value={c.id as string}>{c.name as string}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mavzu (AI shu bo&apos;yicha test tuzadi)</label>
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Masalan: O'zbekiston tarixi (Temuriylar davri)" required className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 bg-gray-50 text-sm"/>
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
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mavzu (Ixtiyoriy)</label>
                    <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={2} className="w-full text-sm text-gray-700 bg-gray-50 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Ushbu test nima haqida..."/>
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
