<!-- frontend/src/views/ForgotPassword.vue -->
<template>
    <div class="auth-container">
        <h2>Forgot Password</h2>
        <form @submit.prevent="handleForgotPassword">
            <input type="email" v-model="email" placeholder="Enter your email" required />
            <button type="submit">Send Reset Link</button>
        </form>
        <p class="link-text"><router-link to="/login">Back to Login</router-link></p>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const showToast = inject('showToast')
const router = useRouter()

const handleForgotPassword = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value }),
        })

        const data = await res.json()
        if (res.ok) {
            showToast('Reset link sent! Check your email.', 'success')
            console.log('🔗 Reset link:', data.resetLink) // 👈 để debug khi chưa gửi email thật
            router.push('/login')
        } else {
            showToast(data.message || 'Failed to send reset link.', 'error')
        }
    } catch (err) {
        showToast('Error connecting to server.', 'error')
    }
}
</script>

<style scoped>
/* Tái sử dụng style */
.auth-container {
    max-width: 400px;
    margin: 100px auto;
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

.auth-container h2 {
    margin-bottom: 20px;
    font-size: 24px;
}

.auth-container input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.auth-container button {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.link-text {
    margin-top: 16px;
    text-align: center;
}

.link-text a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: text-decoration 0.2s ease;
}

.link-text a:hover {
    text-decoration: underline;
}
</style>
