'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export default function TeacherProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Profil</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xl">SX</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sardor Xolmatov</h2>
            <p className="text-sm text-gray-500">O&apos;qituvchi · Robototexnika, Musiqa</p>
          </div>
        </div>

        <form className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Ism</Label>
              <Input defaultValue="Sardor" className="mt-2 h-11 rounded-xl border-gray-200" />
            </div>
            <div>
              <Label className="text-gray-700 font-medium">Familiya</Label>
              <Input defaultValue="Xolmatov" className="mt-2 h-11 rounded-xl border-gray-200" />
            </div>
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Email</Label>
            <Input defaultValue="sardor.teacher@eduflow.uz" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Telefon</Label>
            <Input defaultValue="+998 90 987 65 43" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Mutaxassislik</Label>
            <Input defaultValue="Robototexnika, Musiqa" className="mt-2 h-11 rounded-xl border-gray-200" />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Tajriba</Label>
            <Input defaultValue="8 yil" className="mt-2 h-11 rounded-xl border-gray-200" readOnly />
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-11">Saqlash</Button>
        </form>
      </motion.div>
    </div>
  )
}
