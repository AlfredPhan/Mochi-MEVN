// models/ChatHistory.js
const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Nếu user chưa đăng nhập thì để null
  sessionId: { type: String }, // Lưu theo session nếu cần
  messages: [
    {
      sender: { type: String, enum: ['user', 'bot'] },
      text: String,
      time: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
