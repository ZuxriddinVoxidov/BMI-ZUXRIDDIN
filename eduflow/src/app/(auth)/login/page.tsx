'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, Building2, Check, Copy, Eye, EyeOff, GraduationCap, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const roles = [
  { id: 'admin', label: 'Admin', icon: Building2 },
  { id: 'student', label: "O'quvchi", icon: GraduationCap },
  { id: 'teacher', label: "O'qituvchi", icon: Users },
  { id: 'director', label: 'Direktor', icon: Briefcase },
]

const demoCredentials = [
  { role: 'ADMIN', icon: '🏫', email: 'admin@eduflow.uz', password: 'Admin@123' },
  { role: "O'QUVCHI", icon: '🎓', email: 'student@eduflow.uz', password: 'Student@123' },
  { role: "O'QITUVCHI", icon: '👨‍🏫', email: 'teacher@eduflow.uz', password: 'Teacher@123' },
  { role: 'DIREKTOR', icon: '👔', email: 'director@eduflow.uz', password: 'Director@123' },
]

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleFillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side — Purple Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-2xl font-bold text-white">EduFlow</span>
          </Link>

          {/* Heading */}
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Ta&apos;lim kelajagi
            <br />
            <span className="text-yellow-300">shu yerda boshlanadi</span>
          </h1>

          <p className="text-white/70 text-lg mb-10 max-w-md">
            O&apos;quvchilar, o&apos;qituvchilar va direktorlar uchun birlashtirilgan
            platforma.
          </p>

          {/* User Types Illustration */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-sm">
            <div className="flex items-center justify-around mb-4">
              <div className="text-center">
                <div className="text-3xl mb-1">🎓</div>
                <span className="text-white/80 text-xs">O&apos;quvchi</span>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">👨‍🏫</div>
                <span className="text-white/80 text-xs">O&apos;qituvchi</span>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">🏫</div>
                <span className="text-white/80 text-xs">Maktab</span>
              </div>
            </div>
            <div className="border-t border-white/20 pt-3">
              <p className="text-white/60 text-sm text-center">
                EduFlow orqali bog&apos;liq
              </p>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 w-fit">
            <span className="text-yellow-300">✦</span>
            <span className="text-white/90 text-sm font-medium">
              4 xil foydalanuvchi uchun
            </span>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-gray-50/50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Edu<span className="text-indigo-600">Flow</span>
            </span>
          </Link>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Tizimga kirish
          </h2>
          <p className="text-gray-500 mb-8">
            Rolingizni tanlang va davom eting
          </p>

          {/* Role Tabs */}
          <div className="grid grid-cols-4 gap-2 mb-8 bg-gray-100 rounded-2xl p-1.5">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all ${
                  selectedRole === role.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <role.icon size={20} />
                <span>{role.label}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // Handle login
            }}
            className="space-y-5"
          >
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eduflow.uz"
                className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Parol
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-gray-200 bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <a
                href="#"
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
              >
                Parolni unutdim?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-semibold"
            >
              Kirish <span className="ml-1">›</span>
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔑</span>
              <h3 className="font-semibold text-gray-900">
                Demo kirish ma&apos;lumotlari
              </h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {demoCredentials.map((cred) => (
                  <motion.div
                    key={cred.role}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm">{cred.icon}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-gray-900">
                          {cred.role}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="truncate">{cred.email}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(cred.email, `${cred.role}-email`)
                            }
                          >
                            {copiedField === `${cred.role}-email` ? (
                              <Check size={12} className="text-green-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                          <span>{cred.password}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(cred.password, `${cred.role}-pass`)
                            }
                          >
                            {copiedField === `${cred.role}-pass` ? (
                              <Check size={12} className="text-green-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFillDemo(cred.email, cred.password)}
                      className="text-indigo-600 text-xs font-medium hover:text-indigo-700 whitespace-nowrap ml-2"
                    >
                      To&apos;ldirish
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
