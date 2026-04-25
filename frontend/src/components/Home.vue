<!-- src/components/Home.vue -->
<template>
  <main class="mochi-motion-page">
    <div class="motion-texture" aria-hidden="true"></div>

    <Banner />

    <section class="motion-marquee">
      <div class="motion-marquee-track">
        <span>Handmade daily</span>
        <span>Soft cream filling</span>
        <span>Japanese-inspired</span>
        <span>Small batch texture</span>
        <span>Fresh delivery</span>
        <span>Free shipping over $50</span>

        <span>Handmade daily</span>
        <span>Soft cream filling</span>
        <span>Japanese-inspired</span>
        <span>Small batch texture</span>
        <span>Fresh delivery</span>
        <span>Free shipping over $50</span>
      </div>
    </section>

    <section class="motion-about-section">
      <video autoplay muted loop playsinline class="motion-bg-video">
        <source src="/videos/mochi-soft-motion.mp4" type="video/mp4" />
      </video>

      <div class="motion-section-shade"></div>

      <div class="motion-about-inner">
        <div class="motion-about-heading">
          <p class="motion-kicker">Hello</p>
          <h2>
            Made soft.
            <br />
            Served fresh.
          </h2>
          <span class="motion-script">mochi ritual</span>
        </div>

        <p class="motion-about-copy">
          A quiet dessert experience built around fresh texture, clean flavor,
          and small daily batches. Browse the menu, add your favorites to cart,
          and let us prepare them with care.
        </p>
      </div>

      <p class="ambient-text ambient-left">
        Rice flour · cream · matcha · strawberry · red bean · chocolate
      </p>

      <p class="ambient-text ambient-right">
        Rice flour · cream · matcha · strawberry · red bean · chocolate
      </p>
    </section>

    <ProductList />

    <section class="motion-final-section">
      <video autoplay muted loop playsinline class="motion-bg-video">
        <source src="/videos/mochi-final.mp4" type="video/mp4" />
      </video>

      <div class="motion-final-shade"></div>

      <div class="motion-final-content">
        <span class="motion-script final-script">taste slower</span>

        <h2>
          Choose your box.
          <br />
          Send something soft.
          <br />
          Make today sweeter.
        </h2>

        <button class="motion-final-btn" @click="scrollToProducts">
          Explore the menu
          <span>→</span>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import Banner from './Banner.vue'
import ProductList from './ProductList.vue'

const scrollToProducts = () => {
  document.querySelector('.product-section')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}
</script>