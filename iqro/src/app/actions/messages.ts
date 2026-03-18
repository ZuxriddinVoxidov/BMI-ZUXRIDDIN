'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface ClubMessage {
  id: string
  club_id: string
  sender_id: string
  receiver_id: string
  message: string
  is_read: boolean
  created_at: string
  sender?: { full_name: string; role: string }
  receiver?: { full_name: string; role: string }
}

// Send a message
export async function sendMessage(
  clubId: string,
  receiverId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profil topilmadi' }

  const { error } = await adminClient
    .from('club_messages')
    .insert({
      club_id: clubId,
      sender_id: profile.id,
      receiver_id: receiverId,
      message: message.trim()
    })

  if (error) return { success: false, error: 'Xabar yuborilmadi' }

  revalidatePath(`/clubs/${clubId}`)
  revalidatePath('/teacher/clubs')
  return { success: true }
}

// Get messages for a club (between student and teacher)
export async function getClubMessages(clubId: string): Promise<ClubMessage[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return []

  const { data } = await supabase
    .from('club_messages')
    .select(`
      *,
      sender:profiles!sender_id(full_name, role),
      receiver:profiles!receiver_id(full_name, role)
    `)
    .eq('club_id', clubId)
    .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .order('created_at', { ascending: true })

  return (data || []) as ClubMessage[]
}

// Get all messages for teacher (grouped by club and student)
export async function getTeacherMessages(): Promise<ClubMessage[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return []

  const { data } = await supabase
    .from('club_messages')
    .select(`
      *,
      sender:profiles!sender_id(full_name, role),
      receiver:profiles!receiver_id(full_name, role)
    `)
    .eq('receiver_id', profile.id)
    .order('created_at', { ascending: false })

  return (data || []) as ClubMessage[]
}

// Mark messages as read
export async function markMessagesRead(clubId: string, senderId: string): Promise<void> {
  const supabase = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return

  await adminClient
    .from('club_messages')
    .update({ is_read: true })
    .eq('club_id', clubId)
    .eq('sender_id', senderId)
    .eq('receiver_id', profile.id)
}
