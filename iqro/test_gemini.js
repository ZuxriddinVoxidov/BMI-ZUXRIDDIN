const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });
    
    // Simulating exactly what teacher route does
    console.log("Calling generateContent...");
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Salom' }] }],
      systemInstruction: "Sen o'qituvchisan", // The way we wrote it
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      }
    });
    console.log(result.response.text());
  } catch(e) {
    console.error("ERROR OCCURRED:", e.message);
  }
}
run();
