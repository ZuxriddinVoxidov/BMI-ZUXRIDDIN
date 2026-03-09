import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean) as string[]

export async function askGemini(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  let lastError: Error | null = null

  for (const apiKey of GEMINI_KEYS) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
      })
      const result = await model.generateContent(userMessage)
      return result.response.text()
    } catch (error) {
      console.warn(`Gemini key failed, trying next...`, error)
      lastError = error as Error
      continue
    }
  }

  throw lastError || new Error('All Gemini API keys failed')
}
