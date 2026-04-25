<template>
  <section class="about-motion-page">
    <video autoplay muted loop playsinline class="about-bg-video">
      <source src="/videos/mochi-soft-motion.mp4" type="video/mp4" />
    </video>

    <div class="about-bg-fallback"></div>
    <div class="about-shade"></div>
    <div class="about-texture" aria-hidden="true"></div>

    <div class="about-container">
      <div class="about-copy">
        <p class="about-kicker">About Mochi Store</p>

        <h1>
          Soft texture.
          <br />
          Quiet craft.
          <br />
          Fresh every day.
        </h1>

        <span class="about-script">made with care</span>

        <p class="about-description">
          Mochi Store brings together Japanese-inspired recipes, delicate cream
          fillings and seasonal flavors. Every piece is prepared in small
          batches so the texture stays soft, fresh and balanced.
        </p>

        <div class="about-principles">
          <div class="principle-card liquid-glass">
            <span>01</span>
            <strong>Fresh ingredients</strong>
            <p>Selected daily for clean flavor and soft texture.</p>
          </div>

          <div class="principle-card liquid-glass">
            <span>02</span>
            <strong>Handmade batches</strong>
            <p>Prepared with care instead of mass production.</p>
          </div>

          <div class="principle-card liquid-glass">
            <span>03</span>
            <strong>Japanese-inspired</strong>
            <p>Simple, gentle desserts designed to feel refined.</p>
          </div>
        </div>
      </div>

      <div class="store-viewer liquid-glass">
        <div class="viewer-header">
          <div>
            <span class="viewer-index">Virtual store</span>
            <strong>Explore the space</strong>
          </div>

          <button class="control-btn" type="button" title="Reset View" @click="resetView">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polyline points="23 4 23 10 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <div class="viewer-body">
          <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Loading 3D model</p>
          </div>

          <model-viewer
            ref="viewerRef"
            src="/models/sketchfab_store_in_mall.glb"
            alt="3D Mochi Store"
            camera-controls
            shadow-intensity="1"
            shadow-softness="0.8"
            exposure="1.1"
            environment-image="neutral"
            camera-orbit="0deg 75deg auto"
            field-of-view="35deg"
            min-field-of-view="15deg"
            max-field-of-view="45deg"
            ar
            class="model-viewer"
          >
            <button slot="ar-button" class="ar-button">
              View in AR
              <span>→</span>
            </button>
          </model-viewer>
        </div>

        <div class="viewer-footer">
          <span>Drag to rotate · Scroll to zoom</span>
          <span class="live-dot">Interactive</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const viewerRef = ref(null)
const loading = ref(true)

const resetView = () => {
  const viewer = viewerRef.value
  if (!viewer) return

  viewer.cameraOrbit = '0deg 75deg auto'
  viewer.fieldOfView = '35deg'
}

onMounted(() => {
  const viewer = viewerRef.value
  if (!viewer) return

  viewer.addEventListener('load', () => {
    loading.value = false

    let angle = 0
    let fov = 35

    const rotateOnce = setInterval(() => {
      angle += 2
      viewer.cameraOrbit = `${angle}deg 75deg auto`

      if (angle >= 360) {
        clearInterval(rotateOnce)

        const zoomIn = setInterval(() => {
          fov -= 0.7
          viewer.fieldOfView = `${fov}deg`

          if (fov <= 22) {
            clearInterval(zoomIn)
            viewer.cameraOrbit = '0deg 75deg auto'
            viewer.fieldOfView = '22deg'
          }
        }, 40)
      }
    }, 25)
  })

  viewer.addEventListener('error', () => {
    loading.value = false
  })
})
</script>

<style scoped>
.about-motion-page {
  position: relative;
  min-height: calc(100vh - 82px);
  overflow: hidden;
  padding: clamp(72px, 8vw, 120px) 0;
  background: #211d18;
  color: #fffaf2;
}

.about-bg-video,
.about-bg-fallback,
.about-shade {
  position: absolute;
  inset: 0;
}

.about-bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.34;
  filter: saturate(0.85) contrast(1.08);
  z-index: 0;
}

