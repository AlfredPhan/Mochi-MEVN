<!-- frontend/src/views/Checkout.vue -->
<template>
    <section class="checkout-page">
        <div class="checkout-header">
            <h1 class="checkout-title">Checkout Order</h1>
        </div>

        <div class="checkout-content">
            <!-- LEFT: Form -->
            <div class="checkout-form-container">
                <form @submit.prevent="handlePlaceOrder" class="checkout-form">
                    <div class="form-section">
                        <h2 class="section-title">Customer Information</h2>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Full Name *</label>
                                <input type="text" v-model="form.name" class="form-input" placeholder="Enter your full name" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone Number *</label>
                                <input type="tel" v-model="form.phone" class="form-input" placeholder="0901234567" required />
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Email *</label>
                            <div class="input-with-button">
                                <input type="email" v-model="form.email" class="form-input"
                                    placeholder="example@email.com" :disabled="!!user?.value" />
                                <button type="button" @click="sendOtp" :disabled="otpSent" class="otp-button" :class="{ 'sent': otpSent }">
                                    <span v-if="!otpSent">Send OTP</span>
                                    <span v-else>✓ Sent</span>
                                </button>
                            </div>
                        </div>

                        <div v-if="otpSent && !otpVerified" class="form-group otp-group">
                            <label class="form-label">OTP Code *</label>
                            <div class="input-with-button">
                                <input type="text" v-model="form.otp" class="form-input" placeholder="Enter OTP code" maxlength="6" />
                                <button type="button" @click="verifyOtp" class="verify-button">Verify</button>
                            </div>
                            <p class="otp-note">OTP code has been sent to your email</p>
                        </div>

                        <div v-if="otpVerified && firstOrder" class="verified-badge">
                            <i class="check-icon">✓</i> Email verified — You get 10% discount!
                        </div>
                        <div v-else-if="otpVerified && !firstOrder" class="verified-badge">
                            <i class="check-icon">✓</i> Email verified — This email is not eligible for the 10% discount.
                        </div>

                        <div class="form-group">
                            <label class="form-label">Shipping Address *</label>
                            <textarea v-model="form.address" class="form-textarea"
                                placeholder="Enter detailed address (street, ward, district, city)" required rows="3"></textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h2 class="section-title"><i class="icon">💳</i> Payment Method</h2>
                        <div class="payment-methods">
                            <label class="payment-option">
                                <input type="radio" value="COD" v-model="form.paymentMethod" />
                                <div class="payment-card">
                                    <div class="payment-info">
                                        <h4>Cash on Delivery (COD)</h4>
                                        <p>Pay 50% in advance, pay the rest upon delivery</p>
                                    </div>
                                </div>
                            </label>
                            <label class="payment-option">
                                <input type="radio" value="Stripe" v-model="form.paymentMethod" />
                                <div class="payment-card">
                                    <div class="payment-info">
                                        <h4>Stripe</h4>
                                        <p>100% online payment via Stripe</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button type="submit" :disabled="placingOrder || !otpVerified" class="place-order-btn" :class="{ 'loading': placingOrder }">
                        <span v-if="!placingOrder">Place Order Now</span>
                        <span v-else><i class="loading-icon">⏳</i> Processing...</span>
                    </button>
                </form>
            </div>

            <!-- RIGHT: Order Summary -->
            <div class="order-summary">
                <div class="summary-header">
                    <h2 class="summary-title"><i class="icon">📋</i> Your Order</h2>
                </div>
                <div class="summary-content">
                    <div v-if="cartItems.length === 0" class="empty-cart">
                        <i class="icon">🛒</i>
                        <p>Your cart is empty</p>
                    </div>
                    <div v-else class="order-items">
                        <div v-for="item in cartItems" :key="item._id" class="summary-item">
                            <div class="item-info">
                                <h4 class="item-name">{{ item.name }}</h4>
                                <p class="item-quantity">Quantity: {{ item.quantity }}</p>
                            </div>
                            <div class="item-price">{{ formatPrice(item.price * item.quantity) }} $</div>
                        </div>

                        <div class="summary-calculations">
                            <div class="calc-row subtotal">
                                <span>Subtotal:</span>
                                <span>{{ formatPrice(cartTotal) }} $</span>
                            </div>
                            <div v-if="otpVerified && firstOrder" class="calc-row discount">
                                <span>🎉 Discount (10%):</span>
                                <span>-{{ formatPrice(cartTotal * 0.1) }} $</span>
                            </div>
                            <div class="calc-row shipping">
                                <span>Shipping Fee:</span>
                                <span class="free">Free</span>
                            </div>
                            <div class="calc-row total">
                                <span>Total:</span>
                                <span class="total-amount">{{ formatPrice(finalTotal) }} $</span>
                            </div>
                        </div>

                        <div class="payment-note">
                            <div v-if="form.paymentMethod === 'COD'" class="note-cod">
                                <i class="icon">ℹ️</i>
                                <div>
                                    <strong>Cash on Delivery:</strong>
                                    <p>Prepaid: {{ formatPrice(finalTotal * 0.5) }} $</p>
                                    <p>Pay on delivery: {{ formatPrice(finalTotal * 0.5) }} $</p>
                                </div>
                            </div>
                            <div v-else class="note-vnpay">
                                <i class="icon">💳</i>
                                <p><strong>Stripe Payment:</strong> {{ formatPrice(finalTotal) }} $</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <transition name="toast">
            <div v-if="toastMessage" class="toast" :class="toastType">
                <div class="toast-content">
                    <i class="toast-icon">{{ toastIcon }}</i>
                    <span>{{ toastMessage }}</span>
                </div>
            </div>
        </transition>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/stores/cart'

