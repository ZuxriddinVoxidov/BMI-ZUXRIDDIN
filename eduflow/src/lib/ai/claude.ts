interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const CLAUDE_KEYS = [
  process.env.ANTHROPIC_API_KEY_1,
  process.env.ANTHROPIC_API_KEY_2,
  process.env.ANTHROPIC_API_KEY_3,
  process.env.ANTHROPIC_API_KEY_4,
].filter(Boolean) as string[]

export async function askClaude(
  systemPrompt: string,
  input: string | ChatMessage[]
): Promise<string> {
  let messages: ChatMessage[] = typeof input === 'string'
    ? [{ role: 'user', content: input }]
    : input.filter(m => m.content?.trim())

  if (messages.length === 0) {
    messages = [{ role: 'user', content: 'Salom' }]
  }

  // Ensure first message is from user
  if (messages[0].role !== 'user') {
    messages = [{ role: 'user', content: 'Salom' }, ...messages]
  }

  // Ensure alternating roles (Claude requirement)
  const cleanMessages: ChatMessage[] = []
  for (const m of messages) {
    const last = cleanMessages[cleanMessages.length - 1]
    if (last && last.role === m.role) {
      // Merge consecutive same-role messages
      last.content += '\n' + m.content
    } else {
      cleanMessages.push({ role: m.role, content: m.content })
    }
  }

  let lastError: Error | null = null

  for (const apiKey of CLAUDE_KEYS) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: cleanMessages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Claude API error:', JSON.stringify(data))
        throw new Error(data.error?.message || `HTTP ${response.status}`)
      }

      const text = data.content?.[0]?.text
      if (text) return text

      console.error('Claude empty response:', JSON.stringify(data))
      throw new Error('Empty response from Claude')
    } catch (error) {
      console.error(`Claude key failed:`, error)
      lastError = error as Error
      continue
    }
  }

  throw lastError || new Error('All Claude API keys failed')
}
