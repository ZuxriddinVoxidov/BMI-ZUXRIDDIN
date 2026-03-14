'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Get or create today's session for user
export async function getOrCreateTodaySession(userId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Check if today's session exists
  const { data: existing } = await admin
    .from('ai_chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) return existing

  // Create new session for today
  const { data: newSession } = await admin
    .from('ai_chat_sessions')
    .insert({
      user_id: userId,
      date: today,
      title: new Date().toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    })
    .select()
    .single()

  return newSession
}

// Get all sessions for user (history)
export async function getUserSessions(userId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('ai_chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)
  return data || []
}

// Get messages for a session
export async function getSessionMessages(sessionId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('ai_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  return data || []
}

// Save message to session
export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('ai_chat_messages')
    .insert({ session_id: sessionId, role, content })
    .select()
    .single()
  return data
}

// Create new chat session
export async function createNewSession(userId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await admin
    .from('ai_chat_sessions')
    .insert({
      user_id: userId,
      date: today,
      title:
        new Date().toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' - Yangi suhbat',
    })
    .select()
    .single()
  return data
}
