import Anthropic from '@anthropic-ai/sdk'

const CLAUDE_KEYS = [
  process.env.ANTHROPIC_API_KEY_1,
  process.env.ANTHROPIC_API_KEY_2,
  process.env.ANTHROPIC_API_KEY_3,
  process.env.ANTHROPIC_API_KEY_4,
].filter(Boolean) as string[]

export async function askClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  let lastError: Error | null = null

  for (const apiKey of CLAUDE_KEYS) {
    try {
      const anthropic = new Anthropic({ apiKey })
      const message = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
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
