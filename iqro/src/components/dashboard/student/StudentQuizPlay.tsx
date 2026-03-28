'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Loader2, CheckCircle, Trophy } from 'lucide-react'
import { submitAnswers } from '@/app/actions/quiz'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface QuizQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

interface AnsweredQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  order_index: number
  student_answer: string | null
  is_correct: boolean
}

interface Participant {
  student_id: string
  score: number
  full_name: string
}

interface QuizPlayProps {
  quiz: {
    id: string
    title: string
    status: string
    duration_seconds: number
    clubs: { name: string }
    quiz_questions: QuizQuestion[]
  }
  participation: {
    id: string
    student_id: string
    score: number | null
    finished_at: string | null
  } | null
}

export default function StudentQuizPlay({ quiz, participation }: QuizPlayProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  const [studentRank, setStudentRank] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<Participant[]>([])
  const [reviewQuestions, setReviewQuestions] = useState<AnsweredQuestion[]>([])

  const [status, setStatus] = useState(quiz.status)
  const [timeLeft, setTimeLeft] = useState(quiz.duration_seconds)

  const [currQIdx, setCurrQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const [finalScore, setFinalScore] = useState<number | null>(participation?.score ?? null)

  const fetchResultsData = useCallback(async () => {
    try {
      // Fetch leaderboard
      const res = await fetch(`/api/quiz/${quiz.id}/participants`)
      if (res.ok) {
        const data = await res.json()
        const participants: Participant[] = data.participants || []
        setLeaderboard(participants)
        const myId = participation?.student_id
        const rankIndex = participants.findIndex(p => p.student_id === myId)
        if (rankIndex !== -1) setStudentRank(rankIndex + 1)
      }
    } catch (_) { /* ignore */ }

    try {
      // Fetch per-question answers review
      const res2 = await fetch(`/api/quiz/${quiz.id}/answers`)
      if (res2.ok) {
        const data2 = await res2.json()
        setReviewQuestions(data2.questions || [])
      }
    } catch (_) { /* ignore */ }
  }, [quiz.id, participation?.student_id])

  // Real-time status update — when teacher ends quiz OR it transitions
  useEffect(() => {
    if (status === 'finished') {
      fetchResultsData()
      return
    }

    const channel = supabase
      .channel('quiz-status-student-' + quiz.id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quizzes',
        filter: `id=eq.${quiz.id}`
      }, (payload: Record<string, Record<string, string>>) => {
        const newStatus = payload.new.status
        if (newStatus === 'active' && status === 'waiting') {
          setStatus('active')
          toast({ title: 'Test boshlandi! Omad! 🎯' })
        }
        if (newStatus === 'finished') {
          setStatus('finished')
          fetchResultsData()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [quiz.id, status, supabase, toast, fetchResultsData])

  // Poll for status every 3 seconds while submitting (teacher may finish before results fully load)
  useEffect(() => {
    if (status !== 'submitting') return
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('quizzes')
        .select('status')
        .eq('id', quiz.id)
        .single()
      if (data?.status === 'finished') {
        setStatus('finished')
        fetchResultsData()
      }
    }, 3000)
    return () => clearInterval(poll)
  }, [status, quiz.id, supabase, fetchResultsData])

  // Timer for active quiz
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (status === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (status === 'active' && timeLeft === 0) {
      handleSubmit()
    }
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, timeLeft])

  function handleSelect(opt: string) {
    const qId = quiz.quiz_questions[currQIdx].id
    setAnswers(prev => ({ ...prev, [qId]: opt }))
  }

  async function handleSubmit() {
    if (status === 'submitting' || status === 'finished') return
    setStatus('submitting')
    startTransition(async () => {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans as 'A' | 'B' | 'C' | 'D'
      }))
      const res = await submitAnswers(quiz.id, formattedAnswers)
      if (res.success) {
        setFinalScore(res.score ?? 0)
        toast({ title: 'Javoblar qabul qilindi ✅' })
      } else {
        toast({ title: res.error || 'Tarmoq xatosi', variant: 'destructive' })
        setStatus('active')
      }
    })
  }

  const m = Math.floor(timeLeft / 60)
  const s = timeLeft % 60
  const timeString = `${m}:${s.toString().padStart(2, '0')}`
  const totalQ = quiz.quiz_questions?.length || 0

  // Option label → text mapping
  function getOptionText(q: { option_a: string; option_b: string; option_c: string; option_d: string }, opt: string): string {
    const map: Record<string, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d }
    return map[opt] || ''
  }

  const correctCount = reviewQuestions.filter(q => q.is_correct).length
  const percentScore = totalQ > 0 ? Math.round((((finalScore ?? 0)) / totalQ) * 100) : 0

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">

        {/* ================= WAITING ROOM ================= */}
        {status === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="text-center space-y-8 max-w-lg w-full bg-white dark:bg-gray-900 p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={48} className="animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{quiz.title}</h2>
              <p className="font-medium text-gray-500 dark:text-gray-400">{quiz.clubs?.name}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100 animate-pulse">
                O&apos;qituvchi testni boshlashini kuting...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Barcha o&apos;quvchilar qo&apos;shilgach, test boshlanadi.</p>
            </div>
          </motion.div>
        )}

        {/* ================= ACTIVE PLAY ================= */}
        {status === 'active' && finalScore === null && quiz.quiz_questions.length > 0 && (
          <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-4xl space-y-6">
            <div className="flex flex-col justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 font-bold font-mono text-2xl sm:text-xl rounded-2xl border border-amber-100 dark:border-amber-900/50 shrink-0">
                <Clock size={24} /> {timeString}
              </div>
              <div className="flex flex-wrap gap-2 justify-center w-full">
                {quiz.quiz_questions.map((q, idx) => {
                  const isCurrent = idx === currQIdx
                  const isAnswered = !!answers[q.id]
                  let btnClass = "w-8 h-8 text-xs sm:w-10 sm:h-10 sm:text-sm rounded-full flex items-center justify-center font-bold transition-all "
                  if (isCurrent) btnClass += "bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-800"
                  else if (isAnswered) btnClass += "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-400"
                  else btnClass += "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  return (
                    <button key={q.id} onClick={() => setCurrQIdx(idx)} className={btnClass}>{idx + 1}</button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between items-start mb-8 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed flex-1">
                  <span className="text-indigo-500 mr-2">{currQIdx + 1}.</span>
                  {quiz.quiz_questions[currQIdx].question}
                </h3>
              </div>

              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map(opt => {
                  const valKey = `option_${opt.toLowerCase()}` as keyof QuizQuestion
                  const optText = quiz.quiz_questions[currQIdx][valKey] as string
                  const isSelected = answers[quiz.quiz_questions[currQIdx].id] === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className={`w-full min-h-[48px] text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-md' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black shrink-0 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300 group-hover:bg-gray-200'}`}>{opt}</div>
                      <span className={`font-semibold text-[16px] sm:text-lg ${isSelected ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-700 dark:text-gray-200'}`}>{optText}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-3 w-full sm:w-auto">
                  <button disabled={currQIdx === 0} onClick={() => setCurrQIdx(prev => prev - 1)} className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all">Oldingi</button>
                  <button disabled={currQIdx === totalQ - 1} onClick={() => setCurrQIdx(prev => prev + 1)} className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all">Keyingi</button>
                </div>
                <button
                  onClick={() => {
                    const answeredCount = Object.keys(answers).length
                    const unansweredCount = totalQ - answeredCount
                    if (confirm(`${answeredCount} ta javob berildi, ${unansweredCount} ta berilmadi. Yakunlashni tasdiqlaysizmi?`)) handleSubmit()
                  }}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Testni yakunlash
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= SUBMITTING — waiting for teacher to end ================= */}
        {status === 'submitting' && (
          <motion.div key="submitting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 max-w-lg w-full bg-white dark:bg-gray-900 p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">✅ Javoblaringiz qabul qilindi!</h2>
              {finalScore !== null && (
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-3">
                  {finalScore} / {totalQ} to&apos;g&apos;ri · {percentScore}%
                </p>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <Loader2 size={24} className="animate-spin text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                O&apos;qituvchi testni yakunlaguncha kuting...
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Natijalar avtomatik ko&apos;rinadi</p>
            </div>
          </motion.div>
        )}

        {/* ================= FINISHED — FULL RESULTS ================= */}
        {status === 'finished' && (
          <motion.div key="finished" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl space-y-6">

            {/* Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy size={40} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{quiz.title}</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Test yakunlandi 🎉</p>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-1">Natija</p>
                  <p className="text-3xl font-black">{finalScore ?? 0}<span className="text-indigo-200 text-lg">/{totalQ}</span></p>
                  <p className="text-indigo-200 text-xs mt-0.5">ball</p>
                </div>
                <div className="text-center">
                  <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-1">Foiz</p>
                  <p className="text-3xl font-black">{percentScore}<span className="text-indigo-200 text-lg">%</span></p>
                  <p className="text-indigo-200 text-xs mt-0.5">to&apos;g&apos;ri</p>
                </div>
                <div className="text-center">
                  <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-1">O&apos;rin</p>
                  <p className="text-3xl font-black">
                    {studentRank !== null ? studentRank : '—'}
                    {studentRank !== null && <span className="text-indigo-200 text-lg">-o&apos;rin</span>}
                  </p>
                  <p className="text-indigo-200 text-xs mt-0.5">{leaderboard.length} ishtirokchi</p>
                </div>
                <div className="text-center">
                  <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-1">To&apos;g&apos;ri</p>
                  <p className="text-3xl font-black">{reviewQuestions.length > 0 ? correctCount : (finalScore ?? 0)}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">ta javob</p>
                </div>
              </div>
            </div>

            {/* Questions Review */}
            {reviewQuestions.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">📋 Javoblar sharhi</h3>
                {reviewQuestions.map((q, idx) => {
                  const studentAns = q.student_answer
                  const correctAns = q.correct_answer
                  const isCorrect = q.is_correct
                  const notAnswered = !studentAns

                  return (
                    <div key={q.id} className={`bg-white dark:bg-gray-900 rounded-2xl border-2 p-5 sm:p-6 ${isCorrect ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-900'}`}>
                      {/* Question */}
                      <div className="flex items-start gap-3 mb-4">
                        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                          {idx + 1}
                        </span>
                        <p className="text-gray-900 dark:text-white font-semibold leading-snug">{q.question}</p>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {(['A', 'B', 'C', 'D'] as const).map(opt => {
                          const text = getOptionText(q, opt)
                          const isThisCorrect = opt === correctAns
                          const isStudentPick = opt === studentAns
                          const isWrongPick = isStudentPick && !isThisCorrect

                          let cls = 'w-full text-left p-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors '
                          let dotCls = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 '

                          if (isThisCorrect) {
                            cls += 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700'
                            dotCls += 'bg-emerald-500 text-white'
                          } else if (isWrongPick) {
                            cls += 'bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800'
                            dotCls += 'bg-red-500 text-white'
                          } else {
                            cls += 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                            dotCls += 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }

                          return (
                            <div key={opt} className={cls}>
                              <span className={dotCls}>{opt}</span>
                              <span className={isThisCorrect ? 'text-emerald-700 dark:text-emerald-300' : isWrongPick ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}>
                                {text}
                              </span>
                              {isThisCorrect && <span className="ml-auto text-emerald-500 text-lg">✅</span>}
                              {isWrongPick && <span className="ml-auto text-red-500 text-lg">❌</span>}
                            </div>
                          )
                        })}
                      </div>

                      {/* Status badge */}
                      <div className="mt-3 flex items-center gap-2">
                        {notAnswered ? (
                          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">⚠️ Javob berilmagan</span>
                        ) : isCorrect ? (
                          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">✅ To&apos;g&apos;ri javob</span>
                        ) : (
                          <span className="text-xs px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium">❌ Noto&apos;g&apos;ri · To&apos;g&apos;ri: {correctAns}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Show leaderboard if review not loaded yet */
              leaderboard.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[340px]">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">O&apos;rin</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">O&apos;quvchi</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Natija</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {leaderboard.map((p, i) => {
                          const isMe = p.student_id === participation?.student_id
                          return (
                            <tr key={p.student_id} className={`${isMe ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                              <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                              </td>
                              <td className={`px-4 py-3 font-bold ${isMe ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                {p.full_name} {isMe && <span className="ml-1 text-[10px] bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">Siz</span>}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">
                                {p.score}/{totalQ}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            <button onClick={() => router.push('/student/quiz')} className="w-full px-6 py-4 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white font-bold rounded-xl shadow-md transition-all">
              ← Testlar ro&apos;yxatiga qaytish
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
