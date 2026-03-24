'use client'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Bosh sahifa', href: '#hero' },
    { label: "To'garaklar", href: '#clubs' },
    { label: "Maktab haqida", href: '/about' },
    { label: "Bog'lanish", href: '/contact' },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo href="/" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full px-6"
                asChild
              >
                <Link href="/login">Kirish</Link>
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6" asChild>
                <Link href="/login">Ro&apos;yxatdan o&apos;tish</Link>
              </Button>
            </div>

            {/* Mobile items (Hamburger) */}
            <div className="flex items-center gap-3 md:pl-3 md:border-l md:border-gray-200 md:dark:border-gray-700">
              <button
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} className="dark:text-gray-200" /> : <Menu size={22} className="dark:text-gray-200" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown — rendered OUTSIDE the header to avoid clipping */}
      {mobileOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Dropdown panel positioned exactly below the 64px header */}
          <div className="fixed top-16 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 shadow-2xl border-b border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col px-4 py-4 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl px-4 py-3.5 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-end p-2 border border-gray-100 dark:border-gray-800 rounded-xl mb-1 bg-gray-50 dark:bg-gray-800/50">
                   <span className="mr-auto text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">Mavzu:</span>
                   <ThemeToggle />
                </div>
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
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Ro&apos;yxatdan o&apos;tish</Link>
                </Button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
