<!-- src/components/Banner.vue -->
<template>
  <section class="motion-hero">
    <video autoplay muted loop playsinline class="hero-video">
      <source src="/videos/mochi-hero.mp4" type="video/mp4" />
    </video>

    <div class="hero-video-fallback"></div>
    <div class="hero-shade"></div>

    <div class="hero-orbs" aria-hidden="true">
      <span class="orb orb-one"></span>
      <span class="orb orb-two"></span>
      <span class="orb orb-three"></span>
    </div>

    <div class="motion-hero-inner">
      <div class="hero-copy liquid-glass">
        <p class="motion-kicker">Fresh daily · Japanese-inspired treats</p>

        <div class="hero-title-wrap">
          <h1>
            Mochi that
            <br />
            melts into
            <br />
            the moment
          </h1>

          <span class="motion-script hero-script">
            fresh collection
          </span>
        </div>

        <p class="hero-subtitle">
          Handcrafted mochi, delicate fillings and soft seasonal flavors made
          in small batches every day.
        </p>

        <div class="hero-actions">
          <button class="motion-btn primary" @click="shopNow">
            Shop menu
            <span>→</span>
          </button>

          <router-link to="/about" class="motion-btn secondary">
            About the store
          </router-link>
        </div>
      </div>

      <div class="hero-showcase">
        <div class="hero-note note-one liquid-glass">
          <span>01</span>
          <strong>Handmade daily</strong>
        </div>

        <div class="hero-product-card liquid-glass">
          <img
  src="/images/mochi-waffle-cake.png"
  alt="Fresh mochi cake"
/>

          <div class="hero-card-overlay liquid-glass">
            <span>Today’s pick</span>
            <strong>Fresh Cream Mochi</strong>
          </div>
        </div>

        <div class="hero-note note-two liquid-glass">
          <span>02</span>
          <strong>2–4h delivery</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const shopNow = () => {
  document.querySelector('.product-section')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}
</script>

<style scoped>
.motion-hero {
  position: relative;
  isolation: isolate;
  min-height: calc(100vh - 82px);
  overflow: hidden;
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  background: #211d18;
  color: #fffaf2;
}

.hero-video,
.hero-video-fallback,
.hero-shade {
  position: absolute;
  inset: 0;
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 1;
  filter: saturate(1.05) contrast(1.05);
  z-index: 0;
}

