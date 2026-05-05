import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topic, count, clubName, targetGrades } = await req.json()

    const apiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
    ].filter(Boolean) as string[]

    const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
    let rawText = ''
    let lastError = ''

    outer: for (const modelName of fallbackModels) {
      for (const key of apiKeys) {
        try {
          const genAI = new GoogleGenerativeAI(key)
          const model = genAI.getGenerativeModel({ model: modelName })

          const prompt = `Generate ${count} multiple choice quiz questions about "${topic}" for ${clubName || 'school'} club${targetGrades ? ` (grades ${targetGrades})` : ''}.

STRICT OUTPUT FORMAT - return ONLY this JSON, nothing else:
{"questions":[{"question":"Q1 text","option_a":"A text","option_b":"B text","option_c":"C text","option_d":"D text","correct_answer":"A"},{"question":"Q2 text","option_a":"A text","option_b":"B text","option_c":"C text","option_d":"D text","correct_answer":"B"}]}

RULES:
- Write all text in Uzbek language
- Do NOT use apostrophe character (') anywhere in the output
- Instead of words like "o'simlik" write "osimlik" or rephrase
- Instead of "bo'lim" write "qism"
- Instead of "a'lo" write "yaxshi"  
- Use only standard ASCII punctuation
- correct_answer must be exactly A, B, C, or D
- Return ONLY the JSON object, no markdown, no backticks, no explanation`

          const result = await model.generateContent(prompt)
          rawText = result.response.text()
          console.log(`✅ Quiz generated via model: ${modelName}`)
          break outer
        } catch (e) {
          lastError = String(e)
          console.error(`Quiz model [${modelName}] failed:`, e)
          continue
        }
      }
    }

    if (!rawText) {
      return NextResponse.json({ error: lastError || 'AI javob bermadi' }, { status: 500 })
    }

    // Clean the response
    const cleaned = rawText
      // Remove markdown
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      // Remove all apostrophes and smart quotes to prevent JSON parse errors
      .replace(/[\u2018\u2019\u02BC]/g, '')
      .replace(/(?<=[a-zA-ZaAoOuU\u0400-\u04FF])'(?=[a-zA-ZaAoOuU\u0400-\u04FF])/g, '')
      .trim()

    // Extract JSON boundaries
    const start = cleaned.indexOf('{"questions"')
    const altStart = cleaned.indexOf('{')
    const jsonStart = start !== -1 ? start : altStart
    
    if (jsonStart === -1) {
      console.error('No JSON found in:', cleaned.slice(0, 200))
      return NextResponse.json({ error: 'AI formatsiz javob berdi. Qayta urining.' }, { status: 500 })
    }

    // Find matching closing brace using depth counter
    const sub = cleaned.slice(jsonStart)
    let depth = 0
    let jsonEnd = -1
    for (let i = 0; i < sub.length; i++) {
      if (sub[i] === '{') depth++
      else if (sub[i] === '}') {
        depth--
        if (depth === 0) { jsonEnd = i; break }
      }
    }

    if (jsonEnd === -1) {
      console.error('No closing brace found in:', cleaned.slice(0, 200))
      return NextResponse.json({ error: 'AI javobini o\'qib bo\'lmadi. Qayta urining.' }, { status: 500 })
    }

    const jsonStr = sub.slice(0, jsonEnd + 1)

    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Attempted to parse:', jsonStr.slice(0, 300))
      return NextResponse.json({ 
        error: 'Savol yaratishda xatolik. Mavzuni o\'zgartirib qayta urining.' 
      }, { status: 500 })
    }

    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json({ error: 'Savollar topilmadi. Qayta urining.' }, { status: 500 })
    }

    // Validate and clean each question
    const validQuestions = parsed.questions
      .filter((q: Record<string, string>) => 
        q.question && q.option_a && q.option_b && 
        q.option_c && q.option_d && 
        ['A','B','C','D'].includes(q.correct_answer)
      )
      .map((q: Record<string, string>, i: number) => ({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer as 'A'|'B'|'C'|'D',
        order_index: i
      }))

    if (validQuestions.length === 0) {
      return NextResponse.json({ error: 'Yaroqli savollar topilmadi. Qayta urining.' }, { status: 500 })
    }

    return NextResponse.json({ questions: validQuestions })

  } catch (error) {
    console.error('Quiz route error:', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