const router = useRouter()
const cart = useCart()
const cartItems = cart.cart
const cartTotal = cart.cartTotal
const firstOrder = ref(false)
const user = inject('user')

const form = ref({
    name: '', phone: '', email: '', otp: '', address: '', paymentMethod: 'COD'
})

const otpSent = ref(false)
const otpVerified = ref(false)
const placingOrder = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// ✅ Sync cart từ DB khi vào trang checkout
onMounted(async () => {
    await cart.syncCartFromDB()

    try {
        if (user?.value) {
            form.value.name = user.value.name || ''
            form.value.phone = user.value.phone || ''
            form.value.email = user.value.email || ''
            form.value.address = user.value.address || ''
        } else {
            const localUser = JSON.parse(localStorage.getItem('mochi_user') || 'null')
            if (localUser) {
                form.value.name = localUser.name || ''
                form.value.phone = localUser.phone || ''
                form.value.email = localUser.email || ''
                form.value.address = localUser.address || ''
            }
        }
    } catch (err) {
        console.error('Error loading user info:', err)
    }
})

watch(() => user?.value, (newUser) => {
    if (newUser) {
        form.value.name = newUser.name || ''
        form.value.phone = newUser.phone || ''
        form.value.email = newUser.email || ''
        form.value.address = newUser.address || ''
    }
}, { immediate: true })

const finalTotal = computed(() => {
    return otpVerified.value && firstOrder.value ? cartTotal.value * 0.9 : cartTotal.value
})

const toastIcon = computed(() => {
    return toastType.value === 'success' ? '✅' : toastType.value === 'error' ? '❌' : 'ℹ️'
})

const sendOtp = async () => {
    if (!form.value.email) { showToast('Please enter your email before sending OTP', 'error'); return; }
    try {
        const res = await fetch('http://https://mochi-mevn.onrender.com/api/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.value.email })
        })
        const data = await res.json()
        if (res.ok) { otpSent.value = true; showToast(data.message, 'success') }
        else showToast(data.message || 'Cannot send OTP', 'error')
    } catch { showToast('Error sending OTP', 'error') }
}

