import Anthropic from '@anthropic-ai/sdk'

const CLAUDE_KEYS = [
  process.env.ANTHROPIC_API_KEY_1,
  process.env.ANTHROPIC_API_KEY_2,
  process.env.ANTHROPIC_API_KEY_3,
  process.env.ANTHROPIC_API_KEY_4,
].filter(Boolean) as string[]

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function askClaude(
  systemPrompt: string,
  input: string | ChatMessage[]
): Promise<string> {
  // Support both string and messages array
  const messages: ChatMessage[] = typeof input === 'string'
    ? [{ role: 'user', content: input }]
    : input

  // Ensure messages alternate properly and start with 'user'
  const cleanMessages = messages
    .filter(m => m.content?.trim())
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }))

  if (cleanMessages.length === 0) {
    cleanMessages.push({ role: 'user', content: 'Salom' })
  }

  // Ensure first message is from user
  if (cleanMessages[0].role !== 'user') {
    cleanMessages.unshift({ role: 'user', content: 'Salom' })
  }

  let lastError: Error | null = null

  for (const apiKey of CLAUDE_KEYS) {
    try {
      const anthropic = new Anthropic({ apiKey })
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: cleanMessages,
      })
      const block = message.content[0]
      return block.type === 'text' ? block.text : ''
    } catch (error) {
      console.warn(`Claude key failed, trying next...`, error)
      lastError = error as Error
      continue
    }
  }

  throw lastError || new Error('All Claude API keys failed')
}
