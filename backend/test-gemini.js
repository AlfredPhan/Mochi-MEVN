// backend/test-gemini.js
const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

// endpoint v1beta mới hoạt động ổn định
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

(async () => {
  try {
    const prompt = "Chào Gemini! Bạn có thể trả lời tin nhắn này bằng tiếng Việt không?";
    const res = await axios.post(
      `${endpoint}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );
    console.log("✅ Gemini response:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response && err.response.data) {
      console.error("❌ Gemini error (API):", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("❌ Gemini error (OTHER):", err.message);
    }
  }
})();
