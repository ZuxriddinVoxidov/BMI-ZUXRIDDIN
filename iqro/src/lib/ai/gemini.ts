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

// gemini-2.5-flash-lite: 1000 RPD, bepul, ishlayapti
const MODEL = 'gemini-2.5-flash-lite'

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

  for (let attempt = 0; attempt < 2; attempt++) {
    for (const apiKey of GEMINI_KEYS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

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

        if (response.status === 503 || response.status === 429) {
          console.warn(`Gemini ${response.status}, retrying...`)
          throw new Error(`HTTP ${response.status}: ${data.error?.message}`)
        }

        if (!response.ok) {
          console.error('Gemini API error:', JSON.stringify(data))
          throw new Error(data.error?.message || `HTTP ${response.status}`)
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text

        throw new Error('Empty response from Gemini')
      } catch (error) {
        console.error(`Gemini attempt ${attempt + 1}, key failed:`, error)
        lastError = error as Error
        continue
      }
    }

    if (attempt === 0) {
      await sleep(2000)
    }
  }

  throw lastError || new Error('All Gemini API keys failed after retries')
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

  for (let attempt = 0; attempt < 2; attempt++) {
    for (const apiKey of GEMINI_KEYS) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: MODEL,
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
        console.error(`Gemini stream attempt ${attempt + 1} key failed:`, error)
        lastError = error as Error
        continue
      }
    }

    if (attempt === 0) {
      await sleep(2000)
    }
  }

  throw lastError || new Error('All Gemini API keys failed after retries')
}

export function getGeminiModel() {
  const apiKey = GEMINI_KEYS[0]
  if (!apiKey) throw new Error("API kalit topilmadi")
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: MODEL })
}
