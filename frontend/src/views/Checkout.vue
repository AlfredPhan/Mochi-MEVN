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
        const res = await fetch('https://mochi-mevn.onrender.com/api/verify-email', {
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
        const res = await fetch('https://mochi-mevn.onrender.com/api/verify-email/confirm-otp', {
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
            const res = await fetch('https://mochi-mevn.onrender.com/api/payment/create-stripe-session', {
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
            const res = await fetch('https://mochi-mevn.onrender.com/api/payment/create-order', {
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
* { box-sizing: border-box; }
.checkout-page { max-width: 1400px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
.checkout-header { text-align: center; margin-bottom: 40px; }
.checkout-title { font-size: 2.5rem; color: #2d3748; display: flex; align-items: center; justify-content: center; gap: 15px; }
.checkout-content { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; align-items: start; }
.checkout-form-container { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; }
.checkout-form { padding: 40px; }
.form-section { margin-bottom: 40px; }
.form-section:last-child { margin-bottom: 0; }
.section-title { font-size: 1.5rem; color: #2d3748; margin-bottom: 25px; display: flex; align-items: center; gap: 12px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.form-group { margin-bottom: 25px; }
.form-label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 0.95rem; }
.form-input, .form-textarea { width: 100%; padding: 15px 18px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 16px; transition: all 0.3s ease; background: #fafafa; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #4f46e5; background: white; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
.input-with-button { display: flex; gap: 12px; }
.input-with-button .form-input { flex: 1; }
.otp-button, .verify-button { padding: 15px 25px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.otp-button { background: #4f46e5; color: white; }
.otp-button:hover:not(:disabled) { background: #4338ca; transform: translateY(-2px); }
.otp-button:disabled { background: #10b981; cursor: not-allowed; }
.verify-button { background: #059669; color: white; }
.verify-button:hover { background: #047857; transform: translateY(-2px); }
.otp-group { animation: slideIn 0.3s ease; }
.otp-note { font-size: 0.85rem; color: #6b7280; font-style: italic; margin-top: 8px; }
.verified-badge { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-weight: 600; animation: slideIn 0.5s ease; }
.check-icon { width: 24px; height: 24px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.payment-methods { display: flex; flex-direction: column; gap: 15px; }
.payment-option { cursor: pointer; }
.payment-option input[type="radio"] { display: none; }
.payment-card { display: flex; align-items: center; gap: 15px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 15px; transition: all 0.3s ease; background: #fafafa; }
.payment-option input[type="radio"]:checked + .payment-card { border-color: #4f46e5; background: linear-gradient(135deg, #ede9fe, #ddd6fe); box-shadow: 0 4px 15px rgba(79,70,229,0.2); }
.payment-info h4 { margin: 0 0 5px 0; color: #2d3748; font-size: 1.1rem; }
.payment-info p { margin: 0; color: #6b7280; font-size: 0.9rem; }
.place-order-btn { width: 100%; padding: 18px 30px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border: none; border-radius: 15px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 25px rgba(79,70,229,0.3); }
.place-order-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(79,70,229,0.4); }
.place-order-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.place-order-btn.loading { animation: pulse 2s infinite; }
.loading-icon { animation: spin 1s linear infinite; display: inline-block; }
.order-summary { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; height: fit-content; position: sticky; top: 20px; }
.summary-header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px 30px; }
.summary-title { margin: 0; display: flex; align-items: center; gap: 12px; font-size: 1.3rem; }
.summary-content { padding: 30px; }
.empty-cart { text-align: center; color: #6b7280; padding: 40px 20px; }
.empty-cart .icon { font-size: 3rem; margin-bottom: 15px; display: block; }
.order-items { margin-bottom: 25px; }
.summary-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 15px 0; border-bottom: 1px solid #f3f4f6; }
.summary-item:last-child { border-bottom: none; }
.item-info { flex: 1; }
.item-name { margin: 0 0 5px 0; color: #2d3748; font-size: 1rem; font-weight: 600; }
.item-quantity { margin: 0; color: #6b7280; font-size: 0.9rem; }
.item-price { font-weight: 700; color: #2d3748; font-size: 1rem; }
.summary-calculations { border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 20px; }
.calc-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.95rem; }
.calc-row.subtotal { color: #6b7280; }
.calc-row.discount { color: #10b981; font-weight: 600; }
.calc-row.shipping { color: #6b7280; }
.calc-row.total { font-size: 1.2rem; font-weight: 700; color: #2d3748; padding-top: 15px; border-top: 2px solid #e5e7eb; margin-top: 15px; }
.free { color: #10b981; font-weight: 600; }
.total-amount { color: #4f46e5; }
.payment-note { background: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 25px; }
.note-cod, .note-vnpay { display: flex; gap: 12px; align-items: flex-start; }
.note-cod .icon, .note-vnpay .icon { font-size: 1.2rem; margin-top: 2px; }
.note-cod strong, .note-vnpay strong { color: #2d3748; display: block; margin-bottom: 8px; }
.note-cod p, .note-vnpay p { margin: 4px 0; color: #6b7280; font-size: 0.9rem; }
.toast { position: fixed; top: 30px; right: 30px; z-index: 1000; min-width: 300px; max-width: 500px; }
.toast-content { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); color: white; font-weight: 600; }
.toast.success .toast-content { background: linear-gradient(135deg, #10b981, #059669); }
.toast.error .toast-content { background: linear-gradient(135deg, #ef4444, #dc2626); }
.toast.info .toast-content { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.toast-icon { font-size: 1.2rem; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100px); }
@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (max-width: 1024px) { .checkout-content { grid-template-columns: 1fr; } .order-summary { position: static; } }
@media (max-width: 768px) { .checkout-page { padding: 15px; } .checkout-title { font-size: 2rem; } .checkout-form { padding: 25px; } .form-grid { grid-template-columns: 1fr; gap: 15px; } .input-with-button { flex-direction: column; } .summary-content { padding: 20px; } .summary-header { padding: 20px; } .toast { top: 20px; right: 15px; left: 15px; min-width: auto; } }
@media (max-width: 480px) { .checkout-title { font-size: 1.5rem; flex-direction: column; gap: 10px; } .checkout-form { padding: 20px; } .section-title { font-size: 1.2rem; } .form-input, .form-textarea { padding: 12px 15px; } .place-order-btn { padding: 15px 25px; font-size: 1rem; } }
</style>