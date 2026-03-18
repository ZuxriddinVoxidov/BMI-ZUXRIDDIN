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
    const { topic, count, clubId } = body

    if (!topic || !count) {
      return NextResponse.json({ error: 'Mavzu va savollar soni kiritilishi shart' }, { status: 400 })
    }

    const prompt = `Sen o'zbek maktabidagi o'qituvchiga test savollari tuzib berayapsan.
Mavzu: ${topic}
Savollar soni: ${count}
Har bir savol uchun 4 ta variant (A, B, C, D) va to'g'ri javob ko'rsat.

FAQAT quyidagi JSON formatda javob ber, boshqa hech narsa yozma:
{
  "questions": [
    {
      "question": "Savol matni?",
      "option_a": "Variant A",
      "option_b": "Variant B", 
      "option_c": "Variant C",
      "option_d": "Variant D",
      "correct_answer": "A"
    }
  ]
}`

    const textResult = await askGemini('Faqat qat\'iy kutingan JSON javob qaytar.', prompt)
    
    // Clean up potential markdown formatting in Gemini response
    const cleanJson = textResult.replace(/```json\n/g, '').replace(/```\n/g, '').replace(/```/g, '').trim()
    
    const parsedResult = JSON.parse(cleanJson)

    return NextResponse.json(parsedResult)

  } catch (error: any) {
    console.error('Quiz generation error:', error)
    return NextResponse.json({ error: error.message || 'Ichki xatolik' }, { status: 500 })
  }
}