const verifyOtp = async () => {
    try {
        const res = await fetch('http://https://mochi-mevn.onrender.com/api/verify-email/confirm-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.value.email, otp: form.value.otp })
        })
        const data = await res.json()
        if (res.ok) { otpVerified.value = true; firstOrder.value = data.firstOrder; showToast(data.message, 'success') }
        else showToast(data.message || 'Incorrect OTP code', 'error')
    } catch { showToast('Error verifying OTP', 'error') }
}

const handlePlaceOrder = async () => {
    if (!otpVerified.value) { showToast('You need to verify OTP before placing the order!', 'error'); return; }
    if (cartItems.value.length === 0) { showToast('Your cart is empty!', 'error'); return; }

    placingOrder.value = true
    try {
        if (form.value.paymentMethod === 'Stripe') {
            const res = await fetch('http://https://mochi-mevn.onrender.com/api/payment/create-stripe-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartItems.value.map(item => ({
                        productId: item._id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        imageUrl: item.imageUrl
                    })),
                    customerEmail: form.value.email,
                    customerPhone: form.value.phone,
                    customerAddress: form.value.address,
                    customerName: form.value.name,
                    discountApplied: otpVerified.value && firstOrder.value,
                    finalTotal: finalTotal.value
                })
            })
            const data = await res.json()
            if (res.ok) {
                // ✅ Clear cart TRƯỚC khi redirect Stripe
                await cart.clearCart()
                showToast('Redirecting to Stripe payment...', 'success')
                window.location.href = data.url
            } else {
                showToast(data.message || 'Failed to create Stripe session', 'error')
            }
        } else {
            // COD
            const res = await fetch('http://https://mochi-mevn.onrender.com/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.value.name,
                    phone: form.value.phone,
                    email: form.value.email,
                    address: form.value.address,
                    paymentMethod: form.value.paymentMethod,
                    items: cartItems.value.map(item => ({
                        productId: item._id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        imageUrl: item.imageUrl,
                    })),
                    total: cartTotal.value,
                    discountApplied: otpVerified.value
                })
            })
            const data = await res.json()
            if (res.ok) {
                firstOrder.value = data.firstOrder
                showToast(data.message, 'success')
                // ✅ Clear cart sau khi đặt hàng COD thành công
                await cart.clearCart()
                router.push('/checkout-success')
            } else {
                showToast(data.message || 'Order failed', 'error')
            }
        }
    } catch (err) {
        console.error(err)
        showToast('Error placing order', 'error')
    } finally {
        placingOrder.value = false
    }
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

