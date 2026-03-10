// backend/utils/chatHistory.js
const ChatHistory = require('../models/ChatHistory');

async function saveChatHistory(sessionId, sender, text, userId = null) {
    let chat = await ChatHistory.findOne({ sessionId });
    if (!chat) {
        chat = new ChatHistory({ 
            sessionId, 
            userId: userId, // Lưu userId khi tạo mới
            messages: [] 
        });
    } else if (userId && !chat.userId) {
        // Nếu chat đã tồn tại nhưng chưa có userId (user vừa login)
        chat.userId = userId;
    }
    
    chat.messages.push({ sender, text, time: new Date() });
    await chat.save();
}

module.exports = { saveChatHistory };