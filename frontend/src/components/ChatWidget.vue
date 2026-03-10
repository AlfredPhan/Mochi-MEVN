<!-- frontend/src/components/ChatWidget.vue -->
<template>
    <div class="chat-widget" :class="{ open: isOpen }">
        <!-- Chat Toggle Button -->
        <div class="chat-toggle" @click.stop="toggleChat" v-if="!isOpen">
            <div class="chat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <div class="notification-badge" v-if="hasNewMessage">!</div>
        </div>

        <!-- Chat Window -->
        <div v-if="isOpen" class="chat-window">
            <!-- Chat Header -->
            <div class="chat-header">
                <div class="header-content">
                    <div class="avatar">
                        <div class="mochi-icon">🧁</div>
                    </div>
                    <div class="header-text">
                        <h3>Mochi Cake Store</h3>
                        <p class="status">Active</p>
                    </div>
                </div>
                <button class="close-btn" @click="toggleChat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
            </div>

            <!-- Chat Messages -->
            <div class="chat-messages" ref="messagesContainer">
                <!-- Welcome Message -->
                <div class="message bot-message" v-if="messages.length === 0">
                    <div class="message-avatar">🧁</div>
                    <div class="message-content">
                        <div class="message-bubble">
                            Hello! I'm **Mochi** 🧁, your assistant at Mochi Cake Store! <br>
                            Ask me about our menu, prices, delivery, or just type **"Add [cake] to cart"** to order! 😊
                        </div>
                        <div class="message-time">{{ getCurrentTime() }}</div>
                    </div>
                </div>

                <!-- Chat Messages -->
                <div v-for="(msg, index) in messages" :key="index"
                    :class="['message', msg.sender === 'user' ? 'user-message' : 'bot-message']">
                    <div class="message-avatar" v-if="msg.sender === 'bot'">🧁</div>
                    <div class="message-content">
                        <div class="message-bubble" v-html="renderMarkdown(msg.text)"></div>

                        <!-- Cart Updated Banner -->
                        <div class="cart-updated-banner" v-if="msg.cartUpdated">
                            <span>🛒</span>
                            <span>Cart has been updated!</span>
                            <button class="view-cart-btn" @click="goToCart">View cart →</button>
                        </div>

                        <!-- Redirect Banner (checkout / login) -->
                        <div class="redirect-banner" v-if="msg.redirect">
                            <button class="redirect-btn" @click="goToPage(msg.redirect)">
                                {{ msg.redirectLabel || '→ Go' }}
                            </button>
                        </div>

                        <div class="message-time">{{ msg.time }}</div>
                    </div>
                    <div class="message-avatar user-avatar" v-if="msg.sender === 'user'">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div class="message bot-message" v-if="isTyping">
                    <div class="message-avatar">🧁</div>
                    <div class="message-content">
                        <div class="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions" v-if="messages.length === 0">
                <button class="quick-btn" @click.stop="sendQuickMessage('Show me the menu')">
                    🍰 Menu
                </button>
                <button class="quick-btn" @click.stop="sendQuickMessage('What is the price list?')">
                    💰 Price list
                </button>
                <button class="quick-btn" @click.stop="sendQuickMessage('Recommend me a cake')">
                    🎂 Recommend me
                </button>
            </div>

            <!-- Chat Input -->
            <div class="chat-input">
                <div class="input-container">
                    <input type="text" v-model="userMessage" @keyup.enter="sendMessage" @input="handleTyping"
                        placeholder="e.g. Add 2 Chocolate Cake to cart..." :disabled="isTyping" />
                    <button class="send-btn" @click="sendMessage" :disabled="!userMessage.trim() || isTyping">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import axios from '@/utils/axios';