const showToast = (msg, type = 'info') => {
    toastMessage.value = msg
    toastType.value = type
    setTimeout(() => { toastMessage.value = '' }, 4000)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.checkout-page {
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

.checkout-page::before {
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

.checkout-page::after {
  content: 'Checkout';
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

.checkout-header,
.checkout-content {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin-left: auto;
  margin-right: auto;
}

.checkout-header {
  margin-bottom: 38px;
  text-align: left;
}

.checkout-title {
  margin: 0;
  display: block;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4.4rem, 8vw, 8.6rem);
  font-weight: 500;
  line-height: 0.84;
  letter-spacing: -0.085em;
}

.checkout-title::before {
  content: 'Secure checkout';
  display: block;
  margin-bottom: 20px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.checkout-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.42fr);
  gap: 22px;
  align-items: start;
}

.checkout-form-container,
.order-summary {
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 24px 70px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.checkout-form {
  padding: clamp(22px, 3vw, 34px);
}

.form-section {
  margin-bottom: 36px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 250, 242, 0.12);
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.35rem;
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.055em;
}

.section-title .icon {
  display: none;
}

.section-title::after {
  content: 'Fresh order details';
  display: block;
  margin-top: 10px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 22px;
}

.form-group {
  margin-bottom: 22px;
}

.form-label {
  display: block;
  margin-bottom: 9px;
  color: rgba(255, 250, 242, 0.62);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.form-input,
.form-textarea {
  width: 100%;
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 18px;
  background: rgba(255, 250, 242, 0.08);
  color: #fffaf2;
  padding: 15px 16px;
  font: inherit;
  outline: none;
  resize: vertical;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 250, 242, 0.36);
}

.form-input:focus,
.form-textarea:focus {
  border-color: rgba(217, 255, 143, 0.58);
  background: rgba(255, 250, 242, 0.11);
  box-shadow: 0 0 0 4px rgba(217, 255, 143, 0.08);
}

.form-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-with-button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.otp-button,
.verify-button {
  min-height: 50px;
  border-radius: 999px;
  padding: 0 18px;
  border: 1px solid rgba(255, 250, 242, 0.22);
  background: #fffaf2;
  color: #211d18;
  font: inherit;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
}

.otp-button:hover:not(:disabled),
.verify-button:hover {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
}

.otp-button:disabled,
.otp-button.sent {
  background: rgba(66, 106, 79, 0.22);
  color: #dff7e6;
  border-color: rgba(125, 190, 145, 0.28);
  cursor: not-allowed;
}

.otp-note {
  margin: 9px 0 0;
  color: rgba(255, 250, 242, 0.54);
  font-size: 0.88rem;
  line-height: 1.5;
}

.verified-badge {
  margin-bottom: 22px;
  padding: 14px 16px;
  border: 1px solid rgba(125, 190, 145, 0.28);
  border-radius: 18px;
  background: rgba(66, 106, 79, 0.22);
  color: #dff7e6;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.check-icon {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(217, 255, 143, 0.12);
  color: #d9ff8f;
  font-style: normal;
}

.payment-methods {
  display: grid;
  gap: 12px;
}

.payment-option {
  cursor: pointer;
}

.payment-option input[type="radio"] {
  display: none;
}

.payment-card {
  padding: 18px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 22px;
  background: rgba(255, 250, 242, 0.055);
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.payment-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 250, 242, 0.08);
  border-color: rgba(255, 250, 242, 0.24);
}

.payment-option input[type="radio"]:checked + .payment-card {
  border-color: rgba(217, 255, 143, 0.48);
  background: rgba(217, 255, 143, 0.08);
  box-shadow: 0 0 0 4px rgba(217, 255, 143, 0.06);
}

.payment-info h4 {
  margin: 0 0 7px;
  color: #fffaf2;
  font-size: 1rem;
  font-weight: 800;
}

.payment-info p {
  margin: 0;
  color: rgba(255, 250, 242, 0.58);
  line-height: 1.55;
  font-size: 0.9rem;
}

.place-order-btn {
  width: 100%;
  min-height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #fffaf2;
  border-radius: 999px;
  background: #fffaf2;
  color: #211d18;
  padding: 0 24px;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  box-shadow: none;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
}

.place-order-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
  box-shadow: none;
}

.place-order-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-icon {
  display: inline-block;
  animation: spin 1s linear infinite;
}

/* Summary */
.order-summary {
  position: sticky;
  top: 104px;
  height: fit-content;
}

.summary-header {
  padding: 26px 26px 0;
  background: transparent;
  color: #fffaf2;
}

.summary-title {
  margin: 0;
  display: block;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.055em;
}

.summary-title .icon {
  display: none;
}

.summary-title::after {
  content: 'Review your box';
  display: block;
  margin-top: 10px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.summary-content {
  padding: 26px;
}

.empty-cart {
  text-align: center;
  color: rgba(255, 250, 242, 0.68);
  padding: 36px 20px;
}

.empty-cart .icon {
  display: none;
}

.empty-cart p {
  margin: 0;
}

.order-items {
  margin-bottom: 24px;
}

.summary-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 250, 242, 0.1);
}

.summary-item:last-child {
  border-bottom: none;
}

