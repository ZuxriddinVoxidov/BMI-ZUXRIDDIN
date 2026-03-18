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

MUHIM: Faqat sof JSON qaytar, hech qanday izoh yoki markdown yozma.
Javob formati:
{"questions":[{"question":"savol?","option_a":"A variant","option_b":"B variant","option_c":"C variant","option_d":"D variant","correct_answer":"A"}]}`

    const textResult = await askGemini('Faqat qat\'iy kutingan JSON javob qaytar.', prompt)
    
    // Strip markdown code blocks if present
    const cleaned = textResult
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    // Find the JSON object in the response
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'AI javob formati noto\'g\'ri' }, { status: 500 })
    }
    
    const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1)
    const parsedResult = JSON.parse(jsonStr)

    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error('Quiz generation error:', error)
    return NextResponse.json({ error: error.message || 'Ichki xatolik' }, { status: 500 })
  }
}
