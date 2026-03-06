'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Profil</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">
            AT
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Alibek Toshmatov</h2>
            <p className="text-sm text-gray-500">O&apos;quvchi · 9-sinf</p>
          </div>
        </div>

        <form className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Ism</Label>
              <Input defaultValue="Alibek" className="mt-2 h-11 rounded-xl border-gray-200" />
            </div>
            <div>
              <Label className="text-gray-700 font-medium">Familiya</Label>
              <Input defaultValue="Toshmatov" className="mt-2 h-11 rounded-xl border-gray-200" />
            </div>
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Email</Label>
            <Input defaultValue="alibek@eduflow.uz" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Telefon</Label>
            <Input defaultValue="+998 90 123 45 67" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Sinf</Label>
            <Input defaultValue="9-A" className="mt-2 h-11 rounded-xl border-gray-200" readOnly />
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-11 text-sm font-semibold">
            Saqlash
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
