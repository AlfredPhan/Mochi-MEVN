<!-- frontend/src/components/Cart.vue -->
<template>
  <section class="cart-page">
    <div class="cart-header">
      <h1 class="cart-title">Your Cart</h1>
      <div v-if="cartItems.length > 0" class="cart-count">
        {{ cartItems.length }} items
      </div>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <!-- <div class="empty-icon">🛍️</div> -->
      <h3>Your Cart is Empty</h3>
      <p>Please add some items to your cart!</p>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div class="cart-item" v-for="item in cartItems" :key="item._id">
          <div class="item-image">
            <img :src="item.imageUrl" :alt="item.name" class="cart-img" />
          </div>

          <div class="item-details">
            <div class="item-header">
              <h3 class="item-name">{{ item.name }}</h3>
              <button class="remove-btn" @click="removeFromCart(item._id)">
                <span class="remove-icon" v-html="deleteIcon"></span>
              </button>
            </div>

            <p class="item-price">{{ formatPrice(item.price) }}$ each</p>

            <div class="item-controls">
              <div class="quantity-controls">
                <button class="quantity-btn decrease" @click="updateQuantity(item._id, item.quantity - 1)"
                  :disabled="item.quantity <= 1">
                  −
                </button>
                <span class="quantity-display">{{ item.quantity }}</span>
                <button class="quantity-btn increase" @click="updateQuantity(item._id, item.quantity + 1)"
                  :disabled="item.quantity >= item.stock">
                  +
                </button>
                <span v-if="item.quantity >= item.stock"
                  style="color:#ef4444; font-size:12px; margin-left:6px;">(max)</span>
              </div>

              <div class="item-total">
                <strong>{{ formatPrice(item.price * item.quantity) }}$</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-card">
          <h3 class="summary-title">Order Summary</h3>
          <div class="summary-row">
            <span>Total items:</span>
            <span>{{ getTotalItems() }} items</span>
          </div>
          <div class="summary-row total-row">
            <span>Total payment:</span>
            <span class="total-price">{{ formatPrice(cartTotal) }}$</span>
          </div>

          <div class="action-buttons">
            <button class="checkout-btn" @click="goToCheckout">
              <svg class="checkout-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 7h16M4 11h16M10 15h2m-9 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="checkout-text">Checkout</span>
            </button>

            <button class="clear-btn" @click="clearCart">
              <svg class="remove-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m4-3h2a1 1 0 011 1v1H8V5a1 1 0 011-1z" />
              </svg>
              <span class="clear-text">Clear Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast">
      {{ toastMessage }}
    </div>

    <!-- Confirm Dialog -->
    <div v-if="showConfirm" class="confirm-dialog">
      <p>Are you sure you want to clear the entire cart?</p>
      <div class="dialog-actions">
        <button class="cancel-btn" @click="showConfirm = false">Cancel</button>
        <button class="confirm-btn" @click="confirmClearCart">Confirm</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cart = inject('cart')

const cartItems = cart.cart
const cartTotal = cart.cartTotal

const removeFromCart = (id) => {
  cart.removeFromCart(id)
  showNotification('Item removed from cart')
}
const showConfirm = ref(false)

const clearCart = () => {
  showConfirm.value = true
}

const confirmClearCart = () => {
  cart.clearCart()
  showNotification('Your cart has been cleared')
  showConfirm.value = false
}

const goToCheckout = () => {
  const user = localStorage.getItem('mochi_user')

  if (!user) {
    showNotification('Please login to continue checkout')
    router.push({
      path: '/login',
      query: { redirect: '/checkout' }
    })
  } else {
    router.push('/checkout')
  }
}


const deleteIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m4-3h2a1 1 0 011 1v1H8V5a1 1 0 011-1z" />
</svg>
`

// Notification logic
const showToast = ref(false)
const toastMessage = ref('')

const showNotification = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => showToast.value = false, 1500)
}

// Thêm function để cập nhật số lượng
const updateQuantity = (itemId, newQuantity) => {
  const item = cartItems.value.find(item => item._id === itemId)
  if (!item) return

  if (newQuantity > item.stock) {
    showNotification('Đã đạt số lượng tối đa còn lại trong kho!')
    return
  }
  if (newQuantity <= 0) {
    removeFromCart(itemId)
  } else {
    // Giả sử cart có method updateQuantity
    if (cart.updateQuantity) {
      cart.updateQuantity(itemId, newQuantity)
    } else {
      // Fallback: remove và add lại với số lượng mới
      const item = cartItems.value.find(item => item._id === itemId)
      if (item) {
        removeFromCart(itemId)
        for (let i = 0; i < newQuantity; i++) {
          cart.addToCart(item)
        }
      }
    }
  }
}

const getTotalItems = () => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)
</script>

<style scoped>
.cart-page {
  position: relative;
  min-height: calc(100vh - 82px);
  max-width: none;
  margin: 0;
  padding: clamp(64px, 7vw, 108px) 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 12%, rgba(217, 255, 143, 0.08), transparent 26rem),
    radial-gradient(circle at 86% 18%, rgba(139, 74, 47, 0.26), transparent 30rem),
    linear-gradient(135deg, #211d18 0%, #3b2419 100%);
  color: #fffaf2;
  font-family: 'Instrument Sans', system-ui, sans-serif;
}

.cart-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 250, 242, 0.34) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255, 250, 242, 0.22) 0 1px, transparent 1px);
  background-size: 18px 18px, 26px 26px;
}

.cart-page::after {
  content: 'Cart';
  position: absolute;
  left: 5vw;
  top: 48px;
  color: rgba(255, 250, 242, 0.045);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(8rem, 20vw, 22rem);
  line-height: 0.8;
  letter-spacing: -0.09em;
  pointer-events: none;
}

.cart-header,
.cart-content,
.empty-cart {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin-left: auto;
  margin-right: auto;
}

/* Header */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 36px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.cart-title {
  margin: 0;
  color: #fffaf2;
  background: none;
  -webkit-text-fill-color: currentColor;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4.4rem, 8vw, 8.6rem);
  font-weight: 500;
  line-height: 0.84;
  letter-spacing: -0.085em;
}

.cart-title::before {
  content: 'Shopping cart';
  display: block;
  margin-bottom: 20px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.cart-count {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 15px;
  border: 1px solid rgba(255, 250, 242, 0.16);
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.08);
  color: rgba(255, 250, 242, 0.76);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

/* Empty state */
.empty-cart {
  min-height: 470px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 54px 24px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 24px 70px rgba(0, 0, 0, 0.18);
}

.empty-icon {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 250, 242, 0.16);
  border-radius: 50%;
  background: rgba(255, 250, 242, 0.08);
  font-size: 2rem;
}

.empty-cart h3 {
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(3.4rem, 7vw, 6rem);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.07em;
}

.empty-cart p {
  max-width: 420px;
  margin: 20px auto 0;
  color: rgba(255, 250, 242, 0.68);
  font-size: 1rem;
  line-height: 1.7;
}

/* Layout */
.cart-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.42fr);
  gap: 22px;
  align-items: start;
}

.cart-items {
  display: grid;
  gap: 14px;
}

/* Cart item */
.cart-item {
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 18px;
  padding: 18px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 24px 70px rgba(0, 0, 0, 0.14);
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.cart-item:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 250, 242, 0.24);
}

.item-image {
  width: 112px;
  height: 112px;
  overflow: hidden;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 22px;
  background: rgba(255, 250, 242, 0.08);
}

.cart-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
  border-radius: 0;
  transition: transform 360ms ease;
}

.cart-item:hover .cart-img {
  transform: scale(1.06);
}

.item-details {
  min-width: 0;
  display: grid;
  gap: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.item-name {
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.6rem, 2.4vw, 2.2rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.045em;
}

.item-price {
  margin: 0;
  color: rgba(255, 250, 242, 0.56);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.remove-btn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 138, 120, 0.28);
  border-radius: 50%;
  background: rgba(159, 45, 32, 0.16);
  color: #ffd9d4;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.remove-btn:hover {
  transform: translateY(-2px) rotate(3deg);
  background: rgba(159, 45, 32, 0.26);
  border-color: rgba(255, 138, 120, 0.42);
}

.remove-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
}

.item-controls {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  margin-top: 4px;
}

.quantity-controls {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid rgba(255, 250, 242, 0.12);
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.055);
}

.quantity-btn {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 250, 242, 0.16);
  border-radius: 50%;
  background: transparent;
  color: #fffaf2;
  font-size: 1.05rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
}

.quantity-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255, 250, 242, 0.1);
  border-color: rgba(255, 250, 242, 0.3);
}

.quantity-btn:disabled {
  opacity: 0.36;
  cursor: not-allowed;
}

.quantity-btn.increase {
  color: #d9ff8f;
}

.quantity-btn.decrease {
  color: #ffd9d4;
}

.quantity-display {
  min-width: 30px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #fffaf2;
  font-weight: 800;
  text-align: center;
}

.quantity-controls span[style] {
  color: #ffd9d4 !important;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem !important;
  text-transform: uppercase;
}

.item-total {
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.9rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.04em;
}

.item-total strong {
  font: inherit;
  color: inherit;
}

/* Summary */
.cart-summary {
  position: sticky;
  top: 104px;
}

.summary-card {
  padding: 26px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 24px 70px rgba(0, 0, 0, 0.18);
}

.summary-title {
  margin: 0 0 24px;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.055em;
}

.summary-title::after {
  content: 'Review before checkout';
  display: block;
  margin-top: 10px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 250, 242, 0.1);
  color: rgba(255, 250, 242, 0.68);
  font-size: 0.95rem;
}

.summary-row span:last-child {
  color: #fffaf2;
  font-weight: 750;
}

.total-row {
  margin-top: 8px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 250, 242, 0.18);
  border-bottom: none;
  font-weight: 700;
}

.total-price {
  color: #fffaf2 !important;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.2rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.04em;
}

.action-buttons {
  display: grid;
  gap: 10px;
  margin-top: 26px;
}

.checkout-btn,
.clear-btn {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 999px;
  padding: 0 18px;
  font: inherit;
  font-weight: 850;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.checkout-btn {
  border: 1px solid #fffaf2;
  background: #fffaf2;
  color: #211d18;
  box-shadow: none;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
  box-shadow: none;
}

.checkout-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.clear-btn {
  border: 1px solid rgba(255, 138, 120, 0.28);
  background: transparent;
  color: #ffd9d4;
  box-shadow: none;
}

.clear-btn:hover {
  transform: translateY(-2px);
  background: rgba(159, 45, 32, 0.22);
  border-color: rgba(255, 138, 120, 0.42);
  box-shadow: none;
}

/* Toast */
.toast {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 10000;
  max-width: min(360px, calc(100vw - 44px));
  padding: 14px 16px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, rgba(217, 255, 143, 0.08), transparent 16rem),
    rgba(33, 29, 24, 0.94);
  color: #fffaf2;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(12px);
  font-size: 0.92rem;
  animation: fadeIn 0.25s ease, fadeOut 0.25s ease 1.25s;
}

/* Confirm dialog */
.confirm-dialog {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 10000;
  width: min(420px, calc(100vw - 36px));
  transform: translate(-50%, -50%);
  padding: 26px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(217, 255, 143, 0.08), transparent 18rem),
    rgba(33, 29, 24, 0.96);
  color: #fffaf2;
  text-align: left;
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(14px);
}

.confirm-dialog p {
  margin: 0;
  color: rgba(255, 250, 242, 0.78);
  font-size: 1rem;
  line-height: 1.6;
}

.confirm-dialog p::before {
  content: 'Clear cart?';
  display: block;
  margin-bottom: 10px;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.2rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.05em;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.cancel-btn,
.confirm-btn {
  min-height: 42px;
  flex: 1;
  border-radius: 999px;
  padding: 0 14px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.cancel-btn {
  border: 1px solid rgba(255, 250, 242, 0.22);
  background: transparent;
  color: #fffaf2;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 250, 242, 0.08);
}

.confirm-btn {
  border: 1px solid rgba(255, 138, 120, 0.34);
  background: rgba(159, 45, 32, 0.22);
  color: #ffd9d4;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  background: rgba(159, 45, 32, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(12px);
  }
}

/* Responsive */
@media (max-width: 920px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 680px) {
  .cart-page {
    padding: 54px 14px;
  }

  .cart-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .cart-title {
    font-size: 4.1rem;
  }

  .cart-item {
    grid-template-columns: 88px 1fr;
    gap: 14px;
    padding: 14px;
    border-radius: 24px;
  }

  .item-image {
    width: 88px;
    height: 88px;
    border-radius: 18px;
  }

  .item-name {
    font-size: 1.45rem;
  }

  .item-controls {
    align-items: flex-start;
    flex-direction: column;
  }

  .item-total {
    align-self: flex-end;
    font-size: 1.55rem;
  }

  .summary-card {
    padding: 22px;
    border-radius: 26px;
  }

  .dialog-actions {
    flex-direction: column;
  }
}

@media (max-width: 460px) {
  .cart-item {
    grid-template-columns: 1fr;
  }

  .item-image {
    width: 100%;
    height: 210px;
  }

  .item-header {
    align-items: center;
  }

  .quantity-controls {
    width: 100%;
    justify-content: center;
  }
}
</style>