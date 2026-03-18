'use client'

import { logout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="p-2 rounded-xl hover:bg-red-50 transition-colors group"
      title="Chiqish"
    >
      <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
    </button>
  )
}
