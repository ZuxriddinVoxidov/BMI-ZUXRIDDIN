'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Sozlamalar</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl"
      >
        <form className="space-y-6">
          <div>
            <Label className="text-gray-700 font-medium">Maktab nomi</Label>
            <Input
              defaultValue="3-sonli umumta'lim maktabi"
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Maktab manzili</Label>
            <Input
              defaultValue="Toshkent, Yunusobod tumani"
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Admin email</Label>
            <Input
              defaultValue="zuhriddinvohidov9@gmail.com"
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Telefon</Label>
            <Input
              defaultValue="+998 71 200 00 00"
              className="mt-2 h-12 rounded-xl border-gray-200"
            />
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 text-base font-semibold">
            Saqlash
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
