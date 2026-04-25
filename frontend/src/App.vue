<!-- frontend/src/App.vue -->
<template>
  <div id="app">
    <Toast v-if="toast.show" :message="toast.message" :type="toast.type" />
    <Header v-if="!route.path.startsWith('/admin')" />
    <router-view />
    <Footer v-if="!route.path.startsWith('/admin')" />

    <ChatWidget
      v-if="!route.path.startsWith('/admin')"
      @chat-open="chatIsOpen = true"
      @chat-close="chatIsOpen = false"
      @cart-updated="cart.syncCartFromDB"
    />

    <div id="toast-container" class="toast-container"></div>

    <Transition name="scroll-btn">
      <button class="scroll-top-btn" v-if="showScrollTop && !chatIsOpen" @click="scrollToTop"
        :class="{ 'scrolling': isScrolling }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M7 14L12 9L17 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import ChatWidget from './components/ChatWidget.vue'
import { useCart } from '@/stores/cart'  // ✅ Dùng store duy nhất

const router = useRouter()
const route = useRoute()

const chatIsOpen = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })
const showScrollTop = ref(false)
const isScrolling = ref(false)

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const user = ref(JSON.parse(localStorage.getItem('mochi_user')) || null)
const token = ref(localStorage.getItem('token') || null)
provide('user', user)

// ─── CART — provide từ store duy nhất cho cả Cart.vue + Checkout.vue ─────────
const cart = useCart()
provide('cart', cart)  // ✅ Cart.vue inject('cart') sẽ nhận đúng store này

// ─── TOAST ────────────────────────────────────────────────────────────────────
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => (toast.value = { ...toast.value, show: false }), 3000)
}
provide('showToast', showToast)

// ─── AUTH LOGIC ───────────────────────────────────────────────────────────────
const loadUser = async () => {
  const saved = localStorage.getItem('mochi_user')
  if (saved) {
    user.value = JSON.parse(saved)
  } else if (token.value) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` },
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        user.value = { id: data.userId, name: data.name, email: data.email, avatar: data.avatar || '', role: data.role }
        localStorage.setItem('mochi_user', JSON.stringify(user.value))
      } else {
        user.value = null
      }
    } catch (err) {
      user.value = null
    }
  }
}

const logout = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    localStorage.removeItem('mochi_user')
    localStorage.removeItem('token')
    user.value = null
    token.value = null
    await cart.clearCart()
    showToast('Logged out successfully', 'success')
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
provide('logout', logout)

// ─── SCROLL ───────────────────────────────────────────────────────────────────
const handleScroll = () => { showScrollTop.value = window.scrollY > 400 }
const scrollToTop = () => {
  isScrolling.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => (isScrolling.value = false), 800)
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadUser()
  cart.syncCartFromDB() // ✅ Load cart từ DB khi app khởi động
})
</script>

<style scoped>
.scroll-top-btn {
  position: fixed !important;
  bottom: 100px !important;
  right: 32px !important;
  width: 56px !important;
  height: 56px !important;
  display: grid !important;
  place-items: center !important;
  border: 1px solid rgba(217, 255, 143, 0.55) !important;
  border-radius: 50% !important;
  background: #d9ff8f !important;
  color: #211d18 !important;
  cursor: pointer !important;
  box-shadow:
    0 18px 48px rgba(33, 29, 24, 0.22),
    0 0 30px rgba(217, 255, 143, 0.24) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  z-index: 1000 !important;
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease !important;
  outline: none !important;
  user-select: none !important;
}

.scroll-top-btn:hover {
  transform: translateY(-3px) scale(1.03) !important;
  background: #fffaf2 !important;
  color: #211d18 !important;
  border-color: rgba(255, 250, 242, 0.75) !important;
  box-shadow:
    0 22px 56px rgba(33, 29, 24, 0.28),
    0 0 34px rgba(255, 250, 242, 0.22) !important;
}

.scroll-top-btn svg,
.scroll-top-btn svg path {
  color: #211d18 !important;
  stroke: #211d18 !important;
}

.scroll-top-btn.scrolling {
  animation: scrollPulse 0.8s ease-in-out;
}
@keyframes scrollPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
.scroll-btn-enter-active, .scroll-btn-leave-active { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.scroll-btn-enter-from, .scroll-btn-leave-to { opacity: 0; transform: scale(0.8) translateY(20px); }
@media (max-width: 768px) {
  .scroll-top-btn {
    bottom: 90px !important;
    right: 24px !important;
    width: 48px !important;
    height: 48px !important;
  }
}
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  display: flex; flex-direction: column; align-items: flex-end; gap: 12px; pointer-events: none;
}
</style>