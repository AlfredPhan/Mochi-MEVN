<template>
  <section class="result-page success">
    <div class="result-texture" aria-hidden="true"></div>

    <div class="result-card">
      <div class="result-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <p class="result-kicker">Payment completed</p>

      <h1>
        Payment
        <br />
        successful.
      </h1>

      <p class="result-description">
        Thank you for your purchase at <strong>Mochi Store</strong>. Your order
        is confirmed and will be prepared fresh.
      </p>

      <div class="result-actions">
        <router-link to="/" class="primary-link">
          Back to Home
          <span>→</span>
        </router-link>

        <router-link to="/orders" class="secondary-link">
          View Orders
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCart } from '@/stores/cart'

const cart = useCart()

onMounted(() => {
  cart.clearCart()
})
</script>

<style scoped>
.result-page {
  position: relative;
  min-height: calc(100vh - 82px);
  display: grid;
  place-items: center;
  padding: 72px 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 12%, rgba(217, 255, 143, 0.08), transparent 26rem),
    radial-gradient(circle at 84% 22%, rgba(139, 74, 47, 0.28), transparent 30rem),
    linear-gradient(135deg, #211d18 0%, #3b2419 100%);
  color: #fffaf2;
}

.result-texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 250, 242, 0.34) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255, 250, 242, 0.22) 0 1px, transparent 1px);
  background-size: 18px 18px, 26px 26px;
}

.result-card {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
  padding: clamp(28px, 5vw, 56px);
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  text-align: center;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 34px 100px rgba(0, 0, 0, 0.28);
}

.result-icon {
  width: 74px;
  height: 74px;
  display: grid;
  place-items: center;
  margin: 0 auto 26px;
  border: 1px solid rgba(217, 255, 143, 0.38);
  border-radius: 50%;
  background: rgba(66, 106, 79, 0.22);
  color: #d9ff8f;
}

.result-icon svg {
  width: 34px;
  height: 34px;
}

.result-kicker {
  margin: 0 0 18px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

h1 {
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4rem, 8vw, 7.4rem);
  font-weight: 500;
  line-height: 0.86;
  letter-spacing: -0.085em;
}

.result-description {
  max-width: 520px;
  margin: 28px auto 0;
  color: rgba(255, 250, 242, 0.7);
  font-size: 1rem;
  line-height: 1.75;
}

.result-description strong {
  color: #fffaf2;
}

.result-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.primary-link,
.secondary-link {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 22px;
  border-radius: 999px;
  font-weight: 850;
  text-decoration: none;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.primary-link {
  border: 1px solid #fffaf2;
  background: #fffaf2;
  color: #211d18;
}

.primary-link:hover {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
}

.secondary-link {
  border: 1px solid rgba(255, 250, 242, 0.22);
  background: transparent;
  color: #fffaf2;
}

.secondary-link:hover {
  transform: translateY(-2px);
  background: rgba(255, 250, 242, 0.08);
}
</style>