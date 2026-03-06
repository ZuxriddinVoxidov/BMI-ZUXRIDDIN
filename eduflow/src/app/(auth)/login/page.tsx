'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
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
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

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
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100'
          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <Icon size={28} strokeWidth={selected ? 2.2 : 1.8} />
      <span className="text-sm font-semibold">{label}</span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // ── Shared state ────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('login')
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
  const [regShowPw, setRegShowPw] = useState(false)
  const [regShowConfirm, setRegShowConfirm] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [regErrors, setRegErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirm?: string
  }>({})



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

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        setLoginLoading(false)
        setLoginError("Email yoki parol noto'g'ri. Qayta urinib ko'ring.")
        return
      }

      // Fetch profile role
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoginLoading(false)
        setLoginError('Foydalanuvchi topilmadi')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const role = profile?.role || 'student'
      const routes: Record<string, string> = {
        super_admin: '/dashboard',
        school_admin: '/dashboard',
        student: '/student',
        teacher: '/teacher',
        director: '/director',
      }
      router.push(routes[role] || '/student')
    },
    [loginEmail, loginPassword, router, supabase]
  )

  // ══════════════════════════════════════════════════════════
  // REGISTER HANDLER
  // ══════════════════════════════════════════════════════════
  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setRegError('')
      setRegSuccess('')
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

      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: { full_name: regName, role: 'student' },
        },
      })

      setRegLoading(false)
      if (error) {
        // Translate common Supabase errors to Uzbek
        const errorMap: Record<string, string> = {
          'User already registered': "Bu email allaqachon ro'yxatdan o'tgan",
          'email rate limit exceeded': "Juda ko'p urinish. Iltimos, biroz kutib qayta urinib ko'ring",
          'Password should be at least 6 characters': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
          'Unable to validate email address: invalid format': "Email formati noto'g'ri",
          'Signup requires a valid password': "To'g'ri parol kiriting",
        }
        const uzMessage = Object.entries(errorMap).find(([key]) =>
          error.message.toLowerCase().includes(key.toLowerCase())
        )
        setRegError(uzMessage ? uzMessage[1] : `Xatolik yuz berdi: ${error.message}`)
        return
      }
      setRegSuccess("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi hisobingizga kirishingiz mumkin.")
      setRegName('')
      setRegEmail('')
      setRegPassword('')
      setRegConfirm('')
      setTimeout(() => setActiveTab('login'), 2000)
    },
    [regName, regEmail, regPassword, regConfirm, supabase]
  )

  const pwStrength = getPasswordStrength(regPassword)

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex">
      {/* ╔═══════════════════════════════════════╗ */}
      {/* ║  LEFT BRANDING PANEL                  ║ */}
      {/* ╚═══════════════════════════════════════╝ */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 relative overflow-hidden flex-col justify-between p-10 xl:p-14"
      >
        {/* Floating blobs */}
        <FloatingBlob className="w-72 h-72 bg-indigo-400 top-10 -left-20" delay={0} />
        <FloatingBlob className="w-96 h-96 bg-blue-500 bottom-10 right-0" delay={3} />
        <FloatingBlob className="w-48 h-48 bg-purple-400 top-1/2 left-1/3" delay={6} />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-white">
              Edu<span className="text-indigo-300">Flow</span>
            </span>
          </Link>
        </div>

        {/* Quote */}
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
              <span className="text-yellow-300">sarmoya.</span>&rdquo;
            </p>
            <p className="text-white/50 text-sm">— Benjamin Franklin</p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="relative z-10 flex items-center gap-6"
        >
          {[
            { value: "15 000+", label: "O'quvchi" },
            { value: '850+', label: "To'garak" },
            { value: '120+', label: 'Maktab' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-white/50 text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ╔═══════════════════════════════════════╗ */}
      {/* ║  RIGHT AUTH PANEL                     ║ */}
      {/* ╚═══════════════════════════════════════╝ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-10 bg-gray-50/50 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Edu<span className="text-indigo-600">Flow</span>
            </span>
          </Link>

          {/* Heading */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Xush kelibsiz!</h1>
            <p className="text-gray-500">Hisobingizga kiring yoki yangi hisob yarating</p>
          </motion.div>

          {/* ── TABS ─────────────────────────────── */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-xl bg-gray-100 p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
              >
                Kirish
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
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
                        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5"
                      >
                        <AlertCircle size={16} />
                        {loginError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Label htmlFor="login-email" className="text-gray-700 font-medium text-sm mb-1.5 block">
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
                          className={`h-12 pl-11 rounded-lg border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            loginErrors.email ? 'border-red-400' : ''
                          }`}
                        />
                      </div>
                      {loginErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{loginErrors.email}</p>
                      )}
                    </motion.div>

                    {/* Password */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label htmlFor="login-pw" className="text-gray-700 font-medium text-sm mb-1.5 block">
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
                          className={`h-12 pl-11 pr-11 rounded-lg border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 ${
                            loginErrors.password ? 'border-red-400' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setLoginShowPw(!loginShowPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {loginShowPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {loginErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{loginErrors.password}</p>
                      )}
                    </motion.div>

                    {/* Remember me */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        id="remember"
                        checked={loginRemember}
                        onChange={(e) => setLoginRemember(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label htmlFor="remember" className="text-gray-600 text-sm cursor-pointer">
                        Meni eslab qol
                      </Label>
                    </motion.div>

                    {/* Submit */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-base font-semibold shadow-lg shadow-indigo-200 transition-all"
                      >
                        {loginLoading ? (
                          <Loader2 className="animate-spin mr-2" size={20} />
                        ) : null}
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
                  {/* Info banner */}
                  <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={22} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">O&apos;quvchi sifatida ro&apos;yxatdan o&apos;ting</p>
                      <p className="text-xs text-gray-500">O&apos;qituvchi va boshqa rollar admin tomonidan tayinlanadi</p>
                    </div>
                  </div>

                  {/* Success message */}
                  <AnimatePresence>
                    {regSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5"
                      >
                        <CheckCircle2 size={16} />
                        {regSuccess}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error message */}
                  <AnimatePresence>
                    {regError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5"
                      >
                        <AlertCircle size={16} />
                        {regError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Full name */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                      <Label className="text-gray-700 font-medium text-sm mb-1.5 block">
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
                          className={`h-12 pl-11 rounded-lg border-gray-200 bg-white ${regErrors.name ? 'border-red-400' : ''}`}
                        />
                      </div>
                      {regErrors.name && <p className="text-red-500 text-xs mt-1">{regErrors.name}</p>}
                    </motion.div>

                    {/* Email */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Label className="text-gray-700 font-medium text-sm mb-1.5 block">Email</Label>
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
                          className={`h-12 pl-11 rounded-lg border-gray-200 bg-white ${regErrors.email ? 'border-red-400' : ''}`}
                        />
                      </div>
                      {regErrors.email && <p className="text-red-500 text-xs mt-1">{regErrors.email}</p>}
                    </motion.div>

                    {/* Password */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                      <Label className="text-gray-700 font-medium text-sm mb-1.5 block">Parol</Label>
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
                          className={`h-12 pl-11 pr-11 rounded-lg border-gray-200 bg-white ${regErrors.password ? 'border-red-400' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPw(!regShowPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {regShowPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {regErrors.password && <p className="text-red-500 text-xs mt-1">{regErrors.password}</p>}
                      {/* Strength bar */}
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
                          <p className="text-xs mt-1 text-gray-500">
                            Parol kuchi:{' '}
                            <span
                              className={
                                pwStrength.color === 'bg-red-500'
                                  ? 'text-red-500'
                                  : pwStrength.color === 'bg-yellow-500'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }
                            >
                              {pwStrength.label}
                            </span>
                          </p>
                        </div>
                      )}
                    </motion.div>

                    {/* Confirm password */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Label className="text-gray-700 font-medium text-sm mb-1.5 block">Parolni takrorlash</Label>
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
                          className={`h-12 pl-11 pr-11 rounded-lg border-gray-200 bg-white ${regErrors.confirm ? 'border-red-400' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowConfirm(!regShowConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
        </div>
      </motion.div>
    </div>
  )
}
