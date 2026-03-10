<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Logo & Tagline -->
        <div class="footer-brand">
          <h2 class="logo">
            <!-- <span class="logo-icon">🍡</span> -->
            <span class="logo-text">Mochi Store</span>
          </h2>
          <p class="tagline">Handcrafted Japanese delights, fresh every day.</p>
        </div>

        <!-- Navigation -->
        <div class="footer-nav">
          <h3>Quick Links</h3>
          <ul>
            <li><router-link to="/" class="nav-link" active-class="active">Home</router-link></li>
            <li><router-link to="/about" class="nav-link" active-class="active">About</router-link></li>
            <li><router-link to="/contact" class="nav-link" active-class="active">Contact</router-link></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="footer-contact">
          <h3>Contact</h3>
          <p>Email: support@mochistore.com</p>
          <p>Phone: +84 039 8621 402</p>

          <!-- Enhanced địa chỉ có thể click -->
          <div class="address-container">
            <p class="address" @click="toggleMap" title="Click to show/hide map" role="button" tabindex="0">
              <span class="address-icon">📍</span>
              <span class="address-text">20 Cong Hoa Tan Binh District, Ho Chi Minh City, Vietnam</span>
              <span class="map-toggle-icon" :class="{ 'rotated': showMap }">▼</span>
            </p>
          </div>

          <!-- Enhanced Google Map với animation -->
          <Transition name="map-slide">
            <div v-if="showMap" class="map-container">
              <div class="map-header">
                <span class="map-title">📍 Our Location</span>
                <button @click="toggleMap" class="close-map-btn" title="Close map">×</button>
              </div>
              <div class="map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8665806971223!2d106.65369837587697!3d10.822158089332622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175292922bb0d8b%3A0xd0b8f9f7a4df5776!2zMjAgQ8O0bmcgSG9hLCBUw6JuIELDrG5oLCBI4buTIENow60gQ2l0eSwgVmnhu4d0IE5hbQ!5e0!3m2!1sen!2s!4v1717413292425!5m2!1sen!2s"
                  width="100%" height="250" style="border:0; border-radius: 8px;" allowfullscreen="" loading="lazy"
                  decoding="async" referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
              <div class="map-footer">
                <small>Click and drag to explore • Zoom with mouse wheel</small>
              </div>
            </div>
          </Transition>
        </div>

      </div>

      <div class="footer-bottom">
        <p>© 2025 Mochi Store. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
  padding: 60px 0 30px;
  color: #374151;
  font-size: 14px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-brand .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  color: #6b7280;
  font-size: 14px;
  max-width: 250px;
}

.footer-nav h3,
.footer-contact h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #111827;
}

.footer-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-nav li {
  margin-bottom: 8px;
}

.footer-nav a {
  text-decoration: none;
  color: #374151;
  transition: color 0.3s ease;
}

.footer-nav a:hover {
  color: #667eea;
}

.footer-contact p {
  margin: 6px 0;
  color: #4b5563;
}

/* Enhanced Address Styling */
.address-container {
  margin: 8px 0;
}

.address {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(103, 126, 234, 0.05);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0;
  user-select: none;
}

.address:hover {
  background: rgba(103, 126, 234, 0.1);
  border-color: rgba(103, 126, 234, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 126, 234, 0.15);
}

.address-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.address-text {
  flex: 1;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.4;
}

.map-toggle-icon {
  font-size: 12px;
  color: #667eea;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.map-toggle-icon.rotated {
  transform: rotate(180deg);
}

/* Enhanced Map Container */
.map-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(103, 126, 234, 0.2);
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.map-title {
  font-weight: 600;
  font-size: 15px;
}

.close-map-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-map-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.map-wrapper {
  position: relative;
  overflow: hidden;
}

.map-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  z-index: 1;
}

.map-footer {
  padding: 12px 20px;
  background: #f8f9fa;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
}

/* Map Animation */
.map-slide-enter-active,
.map-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.map-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.map-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.footer-bottom {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  text-align: center;
  color: #6b7280;
}

/* Responsive Design */
@media (max-width: 768px) {
  .address {
    padding: 10px 12px;
    font-size: 13px;
  }

  .map-header {
    padding: 12px 16px;
  }

  .map-title {
    font-size: 14px;
  }

  .map-footer {
    padding: 10px 16px;
  }
}
</style>

<script setup>
import { ref } from 'vue'

const showMap = ref(false)

const toggleMap = () => {
  showMap.value = !showMap.value
  if (!showMap.value) return

  setTimeout(() => {
    const el = document.querySelector('.map-container')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300) // delay để map render xong mới scroll
}

</script>