export default {
    emits: ['chat-open', 'chat-close', 'cart-updated'],
    data() {
        return {
            isOpen: false,
            userMessage: '',
            messages: [],
            isTyping: false,
            hasNewMessage: false
        };
    },
    methods: {
        toggleChat() {
            this.isOpen = !this.isOpen;
            this.$emit(this.isOpen ? 'chat-open' : 'chat-close');
            if (this.isOpen) {
                this.hasNewMessage = false;
                this.$nextTick(() => this.scrollToBottom());
            }
        },

        getCurrentTime() {
            return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        },

        async sendMessage() {
            if (!this.userMessage.trim() || this.isTyping) return;

            const userText = this.userMessage.trim();
            const currentTime = this.getCurrentTime();

            this.messages.push({ text: userText, sender: 'user', time: currentTime });
            this.userMessage = '';
            this.isTyping = true;

            this.$nextTick(() => this.scrollToBottom());

            try {
                const res = await axios.post(`/chatbot/ai`, { message: userText }, { withCredentials: true });

                this.isTyping = false;

                // Thêm message với flag cartUpdated
                this.messages.push({
                    text: res.data.reply,
                    sender: 'bot',
                    time: this.getCurrentTime(),
                    cartUpdated: res.data.cartUpdated || false,
                    redirect: res.data.redirect || null,
                    redirectLabel: res.data.redirectLabel || null
                });

                // Emit event để parent component (App.vue/Navbar) cập nhật cart count
                if (res.data.cartUpdated) {
                    this.$emit('cart-updated', res.data.cartCount);
                }

                if (!this.isOpen) this.hasNewMessage = true;

            } catch (err) {
                console.error(err);
                this.isTyping = false;
                this.messages.push({
                    text: 'Sorry, I am experiencing technical difficulties. Please try again later.',
                    sender: 'bot',
                    time: this.getCurrentTime()
                });
            }

            this.$nextTick(() => this.scrollToBottom());
        },

        sendQuickMessage(message) {
            this.userMessage = message;
            this.sendMessage();
        },

        handleTyping() {},

        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            if (container) container.scrollTop = container.scrollHeight;
        },

        handleOutsideClick(event) {
            if (!this.isOpen) return;
            const chatWidget = this.$el;
            if (!chatWidget.contains(event.target)) {
                this.isOpen = false;
                this.$emit('chat-close');
            }
        },

        renderMarkdown(text) {
            return DOMPurify.sanitize(marked(text));
        },

        goToPage(path) {
            this.$router.push(path);
            this.toggleChat();
        },

        goToCart() {
            // Navigate to cart page — thay đổi path tùy router của bạn
            this.$router.push('/cart');
            this.toggleChat();
        }
    },

    mounted() {
        document.addEventListener('click', this.handleOutsideClick);
    },
    unmounted() {
        document.removeEventListener('click', this.handleOutsideClick);
    }
};
</script>

<style scoped>
.chat-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    z-index: 1000;
}

.chat-toggle {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
    transition: all 0.3s ease;
    position: relative;
}

.chat-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(255, 107, 107, 0.6); }
.chat-icon { color: white; animation: bounce 2s infinite; }

.notification-badge {
    position: absolute;
    top: -5px; right: -5px;
    width: 20px; height: 20px;
    background: #ff3333;
    color: white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: bold;
    animation: pulse 1.5s infinite;
}

.chat-window {
    width: 380px; height: 520px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
}

.chat-header {
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: white; padding: 20px;
    display: flex; align-items: center; justify-content: space-between;
}

.header-content { display: flex; align-items: center; gap: 12px; }

.avatar {
    width: 45px; height: 45px;
    background: lightskyblue;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
}

.mochi-icon { font-size: 20px; }
.header-text h3 { margin: 0; font-size: 16px; font-weight: 600; }

.status {
    margin: 0; font-size: 12px; opacity: 0.9;
    display: flex; align-items: center; gap: 5px;
}
.status::before {
    content: ''; width: 8px; height: 8px;
    background: #4ade80; border-radius: 50%;
    animation: pulse 2s infinite;
}

.close-btn { background: none; border: none; color: white; cursor: pointer; padding: 5px; border-radius: 50%; }
.close-btn:hover { background: rgba(255,255,255,0.1); }