.hero-video-fallback {
  z-index: -1;
  background:
    radial-gradient(circle at 70% 20%, rgba(234, 215, 199, 0.28), transparent 28rem),
    linear-gradient(135deg, #211d18, #8b4a2f);
}

.hero-shade {
  z-index: 1;
  pointer-events: none;
  
  background:
    radial-gradient(circle at 76% 18%, rgba(217, 255, 143, 0.04), transparent 25rem),
    radial-gradient(circle at 20% 80%, rgba(139, 74, 47, 0.12), transparent 32rem),
    linear-gradient(90deg, rgba(33, 29, 24, 0.42), rgba(33, 29, 24, 0.06));
}

.hero-orbs {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  width: 34rem;
  height: 34rem;
  border-radius: 999px;
  filter: blur(38px);
  opacity: 0.34;
  mix-blend-mode: screen;
  animation: orbFloat 13s ease-in-out infinite alternate;
}

.orb-one {
  top: -12rem;
  right: 6%;
  background: rgba(255, 250, 242, 0.24);
}

.orb-two {
  left: -12rem;
  bottom: -16rem;
  background: rgba(139, 74, 47, 0.72);
  animation-delay: -4s;
}

.orb-three {
  right: -12rem;
  top: 38%;
  background: rgba(66, 106, 79, 0.34);
  animation-delay: -8s;
}

.motion-hero-inner {
  position: relative;
  z-index: 3;
  width: min(1831px, calc(100% - 40px));
  min-height: calc(100vh - 82px);
  margin: 0 auto;
  padding: clamp(72px, 9vw, 128px) clamp(0px, 2vw, 42px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.72fr);
  gap: clamp(42px, 6vw, 92px);
  align-items: center;
}

.hero-copy {
  max-width: 860px;
  padding: clamp(24px, 4vw, 54px);
  border-radius: 32px;
  animation: panelRise 900ms ease both;
}

.motion-kicker {
  margin: 0 0 24px;
  color: rgba(255, 250, 242, 0.72);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.hero-title-wrap {
  position: relative;
}

.hero-title-wrap h1 {
  margin: 0;
  max-width: 900px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4.4rem, 11vw, 10.5rem);
  font-weight: 500;
  line-height: 0.82;
  letter-spacing: -0.085em;
}

.motion-script {
  color: #d9ff8f;
  font-family: 'Condiment', cursive;
  font-weight: 400;
  line-height: 1;
  mix-blend-mode: exclusion;
}

.hero-script {
  position: static;
  display: inline-block;
  margin-top: 14px;
  margin-left: clamp(40px, 18vw, 260px);
  font-size: clamp(2rem, 3.4vw, 4rem);
  transform: rotate(-4deg);
  animation: scriptDrift 4.8s ease-in-out infinite alternate;
}

.hero-subtitle {
  max-width: 560px;
  margin: 28px 0 0;
  color: rgba(255, 250, 242, 0.72);
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  line-height: 1.7;
}

.hero-actions {
  margin-top: 34px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.motion-btn {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 20px;
  border: 1px solid rgba(255, 250, 242, 0.28);
  border-radius: 999px;
  color: #fffaf2;
  background: transparent;
  font: inherit;
  font-weight: 750;
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.motion-btn.primary {
  background: #fffaf2;
  color: #211d18;
  border-color: #fffaf2;
}

.motion-btn.secondary {
  background: rgba(255, 255, 255, 0.06);
}

.motion-btn:hover {
  transform: translateY(-2px);
  border-color: #fffaf2;
}

.hero-showcase {
  position: relative;
  min-height: 640px;
  animation: panelRise 1000ms ease both 120ms;
}

.hero-product-card {
  position: absolute;
  inset: 0 0 0 auto;
  width: min(100%, 520px);
  padding: 14px;
  border-radius: 32px;
}

.hero-product-card img {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  object-fit: cover;
}

.hero-card-overlay {
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: 28px;
  padding: 18px 20px;
  border-radius: 22px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: end;
}

.hero-card-overlay span,
.hero-note span {
  color: rgba(255, 250, 242, 0.68);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.67rem;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.hero-card-overlay strong {
  color: #fffaf2;
  text-align: right;
}

.hero-note {
  position: absolute;
  z-index: 5;
  display: grid;
  gap: 6px;
  min-width: 180px;
  padding: 16px 18px;
  border-radius: 20px;
}

.hero-note strong {
  color: #fffaf2;
  font-size: 0.96rem;
}

.note-one {
  top: 13%;
  left: -22px;
  animation: cardFloatA 4.8s ease-in-out infinite alternate;
}

.note-two {
  right: -20px;
  bottom: 17%;
  animation: cardFloatB 5.4s ease-in-out infinite alternate;
}

@keyframes orbFloat {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }

  to {
    transform: translate3d(42px, -32px, 0) scale(1.08);
  }
}

@keyframes panelRise {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes scriptDrift {
  from {
    transform: rotate(-4deg) translateY(0);
  }

  to {
    transform: rotate(-2deg) translateY(-12px);
  }
}

@keyframes cardFloatA {
  from {
    transform: translateY(0) rotate(-2deg);
  }

  to {
    transform: translateY(-18px) rotate(1deg);
  }
}

@keyframes cardFloatB {
  from {
    transform: translateY(0) rotate(2deg);
  }

  to {
    transform: translateY(18px) rotate(-1deg);
  }
}

@media (max-width: 1050px) {
  .motion-hero-inner {
    grid-template-columns: 1fr;
  }

  .hero-showcase {
    min-height: 520px;
  }

  .hero-product-card {
    position: relative;
    width: 100%;
    height: 520px;
  }

  .hero-note {
    display: none;
  }
}

@media (max-width: 560px) {
  .motion-hero {
    min-height: auto;
  }

  .motion-hero-inner {
    width: min(100% - 28px, 1831px);
    min-height: auto;
    padding: 58px 0;
  }

  .hero-copy {
    padding: 22px;
    border-radius: 24px;
  }

  .hero-title-wrap h1 {
    font-size: 4.3rem;
  }

  .hero-script {
  margin-left: 0;
  margin-top: 12px;
  font-size: 2.4rem;
}

  .hero-product-card {
    height: 430px;
  }
}
</style>