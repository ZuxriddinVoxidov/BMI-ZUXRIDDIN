'use client'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('hero')
  const pathname = usePathname()

  const isHome = pathname === '/'

  // Scroll-spy — only on landing page
  useEffect(() => {
    if (!isHome) return

    const sectionIds = ['hero', 'clubs', 'features', 'leaderboard', 'testimonials']

    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      )
      observer.observe(el)
      return observer
    })

    return () => {
      observers.forEach((obs, i) => {
        const el = document.getElementById(sectionIds[i])
        if (obs && el) obs.unobserve(el)
      })
    }
  }, [isHome])

  const navLinks = [
    { label: 'Bosh sahifa', href: isHome ? '#hero' : '/', section: 'hero', page: '/' },
    { label: "To'garaklar", href: isHome ? '#clubs' : '/#clubs', section: 'clubs', page: null },
    { label: 'Reyting', href: isHome ? '#leaderboard' : '/#leaderboard', section: 'leaderboard', page: null },
    { label: "Maktab haqida", href: '/about', section: null, page: '/about' },
    { label: "Bog'lanish", href: '/contact', section: null, page: '/contact' },
  ]

  function isLinkActive(link: { page: string | null; section: string | null }) {
    if (isHome) {
      // On home page use scroll-spy
      return link.section === activeSection
    }
    // On other pages match pathname
    return link.page !== null && pathname === link.page
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo href="/" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const active = isLinkActive(link)
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative text-sm transition-all duration-200 after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-full after:bg-indigo-600 after:rounded-full after:origin-left after:transition-transform after:duration-200 ${
                      active
                        ? 'text-indigo-600 dark:text-indigo-400 font-medium after:scale-x-100'
                        : 'text-gray-600 dark:text-gray-300 after:scale-x-0 hover:text-indigo-600 dark:hover:text-indigo-400 hover:after:scale-x-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2 ml-4">
              <ThemeToggle />
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 rounded-full px-5 h-9 text-sm font-medium transition-all duration-200"
                asChild
              >
                <Link href="/login">Kirish</Link>
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.03] active:scale-95 text-white rounded-full px-5 h-9 text-sm font-medium shadow-md hover:shadow-indigo-500/30 transition-all duration-200" asChild>
                <Link href="/login?tab=register">Ro&apos;yxatdan o&apos;tish</Link>
              </Button>
            </div>

            {/* Mobile items (Hamburger) */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} className="dark:text-gray-200" /> : <Menu size={22} className="dark:text-gray-200" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 shadow-2xl border-b border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col px-4 py-4 gap-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link)
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-base font-medium transition-all duration-200 rounded-xl py-3.5 ${
                      active
                        ? 'border-l-2 border-indigo-600 pl-3 pr-4 text-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                        : 'px-4 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-l-2 hover:border-indigo-400 hover:pl-3 hover:pr-4'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="outline"
                  className="w-full h-12 border-indigo-500 text-indigo-600 rounded-full text-base font-semibold"
                  asChild
                >
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Kirish</Link>
                </Button>
                <Button
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-base font-semibold"
                  asChild
                >
                  <Link href="/login?tab=register" onClick={() => setMobileOpen(false)}>Ro&apos;yxatdan o&apos;tish</Link>
                </Button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
