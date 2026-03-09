import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAttendanceRate(present: number, total: number): number {
  if (total === 0) return 0
  return Math.round((present / total) * 100)
}

export function getStudentStatus(rate: number): string {
  if (rate >= 90) return "A'lo"
  if (rate >= 70) return 'Yaxshi'
  return 'Qoniqarsiz'
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$'
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    month: 'short',
    day: 'numeric',
  })
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Hozir'
  if (diffMins < 60) return `${diffMins} daqiqa oldin`
  if (diffHours < 24) return `${diffHours} soat oldin`
  if (diffDays < 7) return `${diffDays} kun oldin`
  return formatDateShort(dateStr)
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Texnologiya': 'bg-blue-100 text-blue-700',
    'Sport': 'bg-green-100 text-green-700',
    "San'at": 'bg-purple-100 text-purple-700',
    'Fan': 'bg-yellow-100 text-yellow-700',
    'Til': 'bg-pink-100 text-pink-700',
    'Musiqa': 'bg-orange-100 text-orange-700',
    'Boshqa': 'bg-gray-100 text-gray-700',
  }
  return colors[category] || 'bg-gray-100 text-gray-700'
}

