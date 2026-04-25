<template>
  <section class="contact-motion-page">
    <video autoplay muted loop playsinline class="contact-bg-video">
      <source src="/videos/mochi-soft-motion.mp4" type="video/mp4" />
    </video>

    <div class="contact-bg-fallback"></div>
    <div class="contact-shade"></div>
    <div class="contact-texture" aria-hidden="true"></div>

    <div class="contact-container">
      <div class="contact-copy">
        <p class="contact-kicker">Contact · Custom orders</p>

        <h1>
          Tell us what
          <br />
          you want to
          <br />
          make sweeter.
        </h1>

        <span class="contact-script">fresh note</span>

        <p class="contact-description">
          Questions, custom mochi boxes, delivery details or event orders —
          send us a message and our team will get back to you soon.
        </p>

        <div class="contact-info-grid">
          <a href="mailto:support@mochistore.com" class="info-card liquid-glass">
            <span>01</span>
            <strong>Email</strong>
            <small>support@mochistore.com</small>
          </a>

          <a href="tel:+840398621402" class="info-card liquid-glass">
            <span>02</span>
            <strong>Phone</strong>
            <small>+84 039 8621 402</small>
          </a>

          <div class="info-card liquid-glass">
            <span>03</span>
            <strong>Visit</strong>
            <small>20 Cong Hoa, Tan Binh District, Ho Chi Minh City</small>
          </div>
        </div>
      </div>

      <form class="contact-form liquid-glass" @submit.prevent="handleSubmit">
        <div class="form-head">
          <p>Send a message</p>
          <span>Usually replies within a day</span>
        </div>

        <label class="form-field">
          <span>Your name</span>
          <input v-model="name" type="text" placeholder="Jane Doe" required />
        </label>

        <label class="form-field">
          <span>Email address</span>
          <input v-model="email" type="email" placeholder="you@example.com" required />
        </label>

        <label class="form-field">
          <span>Message</span>
          <textarea
            v-model="message"
            placeholder="Tell us about your order, question, or occasion..."
            rows="6"
            required
          ></textarea>
        </label>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span>{{ loading ? 'Sending...' : 'Send message' }}</span>
          <span aria-hidden="true">→</span>
        </button>

        <transition name="fade">
          <div v-if="status === 'success'" class="alert alert-success">
            Your message has been sent. We’ll get back to you soon.
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
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  status.value = null

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value
      })
    })

    const data = await res.json()

    if (data.success) {
      status.value = 'success'
      name.value = ''
      email.value = ''
      message.value = ''
    } else {
      status.value = 'error'
    }
  } catch (err) {
    console.error(err)
    status.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-motion-page {
  position: relative;
  min-height: calc(100vh - 82px);
  overflow: hidden;
  background: #211d18;
  color: #fffaf2;
  padding: clamp(72px, 8vw, 120px) 0;
}

.contact-bg-video,
.contact-bg-fallback,
.contact-shade {
  position: absolute;
  inset: 0;
}

.contact-bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.36;
  filter: saturate(0.9) contrast(1.08);
  z-index: 0;
}

.contact-bg-fallback {
  z-index: -1;
  background:
    radial-gradient(circle at 20% 20%, rgba(139, 74, 47, 0.42), transparent 30rem),
    linear-gradient(135deg, #211d18, #4a2d20);
}

.contact-shade {
  z-index: 1;
  background:
    radial-gradient(circle at 80% 15%, rgba(217, 255, 143, 0.08), transparent 26rem),
    linear-gradient(90deg, rgba(33, 29, 24, 0.92), rgba(33, 29, 24, 0.54));
}

.contact-texture {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 250, 242, 0.35) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255, 250, 242, 0.22) 0 1px, transparent 1px);
  background-size: 18px 18px, 26px 26px;
}

.contact-container {
  position: relative;
  z-index: 3;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(360px, 0.62fr);
  gap: clamp(42px, 8vw, 120px);
  align-items: center;
}

.contact-kicker {
  margin: 0 0 20px;
  color: rgba(255, 250, 242, 0.68);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.contact-copy h1 {
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4.2rem, 8.4vw, 9rem);
  font-weight: 500;
  line-height: 0.84;
  letter-spacing: -0.085em;
}

