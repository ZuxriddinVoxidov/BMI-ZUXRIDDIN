import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { askGemini } from '@/lib/ai/gemini'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tilmagan' }, { status: 401 })
    }

    const body = await req.json()
    const { topic, count, clubId, clubName, targetGrades } = body

    if (!topic || !count) {
      return NextResponse.json({ error: 'Mavzu va savollar soni kiritilishi shart' }, { status: 400 })
    }

    const prompt = `You are a quiz generator. Generate exactly ${count} multiple choice questions about "${topic}" for ${targetGrades ? `grades ${targetGrades}` : 'school students'} studying ${clubName || topic}.

CRITICAL RULES:
1. Return ONLY a valid JSON object, no markdown, no explanations
2. Use double quotes for all strings
3. Do NOT use apostrophes or single quotes inside string values
4. Replace apostrophe words: use "va" instead of contractions
5. The correct_answer must be exactly one of: A, B, C, or D

Return this exact structure:
{"questions":[{"question":"Question text here","option_a":"Option A text","option_b":"Option B text","option_c":"Option C text","option_d":"Option D text","correct_answer":"A"}]}`

    const textResult = await askGemini('Faqat qat\'iy kutingan JSON javob qaytar.', prompt)
    
    try {
      const rawText = textResult // your Gemini response text
      
      // Remove ALL possible markdown wrappers
      let jsonStr = rawText
        .replace(/^[\s\S]*?(\{)/m, '{')  // everything before first {
        .replace(/\}[\s\S]*$/m, '}')     // everything after last }
      
      // Find the actual JSON boundaries
      const start = rawText.indexOf('{"questions"')
      if (start !== -1) {
        const sub = rawText.slice(start)
        // Find matching closing brace
        let depth = 0
        let end = -1
        for (let i = 0; i < sub.length; i++) {
          if (sub[i] === '{') depth++
          if (sub[i] === '}') depth--
          if (depth === 0) { end = i; break }
        }
        if (end !== -1) {
          jsonStr = sub.slice(0, end + 1)
        }
      }
      
      const parsed = JSON.parse(jsonStr)
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        return NextResponse.json({ error: 'Savollar topilmadi. Qayta urinib koring.' }, { status: 500 })
      }
      
      return NextResponse.json({ questions: parsed.questions })
    } catch (err) {
      console.error('Quiz parse error:', err, 'Raw:', textResult)
      return NextResponse.json({ 
        error: 'AI javobini o\'qib bo\'lmadi. Mavzuni o\'zgartirib qayta urining.' 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Quiz generation error:', error)
    return NextResponse.json({ error: error.message || 'Ichki xatolik' }, { status: 500 })
  }
}
