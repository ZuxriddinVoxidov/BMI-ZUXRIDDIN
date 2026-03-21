'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 rounded-xl flex items-center justify-center 
                 bg-gray-100 hover:bg-gray-200 
                 dark:bg-gray-800 dark:hover:bg-gray-700
                 text-gray-600 dark:text-gray-300
                 transition-colors duration-200"
      title={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
    >
      {theme === 'dark'
        ? <Sun size={18} className="text-amber-400" />
        : <Moon size={18} className="text-gray-600" />
      }
    </button>
  )
}
