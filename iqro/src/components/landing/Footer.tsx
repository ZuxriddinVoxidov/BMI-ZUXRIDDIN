'use client'

import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div>
            <Logo href="/" className="mb-4" textClassName="text-white" forceDark />
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              46-maktab uchun ishlab chiqilgan maxsus to&apos;garaklar platformasi.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-500 transition-colors"
                >
                  <Icon size={16} className="text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Platforma */}
          <div>
            <h3 className="font-bold text-base mb-4">Platforma</h3>
            <ul className="space-y-3">
              {["To'garaklar", 'Davomat', 'Hisobotlar', 'Statistika'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Kompaniya */}
          <div>
            <h3 className="font-bold text-base mb-4">Kompaniya</h3>
            <ul className="space-y-3">
              {['Haqimizda', 'Jamoamiz', 'Yangiliklar', 'Karyera'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Bog'lanish */}
          <div>
            <h3 className="font-bold text-base mb-4">Bog&apos;lanish</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <span>✉</span>
                <span>info@iqro46.uz</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <span>📞</span>
                <span>+998 93 201 75 74</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <span>📍</span>
                <span>Buvayda tumani, Hakimto&apos;ra MFY</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2026 IQRO. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  )
}
