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
      <div class="empty-icon">🛍️</div>
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
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.cart-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cart-count {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-cart h3 {
  font-size: 24px;
  color: #374151;
  margin-bottom: 10px;
}

.empty-cart p {
  color: #6b7280;
  font-size: 16px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.item-image {
  flex-shrink: 0;
}

.cart-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #f3f4f6;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: 10px;
}

.item-price {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.item-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1.5px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: #f8fafc;
  transform: scale(1.05);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-btn.increase {
  color: #059669;
  border-color: #d1fae5;
}

.quantity-btn.decrease {
  color: #dc2626;
  border-color: #fee2e2;
}

.quantity-display {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  min-width: 24px;
  text-align: center;
  padding: 4px 8px;
  background: #f9fafb;
  border-radius: 6px;
}

.item-total {
  font-size: 16px;
  color: #059669;
  font-weight: 700;
}

.remove-btn {
  background: #fee2e2;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.remove-icon {
  width: 16px;
  height: 16px;
  /* stroke: #dc2626; */
}

.cart-summary {
  position: sticky;
  top: 20px;
}

.summary-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #111827;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 16px;
  color: #374151;
}

.total-row {
  border-top: 2px solid #e5e7eb;
  margin-top: 15px;
  padding-top: 20px;
  font-size: 18px;
  font-weight: 700;
}

.total-price {
  color: #059669;
  font-size: 22px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 25px;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
}

.checkout-icon {
  width: 20px;
  height: 20px;
  stroke: white;
}

.checkout-text {
  line-height: 1;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  padding: 14px 24px;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.clear-text {
  display: inline-block;
  line-height: 1;
}

/* Responsive Design - Mobile Optimized */
@media (max-width: 768px) {
  .cart-page {
    margin: 10px;
    padding: 15px;
  }

  .cart-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .cart-header {
    padding: 20px 15px;
    margin-bottom: 20px;
  }

  .cart-title {
    font-size: 24px;
  }

  .cart-count {
    font-size: 12px;
    padding: 6px 12px;
  }

  .cart-items {
    gap: 12px;
  }

  .cart-item {
    padding: 15px;
    gap: 12px;
    border-radius: 12px;
  }

  .cart-img {
    width: 60px;
    height: 60px;
    border-radius: 8px;
  }

  .item-name {
    font-size: 14px;
    line-height: 1.2;
  }

  .item-price {
    font-size: 12px;
  }

  .item-controls {
    margin-top: 6px;
  }

  .quantity-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .quantity-display {
    font-size: 13px;
    padding: 2px 6px;
  }

  .item-total {
    font-size: 14px;
  }

  .remove-btn {
    width: 28px;
    height: 28px;
  }

  .remove-icon {
    width: 14px;
    height: 14px;
  }

  .summary-card {
    padding: 20px;
  }

  .summary-title {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .summary-row {
    font-size: 14px;
    padding: 8px 0;
  }

  .total-row {
    font-size: 16px;
    padding-top: 15px;
  }

  .total-price {
    font-size: 18px;
  }

  .action-buttons {
    margin-top: 20px;
    gap: 10px;
  }

  .checkout-btn {
    padding: 14px 20px;
    font-size: 14px;
  }

  .clear-btn {
    padding: 12px 20px;
    font-size: 13px;
  }

  .empty-cart {
    padding: 60px 20px;
  }

  .empty-cart h3 {
    font-size: 20px;
  }

  .empty-cart p {
    font-size: 14px;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .cart-page {
    margin: 5px;
    padding: 10px;
  }

  .cart-header {
    padding: 15px 10px;
  }

  .cart-item {
    padding: 12px;
    gap: 10px;
  }

  .cart-img {
    width: 50px;
    height: 50px;
  }

  .item-name {
    font-size: 13px;
  }

  .item-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .quantity-controls {
    align-self: stretch;
    justify-content: center;
  }

  .item-total {
    align-self: flex-end;
  }

  .summary-card {
    padding: 15px;
  }
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.2s;
  z-index: 9999;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
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
    transform: translateY(10px);
  }
}

.confirm-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  z-index: 10000;
  width: 300px;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #e5e7eb;
  color: #111827;
}

.confirm-btn {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
}

@media (max-width: 480px) {
  .confirm-dialog {
    width: 280px;
    padding: 20px;
  }

  .toast {
    bottom: 15px;
    right: 15px;
    font-size: 13px;
    padding: 10px 16px;
  }
}
</style>