.about-bg-fallback {
  z-index: -1;
  background:
    radial-gradient(circle at 20% 20%, rgba(139, 74, 47, 0.42), transparent 30rem),
    linear-gradient(135deg, #211d18, #4a2d20);
}

.about-shade {
  z-index: 1;
  background:
    radial-gradient(circle at 82% 12%, rgba(217, 255, 143, 0.08), transparent 26rem),
    linear-gradient(90deg, rgba(33, 29, 24, 0.9), rgba(33, 29, 24, 0.48));
}

.about-texture {
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

.about-container {
  position: relative;
  z-index: 3;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(380px, 0.72fr);
  gap: clamp(42px, 8vw, 120px);
  align-items: center;
}

.about-kicker {
  margin: 0 0 20px;
  color: rgba(255, 250, 242, 0.68);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.about-copy h1 {
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4.2rem, 8.2vw, 8.7rem);
  font-weight: 500;
  line-height: 0.84;
  letter-spacing: -0.085em;
}

.about-script {
  display: inline-block;
  margin-top: 12px;
  margin-left: clamp(28px, 15vw, 220px);
  color: #d9ff8f;
  font-family: 'Condiment', cursive;
  font-size: clamp(2.4rem, 4.6vw, 5.2rem);
  line-height: 1;
  transform: rotate(-4deg);
  mix-blend-mode: exclusion;
  animation: scriptDrift 4.8s ease-in-out infinite alternate;
}

.about-description {
  max-width: 570px;
  margin: 30px 0 0;
  color: rgba(255, 250, 242, 0.72);
  font-size: 1.04rem;
  line-height: 1.75;
}

.about-principles {
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

.principle-card {
  min-height: 148px;
  padding: 16px;
  display: grid;
  align-content: end;
  gap: 7px;
  border-radius: 22px;
  transition: transform 180ms ease, background 180ms ease;
}

.principle-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.085);
}

.principle-card span {
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
}

.principle-card strong {
  color: #fffaf2;
  font-size: 1rem;
}

.principle-card p {
  margin: 0;
  color: rgba(255, 250, 242, 0.58);
  font-size: 0.82rem;
  line-height: 1.45;
}

.store-viewer {
  min-height: 620px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
}

.viewer-header,
.viewer-footer {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 250, 242, 0.12);
}

.viewer-footer {
  border-top: 1px solid rgba(255, 250, 242, 0.12);
  border-bottom: 0;
}

.viewer-header div {
  display: grid;
  gap: 4px;
}

.viewer-index {
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.viewer-header strong {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.7rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.04em;
}

.control-btn {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.06);
  color: #fffaf2;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease;
}

.control-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 250, 242, 0.11);
}

.viewer-body {
  position: relative;
  flex: 1;
  min-height: 500px;
}

.model-viewer {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 16px;
  background: rgba(33, 29, 24, 0.82);
  backdrop-filter: blur(14px);
}

.loading-overlay p {
  margin: 0;
  color: rgba(255, 250, 242, 0.68);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 250, 242, 0.16);
  border-top-color: #d9ff8f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.viewer-footer {
  color: rgba(255, 250, 242, 0.58);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.live-dot {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #d9ff8f;
}

.live-dot::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d9ff8f;
  box-shadow: 0 0 16px rgba(217, 255, 143, 0.65);
}

.ar-button {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border: 1px solid rgba(255, 250, 242, 0.22);
  border-radius: 999px;
  background: #fffaf2;
  color: #211d18;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  z-index: 4;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes scriptDrift {
  from {
    transform: rotate(-4deg) translateY(0);
  }

  to {
    transform: rotate(-2deg) translateY(-10px);
  }
}

@media (max-width: 1020px) {
  .about-container {
    grid-template-columns: 1fr;
  }

  .store-viewer {
    min-height: 560px;
  }

  .about-principles {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .about-motion-page {
    padding: 54px 0;
  }

  .about-container {
    width: min(100% - 28px, 1180px);
  }

  .about-copy h1 {
    font-size: 4.1rem;
  }

  .about-script {
    margin-left: 0;
    font-size: 2.7rem;
  }

  .about-principles {
    grid-template-columns: 1fr;
  }

  .store-viewer {
    min-height: 520px;
  }

  .viewer-body,
  .model-viewer {
    min-height: 420px;
  }

  .viewer-footer {
    display: grid;
  }
}
</style>