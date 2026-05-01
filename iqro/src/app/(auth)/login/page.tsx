'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { GRADES } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    GraduationCap,
    Loader2,
    Lock,
    Mail,
    User,
    Users,
    ShieldCheck,
    ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect, useRef, Suspense } from 'react'

// ─── Password Strength ──────────────────────────────────────
function getPasswordStrength(p: string) {
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { label: 'Kuchsiz', color: 'bg-red-500', width: '33%' }
  if (score <= 2) return { label: "O'rtacha", color: 'bg-yellow-500', width: '66%' }
  return { label: 'Kuchli', color: 'bg-green-500', width: '100%' }
}

// ─── Floating Blob ──────────────────────────────────────────
function FloatingBlob({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{
        y: [0, -30, 0, 30, 0],
        x: [0, 20, 0, -20, 0],
        scale: [1, 1.1, 1, 0.95, 1],
      }}
      transition={{ duration: 12, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

// ─── Role Card ──────────────────────────────────────────────
function RoleCard({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ElementType
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all cursor-pointer ${
        selected
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 shadow-md shadow-indigo-100 dark:shadow-indigo-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon size={28} strokeWidth={selected ? 2.2 : 1.8} />
      <span className="text-sm font-semibold">{label}</span>
    </motion.button>
  )
}

// ─── OTP Input component (6 boxes) ──────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, '').split('').slice(0, 6)

  function handleChange(idx: number, val: string) {
    const cleaned = val.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[idx] = cleaned
    onChange(newDigits.join('').replace(/ /g, ''))
    if (cleaned && idx < 5) inputs.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
      const newDigits = [...digits]
      newDigits[idx - 1] = ''
      onChange(newDigits.join('').replace(/ /g, ''))
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const nextIdx = Math.min(pasted.length, 5)
    inputs.current[nextIdx]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={el => { inputs.current[idx] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] === ' ' ? '' : digits[idx] || ''}
          onChange={e => handleChange(idx, e.target.value)}
          onKeyDown={e => handleKeyDown(idx, e)}
          className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // ── Shared state ────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login')
  const [loginRole, setLoginRole] = useState<'student' | 'teacher'>('student')

  // ── Login state ─────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginShowPw, setLoginShowPw] = useState(false)
  const [loginRemember, setLoginRemember] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({})

  // ── Register state ──────────────────────────────────────
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regGrade, setRegGrade] = useState('')
  const [regShowPw, setRegShowPw] = useState(false)
  const [regShowConfirm, setRegShowConfirm] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')
  const [regErrors, setRegErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirm?: string
  }>({})

  // ── OTP state ───────────────────────────────────────────
  const [otpStep, setOtpStep] = useState(false)   // Show OTP input
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpResendLoading, setOtpResendLoading] = useState(false)
  const [otpResendCooldown, setOtpResendCooldown] = useState(0)
  const [pendingEmail, setPendingEmail] = useState('') // email awaiting OTP

  // Cooldown timer for resend
  useEffect(() => {
    if (otpResendCooldown <= 0) return
    const t = setTimeout(() => setOtpResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [otpResendCooldown])

  // ══════════════════════════════════════════════════════════
  // LOGIN HANDLER
  // ══════════════════════════════════════════════════════════
  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoginError('')
      const errors: { email?: string; password?: string } = {}
      if (!loginEmail) errors.email = 'Email kiritish shart'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail))
        errors.email = "Email noto'g'ri formatda"
      if (!loginPassword) errors.password = 'Parol kiritish shart'
      else if (loginPassword.length < 6) errors.password = 'Parol kamida 6 ta belgi'
      if (Object.keys(errors).length) {
        setLoginErrors(errors)
        return
      }
      setLoginErrors({})
      setLoginLoading(true)

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
            remember: loginRemember,
            role: loginRole,
          }),
        })

        const data = await res.json()
        setLoginLoading(false)

        if (!res.ok) {
          setLoginError(data.error || "Tizim xatosi yuz berdi. Qayta urinib ko'ring.")
          return
        }

        router.push(data.redirect || '/student')
      } catch {
        setLoginLoading(false)
        setLoginError("Tarmoq xatosi yuz berdi. Qayta urinib ko'ring.")
      }
    },
    [loginEmail, loginPassword, loginRemember, loginRole, router]
  )

  // ══════════════════════════════════════════════════════════
  // REGISTER HANDLER — uses Admin API (no rate limit, no OTP)
  // ══════════════════════════════════════════════════════════
  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setRegError('')
      const errors: { name?: string; email?: string; password?: string; confirm?: string } = {}
      if (!regName || regName.length < 3)
        errors.name = "Ism sharif kamida 3 ta belgidan iborat bo'lishi kerak"
      if (!regEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail))
        errors.email = "Email noto'g'ri formatda"
      if (!regPassword || regPassword.length < 8 || !/[A-Z]/.test(regPassword) || !/[0-9]/.test(regPassword))
        errors.password = "Parol kamida 8 ta belgi, 1 ta katta harf va 1 ta raqam bo'lishi kerak"
      if (regPassword !== regConfirm) errors.confirm = 'Parollar mos kelmayapti'
      if (Object.keys(errors).length) {
        setRegErrors(errors)
        return
      }
      setRegErrors({})
      setRegLoading(true)

      try {
        // Step 1: Create user via Admin API (no email limit, instant confirm)
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: regEmail,
            password: regPassword,
            full_name: regName,
            grade: regGrade || null,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setRegError(data.error || "Ro'yxatdan o'tishda xatolik yuz berdi")
          setRegLoading(false)
          return
        }

        // Step 2: Auto sign-in after successful registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: regEmail,
          password: regPassword,
        })

        setRegLoading(false)

        if (signInError) {
          // User created but couldn't auto-login — redirect to login
          setActiveTab('login')
          setRegError('')
          return
        }

        // Redirect to student dashboard
        router.push('/student')
      } catch {
        setRegLoading(false)
        setRegError("Tarmoq xatosi yuz berdi. Qayta urinib ko'ring.")
      }
    },
    [regName, regEmail, regPassword, regConfirm, regGrade, supabase, router]
  )

  // ══════════════════════════════════════════════════════════
  // OTP VERIFY HANDLER
  // ══════════════════════════════════════════════════════════
  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (otpCode.replace(/\s/g, '').length < 6) {
        setOtpError("Iltimos, 6 xonali kodni to'liq kiriting")
        return
      }
      setOtpLoading(true)
      setOtpError('')

      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otpCode.trim(),
        type: 'signup',
      })

      if (error) {
        setOtpLoading(false)
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setOtpError("Kod noto'g'ri yoki muddati o'tib ketgan. Yangi kod so'rang.")
        } else {
          setOtpError(error.message)
        }
        return
      }

      // OTP verified — session is now active. Get role and redirect.
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle()

        const role = profile?.role || data.user.user_metadata?.role || 'student'
        const routes: Record<string, string> = {
          student: '/student',
          teacher: '/teacher',
          director: '/director',
          school_admin: '/dashboard',
          super_admin: '/dashboard',
        }
        router.push(routes[role] || '/student')
      }
    },
    [otpCode, pendingEmail, supabase, router]
  )

  // ── Resend OTP ──────────────────────────────────────────
  const handleResendOtp = async () => {
    if (otpResendCooldown > 0) return
    setOtpResendLoading(true)
    setOtpError('')
    const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail })
    setOtpResendLoading(false)
    if (error) {
      setOtpError("Kod yuborishda xatolik. Qayta urinib ko'ring.")
    } else {
      setOtpResendCooldown(60)
    }
  }

  const pwStrength = getPasswordStrength(regPassword)

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex bg-gray-50/50 dark:bg-gray-950">
      {/* ╔═══════════════════════════════════════╗ */}
      {/* ║  LEFT BRANDING PANEL                  ║ */}
      {/* ╚═══════════════════════════════════════╝ */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 relative overflow-hidden flex-col justify-between p-10 xl:p-14"
      >
        <FloatingBlob className="w-72 h-72 bg-indigo-400 top-10 -left-20" delay={0} />
        <FloatingBlob className="w-96 h-96 bg-blue-500 bottom-10 right-0" delay={3} />
        <FloatingBlob className="w-48 h-48 bg-purple-400 top-1/2 left-1/3" delay={6} />

        <div className="relative z-10">
          <Logo className="mb-16" textClassName="text-white" forceDark={true} />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <p className="text-3xl xl:text-4xl font-bold text-white leading-snug mb-6">
              &ldquo;Bilim — bu kelajakka
              <br />
              qo&apos;yilgan eng yaxshi
              <br />
              <span className="text-yellow-300">sarmoya.&rdquo;</span>
            </p>
            <p className="text-white/50 text-sm">— Benjamin Franklin</p>
          </motion.div>
        </div>
      </motion.div>

      {/* ╔═══════════════════════════════════════╗ */}
      {/* ║  RIGHT AUTH PANEL                     ║ */}
      {/* ╚═══════════════════════════════════════╝ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-10 bg-gray-50/50 dark:bg-gray-950 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />

          {/* ══ OTP STEP (full page replacement) ══ */}
          <AnimatePresence mode="wait">
            {otpStep ? (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtpError('') }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
                >
                  <ArrowLeft size={16} /> Orqaga
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={32} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Emailingizni tasdiqlang
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{pendingEmail}</span> manziliga<br />
                    6 xonali tasdiqlash kodi yuborildi
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP boxes */}
                  <OtpInput value={otpCode} onChange={setOtpCode} />

                  {/* Error */}
                  <AnimatePresence>
                    {otpError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3"
                      >
                        <AlertCircle size={16} />
                        {otpError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={otpLoading || otpCode.replace(/\s/g, '').length < 6}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-base font-semibold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                  >
                    {otpLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <CheckCircle2 size={18} className="mr-2" />}
                    {otpLoading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
                  </Button>
                </form>

                {/* Resend */}
                <div className="text-center mt-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kod kelmadimi?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpResendLoading || otpResendCooldown > 0}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {otpResendLoading ? 'Yuborilmoqda...' :
                       otpResendCooldown > 0 ? `Qayta yuborish (${otpResendCooldown}s)` :
                       'Qayta yuborish'}
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="auth-tabs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Heading */}
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Xush kelibsiz!</h1>
                  <p className="text-gray-500 dark:text-gray-400">Hisobingizga kiring yoki yangi hisob yarating</p>
                </motion.div>

                {/* ── TABS ─────────────────────────────── */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                    <TabsTrigger
                      value="login"
                      className="rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-all"
                    >
                      Kirish
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-all"
                    >
                      Ro&apos;yxatdan o&apos;tish
                    </TabsTrigger>
                  </TabsList>

                  {/* ══════════ LOGIN TAB ══════════ */}
                  <TabsContent value="login" className="mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.25 }}
                      >
                        {/* Role cards */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <RoleCard
                            icon={GraduationCap}
                            label="O'quvchi sifatida kirish"
                            selected={loginRole === 'student'}
                            onClick={() => setLoginRole('student')}
                          />
                          <RoleCard
                            icon={Users}
                            label="O'qituvchi sifatida kirish"
                            selected={loginRole === 'teacher'}
                            onClick={() => setLoginRole('teacher')}
                          />
                        </div>

                        {/* Error alert */}
                        <AnimatePresence>
                          {loginError && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-5"
                            >
                              <AlertCircle size={16} />
                              {loginError}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <form onSubmit={handleLogin} className="space-y-4">
                          {/* Email */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Label htmlFor="login-email" className="text-gray-700 dark:text-gray-200 font-medium text-sm mb-1.5 block">
                              Email
                            </Label>
                            <div className="relative">
                              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                id="login-email"
                                type="email"
                                value={loginEmail}
                                onChange={(e) => {
                                  setLoginEmail(e.target.value)
                                  setLoginErrors((prev) => ({ ...prev, email: undefined }))
                                }}
                                placeholder="sizning@email.uz"
                                className={`h-12 pl-11 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${
                                  loginErrors.email ? 'border-red-400 dark:border-red-500' : ''
                                }`}
                              />
                            </div>
                            {loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email}</p>}
                          </motion.div>

                          {/* Password */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Label htmlFor="login-pw" className="text-gray-700 dark:text-gray-200 font-medium text-sm mb-1.5 block">
                              Parol
                            </Label>
                            <div className="relative">
                              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                id="login-pw"
                                type={loginShowPw ? 'text' : 'password'}
                                value={loginPassword}
                                onChange={(e) => {
                                  setLoginPassword(e.target.value)
                                  setLoginErrors((prev) => ({ ...prev, password: undefined }))
                                }}
                                placeholder="••••••••"
                                className={`h-12 pl-11 pr-11 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${
                                  loginErrors.password ? 'border-red-400 dark:border-red-500' : ''
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setLoginShowPw(!loginShowPw)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {loginShowPw ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            {loginErrors.password && <p className="text-red-500 text-xs mt-1">{loginErrors.password}</p>}
                          </motion.div>

                          {/* Remember me */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="remember"
                              checked={loginRemember}
                              onChange={(e) => setLoginRemember(e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor="remember" className="text-gray-600 dark:text-gray-300 text-sm cursor-pointer">
                              Meni eslab qol
                            </Label>
                          </motion.div>

                          {/* Submit */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <Button
                              type="submit"
                              disabled={loginLoading}
                              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-base font-semibold shadow-lg shadow-indigo-200 transition-all"
                            >
                              {loginLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                              {loginLoading ? 'Kirilmoqda...' : 'Kirish'}
                            </Button>
                          </motion.div>
                        </form>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>

                  {/* ══════════ REGISTER TAB ══════════ */}
                  <TabsContent value="register" className="mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="register-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                      >
                        {/* Error message */}
                        <AnimatePresence>
                          {regError && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-5"
                            >
                              <AlertCircle size={16} />
                              {regError}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <form onSubmit={handleRegister} className="space-y-4">
                          {/* Full name */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                            <Label className="text-gray-700 dark:text-gray-200 font-medium text-sm mb-1.5 block">
                              To&apos;liq ism sharif
                            </Label>
                            <div className="relative">
                              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                value={regName}
                                onChange={(e) => {
                                  setRegName(e.target.value)
                                  setRegErrors((p) => ({ ...p, name: undefined }))
                                }}
                                placeholder="Ismingiz Familiyangiz"
                                className={`h-12 pl-11 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${regErrors.name ? 'border-red-400 dark:border-red-500' : ''}`}
                              />
                            </div>
                            {regErrors.name && <p className="text-red-500 text-xs mt-1">{regErrors.name}</p>}
                          </motion.div>

                          {/* Grade Selector */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
                            <Label className="text-gray-700 dark:text-gray-200 font-medium text-sm mb-1.5 block">
                              📚 Sinf
                            </Label>
                            <select
                              value={regGrade}
                              onChange={(e) => setRegGrade(e.target.value)}
                              className="w-full h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none"
                            >
                              <option value="">Sinfni tanlang</option>
                              {GRADES.map(g => (
                                <option key={g} value={g}>{g}-sinf</option>
                              ))}
                            </select>
                          </motion.div>

                          {/* Email */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Label className="text-gray-700 dark:text-gray-200 font-medium text-sm mb-1.5 block">Email</Label>
                            <div className="relative">
                              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                type="email"
                                value={regEmail}
                                onChange={(e) => {
                                  setRegEmail(e.target.value)
                                  setRegErrors((p) => ({ ...p, email: undefined }))
                                }}
                                placeholder="sizning@email.uz"
                                className={`h-12 pl-11 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${regErrors.email ? 'border-red-400 dark:border-red-500' : ''}`}
                              />
                            </div>
                            {regErrors.email && <p className="text-red-500 text-xs mt-1">{regErrors.email}</p>}
                          </motion.div>

                          {/* Password */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <Label className="text-gray-700 dark:text-gray-200 font-medium text-sm mb-1.5 block">Parol</Label>
                            <div className="relative">
                              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                type={regShowPw ? 'text' : 'password'}
                                value={regPassword}
                                onChange={(e) => {
                                  setRegPassword(e.target.value)
                                  setRegErrors((p) => ({ ...p, password: undefined }))
                                }}
                                placeholder="Kamida 8 ta belgi"
                                className={`h-12 pl-11 pr-11 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${regErrors.password ? 'border-red-400 dark:border-red-500' : ''}`}
                              />
                              <button
                                type="button"
                                onClick={() => setRegShowPw(!regShowPw)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {regShowPw ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            {regErrors.password && <p className="text-red-500 text-xs mt-1">{regErrors.password}</p>}
                            {regPassword.length > 0 && (
                              <div className="mt-2">
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${pwStrength.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: pwStrength.width }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                  Parol kuchi:{' '}
                                  <span className={pwStrength.color === 'bg-red-500' ? 'text-red-500' : pwStrength.color === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-600'}>
                                    {pwStrength.label}
                                  </span>
                                </p>
                              </div>
                            )}
                          </motion.div>

                          {/* Confirm password */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Label className="text-gray-700 dark:text-gray-200 font-medium text-sm mb-1.5 block">Parolni takrorlash</Label>
                            <div className="relative">
                              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                type={regShowConfirm ? 'text' : 'password'}
                                value={regConfirm}
                                onChange={(e) => {
                                  setRegConfirm(e.target.value)
                                  setRegErrors((p) => ({ ...p, confirm: undefined }))
                                }}
                                placeholder="Parolni qayta kiriting"
                                className={`h-12 pl-11 pr-11 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${regErrors.confirm ? 'border-red-400 dark:border-red-500' : ''}`}
                              />
                              <button
                                type="button"
                                onClick={() => setRegShowConfirm(!regShowConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {regShowConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            {regErrors.confirm && <p className="text-red-500 text-xs mt-1">{regErrors.confirm}</p>}
                          </motion.div>

                          {/* Submit */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                            <Button
                              type="submit"
                              disabled={regLoading}
                              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-base font-semibold shadow-lg shadow-indigo-200 transition-all"
                            >
                              {regLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                              {regLoading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
                            </Button>
                          </motion.div>
                        </form>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
