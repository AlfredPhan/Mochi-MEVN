<template>
  <div class="admin-chats">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">💬</span>
        Chat History
      </h1>
      <p class="page-subtitle">View customer conversations with the chatbot</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card total-chats">
        <div class="stat-icon">💭</div>
        <div class="stat-info">
          <div class="stat-number">{{ chats.length }}</div>
          <div class="stat-label">Total Chats</div>
        </div>
      </div>
      
      <div class="stat-card total-messages">
        <div class="stat-icon">📨</div>
        <div class="stat-info">
          <div class="stat-number">{{ getTotalMessages() }}</div>
          <div class="stat-label">Total Messages</div>
        </div>
      </div>
      
      <div class="stat-card active-users">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-number">{{ getUniqueUsers() }}</div>
          <div class="stat-label">Active Users</div>
        </div>
      </div>
      
      <div class="stat-card today-chats">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <div class="stat-number">{{ getTodayChats() }}</div>
          <div class="stat-label">Today's Chats</div>
        </div>
      </div>
    </div>

    <!-- Chat List Card -->
    <div class="table-card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="card-icon">📋</span>
          Chat Sessions
          <span class="chats-count">({{ chats.length }} sessions)</span>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading chat history...</p>
      </div>

      <!-- Chat Sessions -->
      <div v-else-if="chats.length > 0" class="chats-container">
        <div 
          v-for="chat in chats" 
          :key="chat._id" 
          class="chat-session"
        >
          <!-- Session Header -->
          <div class="session-header">
            <div class="session-info">
              <div class="user-info">
                <div class="user-avatar">
                  {{ getInitials(chat.userId?.name) }}
                </div>
                <div class="user-details">
                  <div class="user-name">{{ getUserDisplayName(chat.userId) }}</div>
                  <div class="user-id">{{ getUserDisplayId(chat.userId) }}</div>
                </div>
              </div>
              
              <div class="session-meta">
                <div class="message-count">
                  <span class="meta-icon">💬</span>
                  {{ chat.messages.length }} messages
                </div>
                <div class="session-date">
                  <span class="meta-icon">🕐</span>
                  {{ formatDate(chat.createdAt) }}
                </div>
              </div>
            </div>
            
            <div class="session-actions">
              <button 
                @click="toggleChat(chat._id)" 
                class="btn-toggle"
                :class="{ 'expanded': expandedChats.has(chat._id) }"
              >
                {{ expandedChats.has(chat._id) ? '▼' : '▶' }}
              </button>
            </div>
          </div>

          <!-- Messages (collapsible) -->
          <div 
            v-if="expandedChats.has(chat._id)" 
            class="messages-container"
          >
            <div class="messages">
              <div 
                v-for="(msg, index) in chat.messages" 
                :key="index"
                :class="['message', msg.sender]"
              >
                <div class="message-content">
                  <div class="message-bubble">
                    <div class="message-text">{{ msg.text }}</div>
                    <div class="message-time">{{ formatTime(msg.time) }}</div>
                  </div>
                  <div class="message-avatar" v-if="msg.sender === 'user'">
                    <span>👤</span>
                  </div>
                  <div class="message-avatar bot-avatar" v-if="msg.sender === 'bot'">
                    <span>🤖</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Collapsed Preview -->
          <div v-else class="message-preview">
            <div class="preview-content">
              <span class="preview-icon">💭</span>
              <span class="preview-text">
                {{ getLastMessage(chat.messages) }}
              </span>
            </div>
            <div class="preview-info">
              {{ getTimeAgo(chat.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>No Chat History Found</h3>
        <p>Customer conversations with the chatbot will appear here.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'

const chats = ref([])
const loading = ref(true)
const showToast = inject('showToast')
const expandedChats = ref(new Set())

const fetchChats = async () => {
  try {
    const res = await fetch('https://mochi-mevn.onrender.com/api/admin/chats', {
      credentials: 'include'
    })
    const data = await res.json()
    chats.value = data
  } catch (err) {
    console.error('Error fetching chats:', err)
    showToast('Failed to load chat history', 'error')
  } finally {
    loading.value = false
  }
}

// Toggle chat expansion
const toggleChat = (chatId) => {
  if (expandedChats.value.has(chatId)) {
    expandedChats.value.delete(chatId)
  } else {
    expandedChats.value.add(chatId)
  }
}

// Get total messages count
const getTotalMessages = () => {
  return chats.value.reduce((total, chat) => total + chat.messages.length, 0)
}

// Get unique users count
const getUniqueUsers = () => {
  const uniqueUsers = new Set()
  chats.value.forEach(chat => {
    if (chat.userId && chat.userId._id) {
      // Count logged-in users
      uniqueUsers.add(chat.userId._id)
    } else {
      // Count anonymous users as separate sessions
      uniqueUsers.add(`anonymous_${chat._id}`)
    }
  })
  return uniqueUsers.size
}

// Get today's chats count
const getTodayChats = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return chats.value.filter(chat => {
    const chatDate = new Date(chat.createdAt)
    chatDate.setHours(0, 0, 0, 0)
    return chatDate.getTime() === today.getTime()
  }).length
}

// Get user initials for avatar
const getInitials = (name) => {
  if (!name) return 'G'  // Guest for anonymous users
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

// Get user display name
const getUserDisplayName = (userId) => {
  if (!userId || !userId.name) {
    return 'Guest User'  // Anonymous user
  }
  return userId.name  // Logged in user
}

// Get user display ID
const getUserDisplayId = (userId) => {
  if (!userId || !userId._id) {
    return 'Anonymous'  // Anonymous user
  }
  return `ID: ${userId._id.substring(0, 8)}...`  // Logged in user
}

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format time
const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get time ago
const getTimeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(dateString)
}

// Get last message for preview
const getLastMessage = (messages) => {
  if (!messages || messages.length === 0) return 'No messages'
  const lastMessage = messages[messages.length - 1]
  const maxLength = 60
  if (lastMessage.text.length <= maxLength) return lastMessage.text
  return lastMessage.text.substring(0, maxLength) + '...'
}

onMounted(fetchChats)
</script>

<style scoped>
.admin-chats {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 2.2rem;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 1.1rem;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent-color);
}

.stat-card.total-chats {
  --accent-color: #3b82f6;
}

.stat-card.total-messages {
  --accent-color: #10b981;
}

.stat-card.active-users {
  --accent-color: #8b5cf6;
}

.stat-card.today-chats {
  --accent-color: #f59e0b;
}

.stat-icon {
  font-size: 2rem;
  background: var(--accent-color);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.card-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 1.4rem;
}

.chats-count {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 400;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Chats Container */
.chats-container {
  padding: 24px;
}

.chat-session {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chat-session:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 2px;
}

.user-id {
  font-size: 0.8rem;
  color: #64748b;
}

.session-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.message-count,
.session-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #64748b;
}

.meta-icon {
  font-size: 0.8rem;
}

.session-actions {
  display: flex;
  align-items: center;
}

.btn-toggle {
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #64748b;
  transition: all 0.2s ease;
}

.btn-toggle:hover {
  background: #cbd5e1;
  color: #374151;
}

.btn-toggle.expanded {
  background: #3b82f6;
  color: white;
}

/* Message Preview */
.message-preview {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.preview-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.preview-icon {
  font-size: 1rem;
  color: #64748b;
}

.preview-text {
  color: #374151;
  font-size: 0.9rem;
  flex: 1;
}

.preview-info {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* Messages Container */
.messages-container {
  padding: 20px;
  background: white;
  max-height: 400px;
  overflow-y: auto;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  align-items: flex-end;
}

.message.user {
  justify-content: flex-start;
}

.message.bot {
  justify-content: flex-end;
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 70%;
}

.message.bot .message-content {
  flex-direction: row-reverse;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.4;
  position: relative;
}

.message.user .message-bubble {
  background: #3b82f6;
  color: white;
  border-bottom-left-radius: 4px;
}

.message.bot .message-bubble {
  background: #f1f5f9;
  color: #374151;
  border-bottom-right-radius: 4px;
  border: 1px solid #e2e8f0;
}

.message-text {
  word-break: break-word;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 4px;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message.bot .message-time {
  color: #64748b;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
  background: #e2e8f0;
}

.message-avatar.bot-avatar {
  background: #ddd6fe;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 1.3rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* Custom scrollbar */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .session-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .session-meta {
    gap: 12px;
  }
  
  .user-avatar {
    width: 35px;
    height: 35px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .messages-container {
    max-height: 300px;
  }
}
</style>