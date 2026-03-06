'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell } from 'lucide-react'

export default function DashboardHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-4">
      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <p className="font-medium text-sm">Yangi ariza</p>
            <p className="text-xs text-gray-500">
              Alibek Toshmatov Sport to&apos;garagiga ariza berdi
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <p className="font-medium text-sm">Davomat olinmadi</p>
            <p className="text-xs text-gray-500">
              Musiqa to&apos;garagida bugungi davomat olinmagan
            </p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User */}
      <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
          ZV
        </div>
        <span className="text-sm font-medium text-gray-700">Zuxriddin V.</span>
      </div>
    </header>
  )
}
