'use client'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/shared/Logo'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Bosh sahifa', href: '#hero' },
    { label: "To'garaklar", href: '#clubs' },
    { label: 'Haqida', href: '#features' },
    { label: "Bog'lanish", href: '/contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
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
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-full px-6"
              asChild
            >
              <Link href="/login">Kirish</Link>
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6" asChild>
              <Link href="/login">Ro&apos;yxatdan o&apos;tish</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2">
            <nav className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-2 py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-2">
                <Button
                  variant="outline"
                  className="w-full border-indigo-500 text-indigo-600 rounded-full"
                  asChild
                >
                  <Link href="/login">Kirish</Link>
                </Button>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full" asChild>
                  <Link href="/login">Ro&apos;yxatdan o&apos;tish</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
