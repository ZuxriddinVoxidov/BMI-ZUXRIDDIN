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

// Fallback modellar: asosiysi ishlamasa keyingisiga o'tadi
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

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

  for (const modelName of FALLBACK_MODELS) {
    for (const apiKey of GEMINI_KEYS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

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
          console.error(`Gemini [${modelName}] API error:`, JSON.stringify(data))
          throw new Error(data.error?.message || `HTTP ${response.status}`)
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          console.log(`✅ Gemini responded via model: ${modelName}`)
          return text
        }

        console.error(`Gemini [${modelName}] empty response:`, JSON.stringify(data))
        throw new Error('Empty response from Gemini')
      } catch (error) {
        console.error(`Gemini [${modelName}] key failed:`, error)
        lastError = error as Error
        continue
      }
    }
  }

  throw lastError || new Error('All Gemini models and API keys failed')
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

  for (const modelName of FALLBACK_MODELS) {
    for (const apiKey of GEMINI_KEYS) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: modelName,
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

        console.log(`✅ Gemini stream via model: ${modelName}`)
        return result
      } catch (error) {
        console.error(`Gemini stream [${modelName}] key failed:`, error)
        lastError = error as Error
        continue
      }
    }
  }

  throw lastError || new Error('All Gemini models and API keys failed')
}

export function getGeminiModel() {
  const apiKey = GEMINI_KEYS[0]
  if (!apiKey) throw new Error("API kalit topilmadi")
  const genAI = new GoogleGenerativeAI(apiKey)
  // Try primary model first; fallback handled at call sites
  return genAI.getGenerativeModel({ model: FALLBACK_MODELS[0] })
}
