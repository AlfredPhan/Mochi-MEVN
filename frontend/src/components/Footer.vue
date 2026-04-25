<template>
  <footer class="site-footer">
    <div class="footer-glow" aria-hidden="true"></div>

    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <router-link to="/" class="footer-logo">
            <span class="brand-mark">M</span>
            <span>
              <strong>Mochi Store</strong>
              <small>Premium Japanese Treats</small>
            </span>
          </router-link>

          <p class="footer-description">
            Handcrafted mochi, soft cream fillings and seasonal Japanese-inspired
            desserts prepared fresh every day.
          </p>
        </div>

        <nav class="footer-nav" aria-label="Footer navigation">
          <p class="footer-label">Explore</p>

          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
          <router-link to="/contact">Contact</router-link>
          <router-link to="/products">Products</router-link>
        </nav>

        <div class="footer-contact">
          <p class="footer-label">Visit & Contact</p>

          <a href="mailto:support@mochistore.com" class="contact-row">
            <span>Email</span>
            <strong>support@mochistore.com</strong>
          </a>

          <a href="tel:+840398621402" class="contact-row">
            <span>Phone</span>
            <strong>+84 039 8621 402</strong>
          </a>

          <button
            class="address-card"
            type="button"
            @click="toggleMap"
            :aria-expanded="showMap"
          >
            <span class="address-index">01</span>
            <span class="address-copy">
              20 Cong Hoa, Tan Binh District,
              <br />
              Ho Chi Minh City, Vietnam
            </span>
            <span class="address-arrow" :class="{ rotated: showMap }">⌄</span>
          </button>
        </div>
      </div>

      <Transition name="map-reveal">
        <div v-if="showMap" class="footer-map">
          <div class="map-heading">
            <span>Store location</span>
            <button type="button" @click="toggleMap">Close</button>
          </div>

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8665806971223!2d106.65369837587697!3d10.822158089332622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175292922bb0d8b%3A0xd0b8f9f7a4df5776!2zMjAgQ8O0bmcgSG9hLCBUw6JuIELDrG5oLCBI4buTIENow60gQ2l0eSwgVmnhu4d0IE5hbQ!5e0!3m2!1sen!2s!4v1717413292425!5m2!1sen!2s"
            width="100%"
            height="320"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </Transition>

      <div class="footer-bottom">
        <p>© 2025 Mochi Store. All rights reserved.</p>
        <p class="footer-note">Fresh daily · Small batch · Soft texture</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const showMap = ref(false)

const toggleMap = async () => {
  showMap.value = !showMap.value

  if (!showMap.value) return

  await nextTick()

  const map = document.querySelector('.footer-map')
  map?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}
</script>

<style scoped>
.site-footer {
  position: relative;
  overflow: hidden;
  padding: 86px 0 32px;
  background:
    radial-gradient(circle at 12% 0%, rgba(217, 255, 143, 0.08), transparent 24rem),
    radial-gradient(circle at 88% 20%, rgba(139, 74, 47, 0.22), transparent 28rem),
    #1d1712;
  color: #fffaf2;
  border-top: 1px solid rgba(255, 250, 242, 0.12);
}

.footer-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(255, 250, 242, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 250, 242, 0.08) 1px, transparent 1px);
  background-size: 76px 76px;
  mask-image: linear-gradient(to bottom, black, transparent 72%);
}

.footer-inner {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.footer-top {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(180px, 0.45fr) minmax(320px, 0.8fr);
  gap: clamp(38px, 7vw, 110px);
  align-items: start;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-decoration: none;
}

.brand-mark {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 250, 242, 0.28);
  border-radius: 50%;
  color: #d9ff8f;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.55rem;
  font-weight: 700;
}

.footer-logo strong {
  display: block;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.65rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.045em;
}

.footer-logo small {
  display: block;
  margin-top: 6px;
  color: rgba(255, 250, 242, 0.52);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.footer-description {
  max-width: 440px;
  margin: 28px 0 0;
  color: rgba(255, 250, 242, 0.66);
  font-size: 1rem;
  line-height: 1.75;
}

.footer-label {
  margin: 0 0 18px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.footer-nav {
  display: grid;
  gap: 12px;
}

.footer-nav a {
  width: fit-content;
  color: rgba(255, 250, 242, 0.68);
  text-decoration: none;
  font-size: 0.98rem;
  font-weight: 650;
  transition: color 160ms ease, transform 160ms ease;
}

.footer-nav a:hover {
  color: #fffaf2;
  transform: translateX(4px);
}

.footer-contact {
  display: grid;
  gap: 12px;
}

.contact-row {
  display: grid;
  gap: 4px;
  color: inherit;
  text-decoration: none;
}

.contact-row span {
  color: rgba(255, 250, 242, 0.42);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.contact-row strong {
  color: rgba(255, 250, 242, 0.78);
  font-size: 0.98rem;
  font-weight: 600;
}

.address-card {
  width: 100%;
  margin-top: 8px;
  padding: 16px 18px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.055);
  color: #fffaf2;
  text-align: left;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.address-card:hover {
  border-color: rgba(255, 250, 242, 0.28);
  background: rgba(255, 255, 255, 0.085);
  transform: translateY(-2px);
}

.address-index {
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
}

.address-copy {
  color: rgba(255, 250, 242, 0.68);
  line-height: 1.5;
}

.address-arrow {
  color: #d9ff8f;
  transition: transform 180ms ease;
}

.address-arrow.rotated {
  transform: rotate(180deg);
}

.footer-map {
  margin-top: 42px;
  overflow: hidden;
  border: 1px solid rgba(255, 250, 242, 0.16);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.055);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
}

.map-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 250, 242, 0.12);
}

.map-heading span {
  color: #fffaf2;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.map-heading button {
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 250, 242, 0.76);
  padding: 8px 12px;
  cursor: pointer;
}

.footer-map iframe {
  display: block;
  filter: grayscale(0.15) contrast(0.95);
}

.footer-bottom {
  margin-top: 64px;
  padding-top: 22px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid rgba(255, 250, 242, 0.12);
  color: rgba(255, 250, 242, 0.5);
  font-size: 0.9rem;
}

.footer-bottom p {
  margin: 0;
}

.footer-note {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.map-reveal-enter-active,
.map-reveal-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}

.map-reveal-enter-from,
.map-reveal-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (max-width: 900px) {
  .footer-top {
    grid-template-columns: 1fr 1fr;
  }

  .footer-brand,
  .footer-contact {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .site-footer {
    padding: 64px 0 28px;
  }

  .footer-inner {
    width: min(100% - 28px, 1180px);
  }

  .footer-top {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .footer-bottom {
    flex-direction: column;
  }

  .address-card {
    grid-template-columns: 1fr auto;
  }

  .address-index {
    display: none;
  }
}
</style>