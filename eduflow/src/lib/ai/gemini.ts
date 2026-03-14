import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean) as string[]

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function askGemini(
  systemPrompt: string,
  input: string | ChatMessage[]
): Promise<string> {
  // Support both string and messages array
  const conversationText = typeof input === 'string'
    ? input
    : input
        .filter(m => m.content?.trim())
        .map(m => `${m.role === 'user' ? 'Foydalanuvchi' : 'AI'}: ${m.content}`)
        .join('\n')

  let lastError: Error | null = null

  for (const apiKey of GEMINI_KEYS) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
      })
      const result = await model.generateContent(conversationText)
      return result.response.text()
    } catch (error) {
      console.warn(`Gemini key failed, trying next...`, error)
      lastError = error as Error
      continue
    }
  }

  throw lastError || new Error('All Gemini API keys failed')
}
