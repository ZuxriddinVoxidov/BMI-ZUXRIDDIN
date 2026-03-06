'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export default function DirectorProfilePage() {
  return (
    <div className="space-y-8">
      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Profil</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl">NR</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Nodira Rahimova</h3>
            <p className="text-sm text-gray-500">Maktab direktori</p>
          </div>
        </div>
        <form className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Ism</Label>
              <Input defaultValue="Nodira" className="mt-2 h-11 rounded-xl border-gray-200" />
            </div>
            <div>
              <Label className="text-gray-700 font-medium">Familiya</Label>
              <Input defaultValue="Rahimova" className="mt-2 h-11 rounded-xl border-gray-200" />
            </div>
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Email</Label>
            <Input defaultValue="direktor@eduflow.uz" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Telefon</Label>
            <Input defaultValue="+998 71 200 00 01" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-11">Saqlash</Button>
        </form>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sozlamalar</h2>
        <form className="space-y-5">
          <div>
            <Label className="text-gray-700 font-medium">Maktab nomi</Label>
            <Input defaultValue="3-sonli umumta'lim maktabi" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Maktab manzili</Label>
            <Input defaultValue="Toshkent, Yunusobod tumani" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Admin email</Label>
            <Input defaultValue="zuhriddinvohidov9@gmail.com" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-11">Saqlash</Button>
        </form>
      </motion.div>
    </div>
  )
}