.contact-script {
  display: inline-block;
  margin-top: 10px;
  margin-left: clamp(28px, 16vw, 220px);
  color: #d9ff8f;
  font-family: 'Condiment', cursive;
  font-size: clamp(2.4rem, 4.8vw, 5.4rem);
  line-height: 1;
  transform: rotate(-4deg);
  mix-blend-mode: exclusion;
  animation: scriptDrift 4.8s ease-in-out infinite alternate;
}

.contact-description {
  max-width: 560px;
  margin: 28px 0 0;
  color: rgba(255, 250, 242, 0.72);
  font-size: 1.04rem;
  line-height: 1.75;
}

.contact-info-grid {
  margin-top: 42px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.liquid-glass {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.055);
  background-blend-mode: luminosity;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.18),
    0 24px 70px rgba(0, 0, 0, 0.16);
}

.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.2px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.48) 0%,
    rgba(255, 255, 255, 0.14) 22%,
    rgba(255, 255, 255, 0.02) 48%,
    rgba(255, 255, 255, 0.16) 78%,
    rgba(255, 255, 255, 0.42) 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.info-card {
  min-height: 128px;
  padding: 16px;
  display: grid;
  align-content: end;
  gap: 7px;
  border-radius: 22px;
  color: inherit;
  text-decoration: none;
  transition: transform 180ms ease, background 180ms ease;
}

.info-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.085);
}

.info-card span {
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
}

.info-card strong {
  font-size: 1rem;
}

.info-card small {
  color: rgba(255, 250, 242, 0.58);
  font-size: 0.78rem;
  line-height: 1.45;
}

.contact-form {
  padding: clamp(22px, 3vw, 34px);
  border-radius: 32px;
  display: grid;
  gap: 18px;
}

.form-head {
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: start;
}

.form-head p {
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.04em;
}

.form-head span {
  max-width: 130px;
  color: rgba(255, 250, 242, 0.52);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  line-height: 1.5;
  text-align: right;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.form-field {
  display: grid;
  gap: 8px;
}

.form-field span {
  color: rgba(255, 250, 242, 0.62);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.form-field input,
.form-field textarea {
  width: 100%;
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 18px;
  background: rgba(255, 250, 242, 0.08);
  color: #fffaf2;
  padding: 15px 16px;
  font: inherit;
  outline: none;
  resize: vertical;
  transition: border-color 160ms ease, background 160ms ease;
}

.form-field input::placeholder,
.form-field textarea::placeholder {
  color: rgba(255, 250, 242, 0.38);
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: rgba(217, 255, 143, 0.58);
  background: rgba(255, 250, 242, 0.11);
}

.submit-btn {
  min-height: 52px;
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #fffaf2;
  border-radius: 999px;
  background: #fffaf2;
  color: #211d18;
  padding: 0 20px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
}

.submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.alert {
  padding: 14px 16px;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.alert-success {
  background: rgba(66, 106, 79, 0.22);
  color: #dff7e6;
  border: 1px solid rgba(125, 190, 145, 0.28);
}

.alert-error {
  background: rgba(159, 45, 32, 0.2);
  color: #ffd9d4;
  border: 1px solid rgba(255, 138, 120, 0.26);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes scriptDrift {
  from {
    transform: rotate(-4deg) translateY(0);
  }

  to {
    transform: rotate(-2deg) translateY(-10px);
  }
}

@media (max-width: 1000px) {
  .contact-container {
    grid-template-columns: 1fr;
  }

  .contact-info-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .contact-form {
    max-width: 720px;
  }
}

@media (max-width: 680px) {
  .contact-motion-page {
    padding: 54px 0;
  }

  .contact-container {
    width: min(100% - 28px, 1180px);
  }

  .contact-copy h1 {
    font-size: 4.1rem;
  }

  .contact-script {
    margin-left: 0;
    font-size: 2.7rem;
  }

  .contact-info-grid {
    grid-template-columns: 1fr;
  }

  .form-head {
    display: grid;
  }

  .form-head span {
    max-width: none;
    text-align: left;
  }
}
</style>