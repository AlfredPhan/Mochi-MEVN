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
                        <h3>Mochi Concierge</h3>
<p class="status">Available now</p>
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
  Welcome. Ask about today’s menu, pricing, delivery, or tell me what you’d like to add to cart.
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
                            <!-- <span>🛒</span> -->
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
                     Menu
                </button>
                <button class="quick-btn" @click.stop="sendQuickMessage('What is the price list?')">
                    Price list
                </button>
                <button class="quick-btn" @click.stop="sendQuickMessage('Recommend me a cake')">
                    Recommend me
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
import axios from 'axios'
import { API_URL } from '../config/api'

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
                const res = await axios.post(
  `${API_URL}/chatbot/ai`,
  { message: userText },
  { withCredentials: true }
)

                this.isTyping = false;

                // Thêm message với flag cartUpdated
                const botReply =
  res.data?.reply ||
  res.data?.message ||
  res.data?.answer ||
  res.data?.response ||
  'Sorry, I did not receive a valid response from the chatbot.'

this.messages.push({
  text: botReply,
  sender: 'bot',
  time: this.getCurrentTime(),
  cartUpdated: res.data?.cartUpdated || false,
  redirect: res.data?.redirect || null,
  redirectLabel: res.data?.redirectLabel || null
})

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
  return DOMPurify.sanitize(marked.parse(String(text ?? '')))
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
    --paper: #f7f1e8;
    --paper-soft: #fffaf2;
    --panel: rgba(255, 252, 246, 0.94);
    --ink: #211d18;
    --muted: #756c60;
    --line: rgba(33, 29, 24, 0.14);
    --line-strong: rgba(33, 29, 24, 0.24);
    --accent: #8b4a2f;
    --success: #426a4f;
    --danger: #9f2d20;

    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 1000;
    font-family: 'Instrument Sans', 'Segoe UI', system-ui, sans-serif;
    color: var(--ink);
}

/* Toggle */
.chat-toggle {
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    position: relative;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background: var(--ink);
    color: var(--paper-soft);
    cursor: pointer;
    box-shadow: 0 18px 46px rgba(33, 29, 24, 0.22);
    transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.chat-toggle:hover {
    transform: translateY(-3px);
    background: var(--accent);
    box-shadow: 0 22px 52px rgba(33, 29, 24, 0.26);
}

.chat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: none;
}

.notification-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
    border: 2px solid var(--paper);
    border-radius: 50%;
    background: var(--danger);
    color: #fffaf2;
    font-size: 10px;
    font-weight: 700;
    animation: none;
}

/* Window */
.chat-window {
    width: 390px;
    height: 560px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 2px;
    background:
        radial-gradient(circle at top left, rgba(139, 74, 47, 0.09), transparent 18rem),
        var(--paper-soft);
    box-shadow: 0 32px 90px rgba(33, 29, 24, 0.22);
    animation: chatIn 180ms ease-out;
}

/* Header */
.chat-header {
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--line);
    background: rgba(247, 241, 232, 0.72);
    color: var(--ink);
    backdrop-filter: blur(14px);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar,
.message-avatar {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background: var(--paper-soft);
    color: var(--ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0;
    font-weight: 600;
}

.avatar .mochi-icon {
    font-size: 0;
}

.avatar .mochi-icon::before,
.bot-message .message-avatar::before {
    content: 'M';
    font-size: 0.78rem;
}

.user-avatar::before {
    content: none;
}

.header-text h3 {
    margin: 0;
    color: var(--ink);
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.035em;
}

.status {
    margin: 5px 0 0;
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 1;
}

.status::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--success);
    animation: none;
}

