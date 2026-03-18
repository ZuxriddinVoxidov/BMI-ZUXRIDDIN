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

    const prompt = `Sen o'zbek maktabidagi o'qituvchiga test savollari tuzib berayapsan.

To'garak/Fan: ${clubName || topic}
Sinf: ${targetGrades || 'belgilanmagan'}  
Mavzu: ${topic}
Savollar soni: ${count}

MUHIM QOIDALAR:
1. Faqat sof JSON format, hech qanday markdown yoki izoh yozma
2. Barcha matnlarda apostrof belgisi (') ishlatma, uning o'rniga to'liq so'zlarni yoz
3. Masalan: 'o'simlik' o'rniga 'osimlik' yoki to'liq izohlangan so'z yoz
4. Har bir savol aniq va to'liq bo'lsin

Javob formati:
{"questions":[{"question":"savol?","option_a":"A variant","option_b":"B variant","option_c":"C variant","option_d":"D variant","correct_answer":"A"}]}`

    const textResult = await askGemini('Faqat qat\'iy kutingan JSON javob qaytar.', prompt)
    
    // Get raw text from Gemini response
    const rawText = textResult

    // Step 1: Clean markdown
    let cleaned = rawText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    // Step 2: Extract JSON object
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json(
        { error: 'AI javob formati noto\'g\'ri' }, 
        { status: 500 }
      )
    }
    
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1)

    // Step 3: Fix common JSON issues from AI
    // Replace curly quotes with straight quotes
    cleaned = cleaned
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')

    // Step 4: Parse safely
    let parsedResult
    try {
      parsedResult = JSON.parse(cleaned)
    } catch {
      // Step 5: If still fails, ask Gemini again with stricter prompt
      // For now return error with the raw text for debugging
      return NextResponse.json(
        { error: 'JSON parse xatosi. Qayta urinib ko\'ring.' }, 
        { status: 500 }
      )
    }

    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error('Quiz generation error:', error)
    return NextResponse.json({ error: error.message || 'Ichki xatolik' }, { status: 500 })
  }
}
