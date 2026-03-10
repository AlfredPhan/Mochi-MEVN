<template>
  <section class="page about">
    <div class="container">
      <div class="about-content">
        <!-- Text giới thiệu -->
        <div class="about-text">
          <h1 class="page-title">About Us</h1>
          <p class="page-description">
            Welcome to Mochi Store! We are passionate about bringing the authentic taste of Japan to your doorstep. 
            Our mochi is handcrafted daily using traditional techniques and premium ingredients.
          </p>
          <div class="about-details">
            <p>🍵 Fresh ingredients</p>
            <p>🧑‍🍳 Handmade daily</p>
            <p>🇯🇵 Authentic Japanese recipes</p>
          </div>
        </div>

        <!-- 3D Store Viewer -->
        <div class="about-3d">
          <div class="viewer-header">
            <div class="viewer-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>3D Virtual Store</span>
            </div>
            <div class="viewer-controls">
              <button class="control-btn" title="Reset View">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading 3D Model...</p>
          </div>

          <model-viewer
            id="storeModel"
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
            style="width:100%; height:100%;"
          >
            <!-- AR Button -->
            <button slot="ar-button" class="ar-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
              <span>View in AR</span>
            </button>
          </model-viewer>
          
          <div class="viewer-footer">
            <div class="hint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
            <div class="view-counter">
              <div class="pulse-dot"></div>
              <span>Interactive 3D</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  const viewer = document.querySelector("#storeModel");
  const resetBtn = document.querySelector(".control-btn");
  const loadingOverlay = document.querySelector("#loadingOverlay");

  viewer.addEventListener("load", () => {
    // Ẩn loading overlay
    if (loadingOverlay) {
      loadingOverlay.style.opacity = "0";
      setTimeout(() => {
        loadingOverlay.style.display = "none";
      }, 300);
    }

    // Cinematic intro animation
    let angle = 0;
    let fov = 35;

    const rotateOnce = setInterval(() => {
      angle += 2;
      viewer.cameraOrbit = `${angle}deg 75deg auto`;

      if (angle >= 360) {
        clearInterval(rotateOnce);

        // Smooth zoom in
        const zoomIn = setInterval(() => {
          fov -= 0.7;
          viewer.fieldOfView = `${fov}deg`;
          if (fov <= 18) {
            clearInterval(zoomIn);
            viewer.cameraOrbit = "0deg 75deg auto";
            viewer.fieldOfView = "18deg";
          }
        }, 40);
      }
    }, 25);
  });

  // Reset camera position
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      viewer.cameraOrbit = "0deg 75deg auto";
      viewer.fieldOfView = "35deg";
    });
  }
});
</script>

<style scoped>
.page {
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8fafc, #edf2f7);
  min-height: 70vh;
  color: #374151;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.about-text {
  flex: 1;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-description {
  font-size: 18px;
  line-height: 1.6;
  max-width: 700px;
  margin-bottom: 30px;
}

.about-details p {
  font-size: 16px;
  margin: 6px 0;
}

.about-3d {
  flex: 1;
  max-width: 650px;
  height: 500px;
  border-radius: 24px;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  box-shadow: 
    0 25px 60px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.about-3d::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.15) 0%, transparent 50%);
  animation: gradientShift 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes gradientShift {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.about-3d:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 35px 80px -15px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
}

/* Header Controls */
.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 10;
  position: relative;
}

.viewer-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.viewer-badge svg {
  color: #a78bfa;
}

.viewer-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* Model Viewer */
model-viewer {
  flex: 1;
  position: relative;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  z-index: 20;
  transition: opacity 0.3s ease;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

/* Footer Info */
.viewer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 10;
  position: relative;
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.hint svg {
  color: #a78bfa;
}

.view-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #48bb78;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(72, 187, 120, 0.6);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* AR Button */
.ar-button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #48bb78, #38a169);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(72, 187, 120, 0.4);
  transition: all 0.3s ease;
  z-index: 5;
}

.ar-button:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 12px 28px rgba(72, 187, 120, 0.5);
}

.ar-button svg {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (min-width: 768px) {
  .about-content {
    flex-direction: row;
    align-items: center;
  }
}
</style>