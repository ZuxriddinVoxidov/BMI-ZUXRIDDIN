import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  collapsed?: boolean
  href?: string
  className?: string
  textClassName?: string
  subtitle?: string
}

export function Logo({ collapsed = false, href = '/', className, textClassName, subtitle }: LogoProps) {
  return (
    <Link href={href} className={cn("flex flex-col justify-center min-w-0", className)}>
      <div className={cn("relative flex-shrink-0 transition-all duration-300 mt-1.5", collapsed ? "w-12 h-10" : "w-48 h-16")}>
        <Image
          src="/logo.png"
          alt="IQRO Logo"
          fill
          sizes="(max-width: 768px) 150px, 200px"
          className={cn("object-contain scale-[2] origin-left", collapsed ? "object-center scale-[1.5]" : "object-left")}
          priority
        />
      </div>
      {!collapsed && subtitle && (
        <span className="text-[10px] text-gray-400 mt-0.5 ml-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {subtitle}
        </span>
      )}
    </Link>
  )
}
