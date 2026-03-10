<template>
  <section class="banner">
    <div class="banner-background">
      <div class="floating-mochi mochi-1">🍡</div>
      <div class="floating-mochi mochi-2">🍥</div>
      <div class="floating-mochi mochi-3">🌸</div>
      <div class="floating-mochi mochi-4">✨</div>
    </div>

    <div class="container">
      <div class="banner-content">
        <div class="banner-text">
          <h2 class="banner-title">
            <span class="title-line">Fresh & Delicious</span>
            <span class="title-highlight">Mochi Every Day</span>
          </h2>
          <p class="banner-subtitle">
            Discover the authentic taste of Japan with our handcrafted mochi collection.
            Made fresh daily with premium ingredients and traditional techniques.
          </p>

          <div class="banner-features">
            <div class="feature">
              <span class="feature-icon">🌟</span>
              <span>Premium Quality</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🚚</span>
              <span>Fresh Daily</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🇯🇵</span>
              <span>Authentic Japanese</span>
            </div>
          </div>

          <div class="banner-actions">
            <button class="cta-primary" @click="shopNow">
              <span>Shop Now</span>
              <svg class="arrow-icon" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
            <router-link to="/about" class="cta-secondary nav-link" active-class="active" @click="resetAuthState">
              Learn More
            </router-link>

          </div>
        </div>

        <div class="banner-image">
          <div class="image-container">
            <img src="https://domesticallyblissful.com/wp-content/uploads/2024/07/how-to-make-Mochi-Waffle-Cake-683x1024.png"
              alt="Delicious Mochi Collection" class="hero-image" />
            <div class="image-overlay"></div>
            <!-- <div class="price-badge">
              <span class="badge-text">Starting from</span>
              <span class="badge-price">5₫</span>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-number">1000+</div>
          <div class="stat-label">Happy Customers</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">50+</div>
          <div class="stat-label">Flavors Available</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">5★</div>
          <div class="stat-label">Average Rating</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">24/7</div>
          <div class="stat-label">Fresh Production</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const shopNow = () => {
  console.log('Navigate to shop')
  // Scroll to products section
  document.querySelector('.product-section')?.scrollIntoView({
    behavior: 'smooth'
  })
}

const learnMore = () => {
  console.log('Learn more about mochi')
}
</script>

<style scoped>
.banner {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
  padding: 80px 0 60px;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-mochi {
  position: absolute;
  font-size: 40px;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.mochi-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.mochi-2 {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.mochi-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.mochi-4 {
  top: 40%;
  right: 30%;
  animation-delay: 1s;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.banner-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  margin-bottom: 60px;
}

.banner-text {
  padding-right: 20px;
}

.banner-title {
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-line {
  background: linear-gradient(135deg, #374151 0%, #6b7280 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  height: 70px;
}

.title-highlight::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.banner-subtitle {
  font-size: 18px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 500px;
}

.banner-features {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 16px;
}

.banner-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.cta-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

.cta-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-3px);
}

.arrow-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.cta-primary:hover .arrow-icon {
  transform: translateX(4px);
}

.banner-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container {
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  transform: rotate(-5deg);
  transition: transform 0.3s ease;
}

.image-container:hover {
  transform: rotate(0deg) scale(1.05);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.price-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.badge-text {
  display: block;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-price {
  display: block;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  padding: 40px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .banner {
    padding: 60px 0 40px;
  }

  .banner-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .banner-text {
    padding-right: 0;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .image-container {
    width: 300px;
    height: 300px;
  }

  .banner-features {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .banner-actions {
    flex-direction: column;
    width: 100%;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
    justify-content: center;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .floating-mochi {
    font-size: 30px;
  }
}
</style>