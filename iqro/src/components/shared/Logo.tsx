'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  collapsed?: boolean
  href?: string
  className?: string
  textClassName?: string
  subtitle?: string
  forceDark?: boolean
}

export function Logo({ collapsed = false, href = '/', className, textClassName, subtitle, forceDark }: LogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && (forceDark || theme === 'dark')
  const logoSrc = isDark && !imgError ? '/logo-dark.png' : '/logo.png'

  return (
    <Link href={href} className={cn("flex flex-col justify-center min-w-0", className)}>
      <div className={cn("relative flex-shrink-0 transition-all duration-300 mt-1.5", collapsed ? "w-12 h-10" : "w-48 h-16")}>
        {!imgError ? (
          <Image
            src={logoSrc}
            alt="IQRO Logo"
            fill
            sizes="(max-width: 768px) 150px, 200px"
            className={cn("object-contain scale-[2] origin-left pointer-events-none", collapsed ? "object-center scale-[1.5]" : "object-left")}
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={cn("font-black tracking-tight flex items-center h-full", collapsed ? "text-xl" : "text-3xl", isDark ? "text-white" : "text-indigo-600 dark:text-white")}>
            IQRO
          </span>
        )}
      </div>
      {!collapsed && subtitle && (
        <span className={cn("text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 ml-1 whitespace-nowrap overflow-hidden text-ellipsis", textClassName)}>
          {subtitle}
        </span>
      )}
    </Link>
  )
}
