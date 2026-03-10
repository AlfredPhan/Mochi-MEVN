<template>
    <div class="auth-container">
      <h2>Reset Password</h2>
      <form @submit.prevent="handleResetPassword">
        <input type="password" v-model="password" placeholder="New password" required />
        <input type="password" v-model="confirmPassword" placeholder="Confirm password" required />
        <button type="submit">Reset Password</button>
      </form>
      <p class="link-text"><router-link to="/login">Back to Login</router-link></p>
    </div>
  </template>
  
  <script setup>
import { ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const password = ref('')
const confirmPassword = ref('')
const showToast = inject('showToast')
const route = useRoute()
const router = useRouter()

const handleResetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    return showToast('Passwords do not match', 'error')
  }

  try {
    // console.log("Token từ URL:", route.params.token)

    const res = await fetch(
  `https://mochi-mevn.onrender.com/api/auth/reset-password/${route.params.token}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password.value }),
  }
)


    const data = await res.json()
    if (res.ok) {
      showToast('Password reset successfully!', 'success')
      router.push('/login')
    } else {
      showToast(data.message || 'Failed to reset password', 'error')
    }
  } catch (err) {
    showToast('Error connecting to server', 'error')
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
  }
  
  .link-text a:hover {
    text-decoration: underline;
  }
  </style>
  