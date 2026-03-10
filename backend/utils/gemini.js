// backend/utils/gemini.js
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "models/gemini-1.5-flash";

async function askGemini(prompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent`;

  try {
    const response = await axios.post(
      `${endpoint}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        }
      },
      {
        timeout: 15000 // 15s
      }
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, no answer from AI!"
    );
  } catch (err) {
    const errMsg = err?.response?.data?.error?.message || err.message;
    console.error("Gemini API error:", errMsg);
    return `Sorry, I could not reach AI: ${errMsg}`;
  }
}

// Kiểm tra Gemini có khả dụng không (dùng để skip Gemini nếu timeout)
async function isGeminiAvailable() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000); // 3s probe
    await axios.get('https://generativelanguage.googleapis.com', {
      timeout: 3000,
      signal: controller.signal
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

module.exports = { askGemini, isGeminiAvailable };