.close-btn {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 1px solid transparent;
    border-radius: 50%;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.close-btn:hover {
    border-color: var(--line);
    background: rgba(33, 29, 24, 0.04);
    color: var(--ink);
}

/* Messages */
.chat-messages {
    flex: 1;
    padding: 18px;
    overflow-y: auto;
    background: transparent;
}

.message {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    margin-bottom: 16px;
    animation: messageIn 140ms ease-out;
}

.user-message {
    justify-content: flex-end;
}

.bot-message {
    justify-content: flex-start;
}

.message-content {
    max-width: 76%;
    margin: 0;
}

.message-bubble {
    padding: 13px 15px;
    border: 1px solid var(--line);
    border-radius: 2px;
    word-wrap: break-word;
    line-height: 1.65;
    font-size: 13.5px;
}

.bot-message .message-bubble {
    background: var(--panel);
    color: var(--ink);
    box-shadow: none;
}

.user-message .message-bubble {
    background: var(--ink);
    color: var(--paper-soft);
    border-color: var(--ink);
}

.user-avatar {
    margin-left: 0;
    background: var(--paper-soft);
    color: var(--ink);
}

.user-avatar svg {
    width: 16px;
    height: 16px;
}

/* Markdown content */
.bot-message .message-bubble :deep(strong) {
    color: var(--accent);
    font-weight: 700;
}

.bot-message .message-bubble :deep(p) {
    margin: 5px 0;
    line-height: 1.7;
}

.bot-message .message-bubble :deep(p:first-child) {
    margin-top: 0;
}

.bot-message .message-bubble :deep(p:last-child) {
    margin-bottom: 0;
}

.bot-message .message-bubble :deep(ul) {
    margin: 8px 0 0;
    padding-left: 16px;
    list-style: disc;
}

.bot-message .message-bubble :deep(li) {
    margin: 4px 0;
}

.bot-message .message-bubble :deep(hr) {
    border: 0;
    border-top: 1px solid var(--line);
    margin: 12px 0;
}

.message-time {
    margin-top: 6px;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    text-align: left;
    opacity: 0.78;
}

.user-message .message-time {
    text-align: right;
}

/* Cart / redirect banners */
.cart-updated-banner,
.redirect-banner {
    margin-top: 8px;
}

.cart-updated-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 1px solid rgba(66, 106, 79, 0.28);
    border-radius: 2px;
    background: rgba(66, 106, 79, 0.08);
    color: var(--success);
    font-size: 12.5px;
    font-weight: 600;
}

.view-cart-btn,
.redirect-btn {
    min-height: 32px;
    margin-left: auto;
    padding: 0 11px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
    white-space: nowrap;
    transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.redirect-btn {
    width: 100%;
    margin-left: 0;
}

.view-cart-btn:hover,
.redirect-btn:hover {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--paper-soft);
    transform: none;
    box-shadow: none;
}

/* Typing */
.typing-indicator {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 13px 15px;
    border: 1px solid var(--line);
    border-radius: 2px;
    background: var(--panel);
    box-shadow: none;
}

.typing-indicator span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: typing 1.2s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.3s;
}

/* Quick actions */
.quick-actions {
    padding: 0 18px 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.quick-btn {
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
    transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.quick-btn:hover {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--paper-soft);
    transform: none;
}

/* Input */
.chat-input {
    padding: 16px;
    border-top: 1px solid var(--line);
    background: rgba(247, 241, 232, 0.72);
}

.input-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: var(--paper-soft);
    transition: border-color 160ms ease, background 160ms ease;
}

.input-container:focus-within {
    border-color: var(--accent);
    background: #fffdf8;
    box-shadow: none;
}

.input-container input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    padding: 11px 13px;
    color: var(--ink);
    font: inherit;
    font-size: 13.5px;
    outline: none;
}

.input-container input::placeholder {
    color: rgba(117, 108, 96, 0.75);
}

.send-btn {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border: 0;
    border-radius: 50%;
    background: var(--ink);
    color: var(--paper-soft);
    cursor: pointer;
    transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
}

.send-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: var(--accent);
    box-shadow: none;
}

.send-btn:disabled {
    opacity: 0.38;
    cursor: not-allowed;
}

/* Scrollbar */
.chat-messages::-webkit-scrollbar {
    width: 10px;
}

.chat-messages::-webkit-scrollbar-track {
    background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background: rgba(33, 29, 24, 0.18);
    background-clip: padding-box;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
    background: rgba(33, 29, 24, 0.28);
    background-clip: padding-box;
}

/* Animation */
@keyframes chatIn {
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes messageIn {
    from {
        opacity: 0;
        transform: translateY(6px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes typing {
    0%, 70%, 100% {
        opacity: 0.35;
        transform: translateY(0);
    }

    35% {
        opacity: 1;
        transform: translateY(-3px);
    }
}

@media (max-width: 480px) {
    .chat-widget {
        right: 14px;
        bottom: 14px;
    }

    .chat-window {
        width: calc(100vw - 28px);
        height: min(560px, calc(100vh - 80px));
    }

    .message-content {
        max-width: 82%;
    }
}
</style>