.item-name {
  margin: 0 0 7px;
  color: #fffaf2;
  font-size: 1rem;
  font-weight: 800;
}

.item-quantity {
  margin: 0;
  color: rgba(255, 250, 242, 0.55);
  font-size: 0.86rem;
}

.item-price {
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.45rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.04em;
  white-space: nowrap;
}

.summary-calculations {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 250, 242, 0.16);
}

.calc-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 13px;
  color: rgba(255, 250, 242, 0.66);
  font-size: 0.94rem;
}

.calc-row span:last-child {
  color: #fffaf2;
  font-weight: 750;
}

.calc-row.discount,
.free {
  color: #d9ff8f;
}

.calc-row.total {
  margin-top: 16px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 250, 242, 0.16);
  color: #fffaf2;
  font-weight: 800;
}

.total-amount {
  color: #fffaf2 !important;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  line-height: 1;
  letter-spacing: -0.04em;
}

.payment-note {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid rgba(255, 250, 242, 0.12);
  border-radius: 20px;
  background: rgba(255, 250, 242, 0.055);
}

.note-cod,
.note-vnpay {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.note-cod .icon,
.note-vnpay .icon {
  display: none;
}

.note-cod strong,
.note-vnpay strong {
  display: block;
  margin-bottom: 8px;
  color: #fffaf2;
}

.note-cod p,
.note-vnpay p {
  margin: 5px 0;
  color: rgba(255, 250, 242, 0.62);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Toast */
.toast {
  position: fixed;
  right: 24px;
  top: 104px;
  z-index: 10000;
  min-width: min(340px, calc(100vw - 48px));
  max-width: 500px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-weight: 700;
}

.toast.success .toast-content {
  border-color: rgba(125, 190, 145, 0.28);
}

.toast.error .toast-content {
  border-color: rgba(255, 138, 120, 0.28);
}

.toast.info .toast-content {
  border-color: rgba(217, 255, 143, 0.22);
}

.toast-icon {
  font-style: normal;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 720px) {
  .checkout-page {
    padding: 54px 14px;
  }

  .checkout-title {
    font-size: 4.1rem;
  }

  .checkout-form {
    padding: 22px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .input-with-button {
    grid-template-columns: 1fr;
  }

  .otp-button,
  .verify-button {
    width: 100%;
  }

  .summary-content,
  .summary-header {
    padding-left: 22px;
    padding-right: 22px;
  }

  .toast {
    top: 92px;
    right: 14px;
    left: 14px;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .checkout-title {
    font-size: 3.65rem;
  }

  .section-title,
  .summary-title {
    font-size: 2rem;
  }

  .place-order-btn {
    font-size: 0.95rem;
  }
}
/* Fix Checkout section title bị global .section-title đè */
.checkout-page .section-title {
  margin: 0 0 20px !important;
  padding-bottom: 14px !important;
  border-bottom: 1px solid rgba(255, 250, 242, 0.12) !important;
  color: #fffaf2 !important;
  background: none !important;
  -webkit-text-fill-color: currentColor !important;
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: clamp(1.8rem, 2.4vw, 2.3rem) !important;
  font-weight: 600 !important;
  line-height: 0.95 !important;
  letter-spacing: -0.055em !important;
}

.checkout-page .section-title::after {
  display: block !important;
  margin-top: 10px !important;
  color: #d9ff8f !important;
  font-family: 'JetBrains Mono', ui-monospace, monospace !important;
  font-size: 0.64rem !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.13em !important;
}

.checkout-page .form-section:nth-of-type(1) .section-title::after {
  content: 'Fresh order details' !important;
}

.checkout-page .form-section:nth-of-type(2) .section-title::after {
  content: 'Choose how to pay' !important;
}

.checkout-page .section-title .icon {
  display: none !important;
}

@media (max-width: 720px) {
  .checkout-page .section-title {
    font-size: 2.1rem !important;
  }
}
</style>