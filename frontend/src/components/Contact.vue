<template>
  <section class="page contact">
    <div class="container">
      <h1 class="page-title">Contact Us</h1>
      <p class="page-description">
        Got a question? Want to place a custom order? Reach out to us — we’d love to hear from you!
      </p>

      <form class="contact-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <input v-model="name" type="text" placeholder="Your Name" required />
        </div>
        <div class="form-group">
          <input v-model="email" type="email" placeholder="Your Email" required />
        </div>
        <div class="form-group">
          <textarea v-model="message" placeholder="Your Message" rows="5" required></textarea>
        </div>
        <button type="submit" class="submit-btn">Send Message</button>

        <transition name="fade">
          <div v-if="status === 'success'" class="alert alert-success">
            Your message has been sent! We'll get back to you soon.
          </div>
        </transition>

        <transition name="fade">
          <div v-if="status === 'error'" class="alert alert-error">
            Something went wrong. Please try again later.
          </div>
        </transition>

      </form>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const message = ref('')
const status = ref(null)

const handleSubmit = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, message: message.value })
    })

    const data = await res.json()
    if (data.success) {
      status.value = 'success'
      name.value = email.value = message.value = ''
    } else {
      status.value = 'error'
    }
  } catch (err) {
    console.error(err)
    status.value = 'error'
  }
}
</script>


<style scoped>
.page.contact {
  padding: 80px 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.page-title {
  font-size: clamp(32px, 5vw, 48px);
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  margin-bottom: 16px;
}

.page-description {
  color: #6c757d;
  font-size: 18px;
  margin-bottom: 40px;
}

.contact-form {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #667eea;
  outline: none;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 14px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.alert {
  padding: 14px 20px;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;
}

.alert-success {
  background: #e6fffa;
  color: #2c7a7b;
  border: 1px solid #b2f5ea;
}

.alert-error {
  background: #ffe6e6;
  color: #c53030;
  border: 1px solid #feb2b2;
}

/* Smooth fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>