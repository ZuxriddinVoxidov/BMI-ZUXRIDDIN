'use client'

import { createClub, deleteClub, updateClub } from '@/app/actions/clubs'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Pencil, Plus, Trash2, User, Users } from 'lucide-react'
import { useState } from 'react'

const CATEGORIES = [
  { value: 'Texnologiya', label: 'Texnologiya', color: 'bg-blue-100 text-blue-700' },
  { value: 'Sport', label: 'Sport', color: 'bg-green-100 text-green-700' },
  { value: "San'at", label: "San'at", color: 'bg-purple-100 text-purple-700' },
  { value: 'Fan', label: 'Fan', color: 'bg-orange-100 text-orange-700' },
  { value: 'Til', label: 'Til', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'Musiqa', label: 'Musiqa', color: 'bg-pink-100 text-pink-700' },
  { value: 'Boshqa', label: 'Boshqa', color: 'bg-gray-100 text-gray-700' },
]

function getCategoryStyle(category: string) {
  return CATEGORIES.find((c) => c.value === category) || CATEGORIES[CATEGORIES.length - 1]
}

interface Club {
  id: string
  name: string
  category: string
  schedule: string
  room?: string
  max_students: number
  description?: string
  teacher: { id: string; full_name: string } | null
  enrollment_count?: number
}

interface Teacher {
  id: string
  full_name: string
}

export default function ClubsManager({
  clubs,
  teachers,
  schoolId,
}: {
  clubs: Club[]
  teachers: Teacher[]
  schoolId: string
}) {
  const [open, setOpen] = useState(false)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [schedule, setSchedule] = useState('')
  const [room, setRoom] = useState('')
  const [maxStudents, setMaxStudents] = useState(30)
  const [description, setDescription] = useState('')

  function resetForm() {
    setName('')
    setCategory('')
    setTeacherId('')
    setSchedule('')
    setRoom('')
    setMaxStudents(30)
    setDescription('')
    setEditingClub(null)
  }

  function openEdit(club: Club) {
    setEditingClub(club)
    setName(club.name)
    setCategory(club.category || '')
    setTeacherId(club.teacher?.id || '')
    setSchedule(club.schedule || '')
    setRoom(club.room || '')
    setMaxStudents(club.max_students || 30)
    setDescription(club.description || '')
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !category || !teacherId || !schedule) return
    setLoading(true)
    try {
      if (editingClub) {
        await updateClub(editingClub.id, {
          name, category, teacher_id: teacherId, schedule,
          room: room || undefined, max_students: maxStudents,
          description: description || undefined,
        })
      } else {
        await createClub({
          name, category, teacher_id: teacherId, schedule,
          room: room || undefined, max_students: maxStudents,
          description: description || undefined, school_id: schoolId,
        })
      }
      setOpen(false)
      resetForm()
    } catch {
      // errors handled
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setLoading(true)
    await deleteClub(id)
    setDeleteConfirm(null)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            To&apos;garaklar boshqaruvi
          </h1>
          <p className="text-sm text-gray-500 mt-1">{clubs.length} ta to&apos;garak</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}
        >
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
              <Plus size={18} /> Yangi to&apos;garak
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingClub ? "To'garakni tahrirlash" : "Yangi to'garak qo'shish"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label>To&apos;garak nomi *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Robototexnika" required className="mt-1" />
              </div>
              <div>
                <Label>Kategoriya *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>O&apos;qituvchi *</Label>
                <Select value={teacherId} onValueChange={setTeacherId} required>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dars jadvali *</Label>
                <Input value={schedule} onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Dushanba, Chorshanba 14:00" required className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Xona</Label>
                  <Input value={room} onChange={(e) => setRoom(e.target.value)}
                    placeholder="205-xona" className="mt-1" />
                </div>
                <div>
                  <Label>Maks. o&apos;quvchilar *</Label>
                  <Input type="number" value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    min={1} max={100} required className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Tavsif</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="To'garak haqida qisqacha..." className="mt-1" rows={3} />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? 'Saqlanmoqda...' : editingClub ? 'Yangilash' : "Qo'shish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clubs Grid */}
      {clubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-5xl">🏫</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Hali to&apos;garak qo&apos;shilmagan
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Birinchi to&apos;garakni qo&apos;shing
          </p>
          <Button onClick={() => setOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
            <Plus size={18} /> To&apos;garak qo&apos;shish
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {clubs.map((club, i) => {
            const catStyle = getCategoryStyle(club.category)
            return (
              <motion.div key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <div className="px-6 py-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${catStyle.color}`}>
                        {club.category}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg">{club.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <User size={14} className="text-gray-400" />
                      <span>{club.teacher?.full_name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{club.schedule || '-'}</span>
                    </div>
                    {club.room && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{club.room}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users size={14} className="text-gray-400" />
                      <span>{club.enrollment_count || 0} / {club.max_students}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => openEdit(club)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                      <Pencil size={14} /> Tahrir
                    </button>
                    {deleteConfirm === club.id ? (
                      <div className="flex-1 flex gap-1">
                        <button onClick={() => handleDelete(club.id)} disabled={loading}
                          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600">
                          Ha
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">
                          Yoʻq
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(club.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                        <Trash2 size={14} /> O&apos;chirish
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