.chat-messages {
    flex: 1; padding: 20px;
    overflow-y: auto;
    background: linear-gradient(to bottom, #fef7ed, #fff8f0);
}

.message { display: flex; margin-bottom: 16px; animation: fadeIn 0.3s ease-out; }
.user-message { justify-content: flex-end; }
.bot-message { justify-content: flex-start; }

.message-avatar {
    width: 35px; height: 35px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; background: lightskyblue; color: white; flex-shrink: 0;
}

.user-avatar { background: linear-gradient(135deg, #6b73ff, #8e8eff); margin-left: 10px; }
.message-content { max-width: 75%; margin: 0 10px; }

.message-bubble {
    padding: 14px 18px; border-radius: 18px;
    word-wrap: break-word; line-height: 1.7; font-size: 14px;
}

.bot-message .message-bubble {
    background: white; color: #2d3748;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.user-message .message-bubble {
    background: linear-gradient(135deg, #6b73ff, #8e8eff);
    color: white; border-bottom-right-radius: 4px;
}

/* Markdown styles */
.bot-message .message-bubble :deep(strong) { color: #ff6b6b; font-weight: 600; }
.bot-message .message-bubble :deep(p) { margin: 4px 0; line-height: 1.8; }
.bot-message .message-bubble :deep(p:first-child) { margin-top: 0; }
.bot-message .message-bubble :deep(p:last-child) { margin-bottom: 0; }
.bot-message .message-bubble :deep(ul) { margin: 0; padding: 0; list-style: none; }
.bot-message .message-bubble :deep(ul li::before) { display: none; }
.bot-message .message-bubble :deep(hr) { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }

.redirect-banner {
    margin-top: 8px;
}

.redirect-btn {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    text-align: center;
}

.redirect-btn:hover { 
    background: linear-gradient(135deg, #4338ca, #6d28d9);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

/* ── Cart Updated Banner ── */
.cart-updated-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
    border: 1px solid #a5d6a7;
    border-radius: 10px;
    padding: 8px 12px;
    margin-top: 8px;
    font-size: 13px;
    color: #2e7d32;
    font-weight: 500;
}

.view-cart-btn {
    margin-left: auto;
    background: #43a047;
    color: white;
    border: none;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
}

.view-cart-btn:hover { background: #388e3c; }

.message-time { font-size: 11px; opacity: 0.6; margin-top: 4px; text-align: center; }

/* Typing indicator */
.typing-indicator {
    display: flex; align-items: center; gap: 4px;
    padding: 12px 16px; background: white;
    border-radius: 18px; border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.typing-indicator span {
    width: 8px; height: 8px; background: #ff6b6b;
    border-radius: 50%; animation: typing 1.4s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

/* Quick Actions */
.quick-actions { padding: 0 20px 10px; display: flex; flex-wrap: wrap; gap: 8px; }
.quick-btn {
    background: white; border: 2px solid #ff6b6b;
    color: #ff6b6b; padding: 8px 12px;
    border-radius: 20px; font-size: 12px;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.quick-btn:hover { background: #ff6b6b; color: white; transform: translateY(-1px); }

/* Chat Input */
.chat-input { padding: 20px; background: white; border-top: 1px solid #f0f0f0; }
.input-container {
    display: flex; align-items: center;
    background: #f8f9fa; border-radius: 25px;
    padding: 4px; transition: all 0.2s;
}
.input-container:focus-within { background: #f0f0f0; box-shadow: 0 0 0 2px rgba(255,107,107,0.2); }
.input-container input {
    flex: 1; border: none; background: none;
    padding: 12px 16px; font-size: 14px; outline: none; color: #333;
}
.input-container input::placeholder { color: #999; }
.send-btn {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    border: none; border-radius: 50%; color: white;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
}
.send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 2px 8px rgba(255,107,107,0.4); }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Scrollbar */
.chat-messages::-webkit-scrollbar { width: 6px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: rgba(255,107,107,0.3); border-radius: 3px; }
.chat-messages::-webkit-scrollbar-thumb:hover { background: rgba(255,107,107,0.5); }

/* Animations */
@keyframes bounce { 0%,20%,50%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } 60% { transform: translateY(-3px); } }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes typing { 0%,60%,100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-10px); opacity: 1; } }

@media (max-width: 480px) {
    .chat-window { width: 320px; height: 470px; }
    .message-content { max-width: 80%; }
}
</style>