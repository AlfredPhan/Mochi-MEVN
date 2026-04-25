<template>
    <div class="auth-container">
        <h2>Create an Account</h2>
        <form @submit.prevent="handleRegister">
            <input type="text" v-model="name" placeholder="Full Name" required />
            <input type="email" v-model="email" placeholder="Email" required />
            <input type="password" v-model="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
        </form>
        <p class="link-text">Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
</template>


<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()
const showToast = inject('showToast') // 👈 inject toast

const handleRegister = async () => {
    try {
        const res = await fetch('https://mochi-mevn.onrender.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.value, email: email.value, password: password.value })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        showToast('Registration successful! Please Login.', 'success') // ✅ toast
        router.push('/login')
    } catch (err) {
        showToast(err.message, 'error') // ❌ lỗi
    }
}
</script>


<style scoped>
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