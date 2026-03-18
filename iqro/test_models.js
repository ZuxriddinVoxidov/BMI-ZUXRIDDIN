const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1);
  const models = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Salom' }] }],
        generationConfig: { maxOutputTokens: 10 }
      });
      console.log(`Model ${m} WORKS!`);
    } catch(e) {
      console.error(`Model ${m} FAILED: ${e.message.split('\n')[0].substring(0, 60)}`);
    }
  }
}
run();
