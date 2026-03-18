import { GoogleGenerativeAI } from '@google/generative-ai'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean) as string[]

export async function askGemini(
  systemPrompt: string,
  input: string | ChatMessage[]
): Promise<string> {
  const messages: ChatMessage[] = typeof input === 'string'
    ? [{ role: 'user', content: input }]
    : input.filter(m => m.content?.trim())

  if (messages.length === 0) {
    messages.push({ role: 'user', content: 'Salom' })
  }

  let lastError: Error | null = null

  for (const apiKey of GEMINI_KEYS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Gemini API error:', JSON.stringify(data))
        throw new Error(data.error?.message || `HTTP ${response.status}`)
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text

      console.error('Gemini empty response:', JSON.stringify(data))
      throw new Error('Empty response from Gemini')
    } catch (error) {
      console.error(`Gemini key failed:`, error)
      lastError = error as Error
      continue
    }
  }

  throw lastError || new Error('All Gemini API keys failed')
}

export async function askGeminiStream(
  systemPrompt: string,
  input: string | ChatMessage[]
) {
  const messages: ChatMessage[] = typeof input === 'string'
    ? [{ role: 'user', content: input }]
    : input.filter(m => m.content?.trim())

  if (messages.length === 0) {
    messages.push({ role: 'user', content: 'Salom' })
  }

  let lastError: Error | null = null

  for (const apiKey of GEMINI_KEYS) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
      })

      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      const result = await model.generateContentStream({
        contents,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        }
      })
      
      return result
    } catch (error) {
      console.error(`Gemini key failed:`, error)
      lastError = error as Error
      continue
    }
  }

  throw lastError || new Error('All Gemini API keys failed')
}
