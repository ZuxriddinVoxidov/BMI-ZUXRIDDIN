const fs = require('fs');
let code = fs.readFileSync('src/app/api/ai/student/route.ts', 'utf8');
const startIdx = code.indexOf('const systemPrompt = `');
if (startIdx !== -1) {
  const replacement = `const systemPrompt = \`Sen IQRO maktab platformasidagi o'quvchiga yordam beruvchi aqlli AI assistentsan.

O'QUVCHI MA'LUMOTLARI:
\${profileContext}

TO'GARAKLAR:
\${clubsContext || "Hali hech qaysi to'garakka a'zo emas."}

QOIDALAR:
1. FAQAT yuqoridagi to'garaklar va ularning fanlari doirasida javob ber
2. Agar test so'ralsa tuz, maksimal 10 ta savol.
3. Har doim o'zbek tilida, aniq va tushunarli javob ber
4. Bugungi sana: \${currentDate}\`

    const model = getGeminiModel()
    
    // Simple non-streaming call:
    const result = await model.generateContent({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contents: conversationMessages.map((m: any) => ({
         role: m.role === 'assistant' ? 'model' : 'user',
         parts: [{ text: m.content }]
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        maxOutputTokens: 1500,  // Limit output to prevent timeout
        temperature: 0.7,
      }
    })

    const responseText = result.response.text()

    if (sessionId) {
      await admin.from('ai_chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: responseText
      })
    }

    return NextResponse.json({ reply: responseText })
  } catch (error) {
    console.error('AI route error:', error)
    return NextResponse.json(
      { error: "AI javob bermadi. Qayta urinib ko'ring." },
      { status: 500 }
    )
  }
}
`;
  code = code.substring(0, startIdx) + replacement;
  fs.writeFileSync('src/app/api/ai/student/route.ts', code);
}
