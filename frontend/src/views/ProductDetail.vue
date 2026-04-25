<template>
    <div class="product-detail">
        <div v-if="product" class="product-container">
            <!-- Left Column: Images & 3D -->
            <div class="product-media">
                <!-- Main Product Image -->
                <div class="main-image-wrapper">
                    <img :src="product.imageUrl" :alt="product.name" class="product-image" />
                    <div class="image-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>Premium</span>
                    </div>
                </div>

                <!-- 3D Mochi Viewer -->
                <div class="model-3d-container">
                    <div class="model-header">
                        <div class="model-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                            <span>3D View</span>
                        </div>
                        <div class="model-hint">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span>Drag to rotate</span>
                        </div>
                    </div>
                    <model-viewer
                        src="/models/mochi_dessert_3d_scan.glb"
                        alt="3D Mochi Dessert"
                        camera-controls
                        auto-rotate
                        auto-rotate-delay="1000"
                        rotation-per-second="30deg"
                        class="model-viewer"
                    />
                </div>
            </div>

            <!-- Right Column: Product Info -->
            <div class="product-info">
                <div class="product-header">
                    <h1 class="product-title">{{ product.name }}</h1>
                    <p class="product-description">{{ product.description }}</p>
                </div>

                <div class="product-meta">
                    <div class="meta-item flavor-tag">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        <div>
                            <span class="meta-label">Flavor</span>
                            <span class="meta-value">{{ product.flavor }}</span>
                        </div>
                    </div>

                    <div class="meta-item stock-tag" :class="getStockClass(product.stock)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <div>
                            <span class="meta-label">Availability</span>
                            <span class="meta-value">{{ getStockText(product.stock) }}</span>
                        </div>
                    </div>
                </div>

                <div class="price-section">
                    <div class="price-main">
                        <span class="currency">$</span>
                        <span class="amount">{{ formatPrice(product.price) }}</span>
                    </div>
                    <p class="price-note">Free shipping on orders over $50</p>
                </div>

                <div class="action-section">
                    <button 
                        :disabled="product.stock === 0" 
                        @click="addToCart(product)" 
                        class="add-to-cart-btn"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>{{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}</span>
                    </button>
                </div>

                <div class="product-features">
                    <div class="feature-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Handmade daily</span>
                    </div>
                    <div class="feature-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Premium ingredients</span>
                    </div>
                    <div class="feature-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Authentic recipe</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="loading">
            <div class="loading-spinner"></div>
            <span>Loading product...</span>
        </div>
    </div>
    <!-- Enhanced Product Reviews -->
    <div class="review-section">
        <div class="review-header">
            <h2>Customer Reviews</h2>
            <div v-if="reviews.length" class="review-stats">
                <div class="average-rating">
                    <span class="rating-number">{{ averageRating }}</span>
                    <div class="stars">
                        <span v-for="i in 5" :key="i" :class="['star', i <= Math.round(averageRating) ? 'filled' : '']">
                            ★
                        </span>
                    </div>
                    <span class="review-count">({{ reviews.length }} reviews)</span>
                </div>
            </div>
        </div>

        <!-- Reviews List -->
        <div v-if="reviews.length" class="reviews-container">
            <div v-for="r in reviews" :key="r._id" class="review-card">
                <div class="review-header-card">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
  <img 
    v-if="r.userId?.avatar" 
    :src="r.userId.avatar" 
    alt="User Avatar" 
    class="avatar-img"
  />
  <span v-else>
    {{ r.userId?.name?.charAt(0).toUpperCase() }}
  </span>
</div>

                        <div class="reviewer-details">
                            <h4 class="reviewer-name">{{ r.userId?.name }}</h4>
                            <div class="review-rating">
                                <span v-for="i in 5" :key="i" :class="['star', i <= r.rating ? 'filled' : '']">
                                    ★
                                </span>
                                <span class="rating-text">{{ r.rating }}/5</span>
                            </div>
                        </div>
                    </div>
                    <div class="review-date">
                        {{ formatDate(r.createdAt) }}
                    </div>

                </div>
                <p class="review-comment">{{ r.comment }}</p>
            </div>
        </div>

        <div v-else class="no-reviews">
            <div class="no-reviews-icon">📝</div>
            <h3>No reviews yet</h3>
            <p>Be the first to share your thoughts about this product!</p>
        </div>

        <!-- Enhanced Review Form -->
        <div v-if="user && user.value !== null" class="review-form">
            <h3>Write a Review</h3>
            <div class="form-group">
                <label>Your Rating</label>
                <div class="rating-input">
                    <span v-for="n in 5" :key="n" :class="['star-input', n <= newReview.rating ? 'selected' : '']"
                        @click="newReview.rating = n" @mouseover="hoverRating = n" @mouseleave="hoverRating = 0">
                        ★
                    </span>
                    <span class="rating-label">{{ getRatingLabel(newReview.rating) }}</span>
                </div>
            </div>

            <div class="form-group">
                <label for="review-comment">Your Review</label>
                <textarea id="review-comment" v-model="newReview.comment"
                    placeholder="Share your experience with this product..." rows="4" class="review-textarea"
                    :class="{ 'error': commentError }"></textarea>
                <div class="character-count">
                    {{ newReview.comment.length }}/500 characters
                </div>
            </div>

            <button @click="submitReview" class="submit-review-btn" :disabled="isSubmitting">
                <span v-if="isSubmitting">Submitting...</span>
                <span v-else>Submit Review</span>
            </button>
        </div>

        <div v-else class="login-prompt">
            <h3>Want to leave a review?</h3>
            <p>Please <router-link to="/login" class="login-link">login</router-link> to share your experience with
                other customers.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const product = ref(null)
const cart = inject('cart')
const user = inject('user')
const showToast = inject('showToast')

const reviews = ref([])
const newReview = ref({ rating: 5, comment: '' })
const hoverRating = ref(0)
const isSubmitting = ref(false)
const commentError = ref(false)

// Computed properties
const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0
    const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.value.length).toFixed(1)
})

const fetchReviews = async () => {
    const res = await fetch(`http://localhost:5000/api/reviews/${route.params.id}`)
    const data = await res.json()
    // console.log('✅ Reviews:', data);
    reviews.value = data
}

const getRatingLabel = (rating) => {
    const labels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    }
    return labels[rating] || ''
}

const submitReview = async () => {
    commentError.value = false;

    if (!newReview.value.comment.trim()) {
        commentError.value = true;
        showToast?.('Please enter a comment before submitting.', 'error');
        return;
    }

    if (!newReview.value.rating) {
        showToast?.('Please select a rating.', 'error');
        return;
    }

    isSubmitting.value = true;

    try {
        const res = await fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // ✅ Gửi cookie kèm theo
            body: JSON.stringify({
                productId: route.params.id,
                rating: newReview.value.rating,
                comment: newReview.value.comment.trim()
            })
        });

        const text = await res.text();
        if (!res.ok) {
            // console.error('❌ Submit error:', text);
            throw new Error(`Server error: ${res.status}`);
        }

        await fetchReviews();
        newReview.value.comment = '';
        newReview.value.rating = 5;
        showToast?.('Review submitted successfully!');
    } catch (err) {
        showToast?.(`Error submitting review: ${err.message}`, 'error');
    } finally {
        isSubmitting.value = false;
    }
};



const fetchProduct = async () => {
    const res = await fetch(`http://localhost:5000/api/products/${route.params.id}`)
    const data = await res.json()
    product.value = data
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
}

const getStockText = (stock) => {
    if (stock === 0) return 'Out of stock'
    if (stock <= 5) return `${stock} items left`
    return 'In stock'
}

const getStockClass = (stock) => {
    if (stock === 0) return 'out'
    if (stock <= 5) return 'low'
    return 'in'
}

const addToCart = (product) => {
    const currentInCart = cart.cart.value.find(i => i._id === product._id)?.quantity || 0

    if (currentInCart >= product.stock) {
        showToast?.(`⚠️ Only ${product.stock} "${product.name}" left in stock`, 'error')
        return
    }

    cart.addToCart(product)

    // ✅ Dùng toast chung
    showToast?.(`${product.name} has been added to your cart`, 'success')
}


const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}



onMounted(() => {
    fetchProduct()
    fetchReviews()
})
</script>

<style scoped>
.product-detail,
.review-section {
  position: relative;
  background:
    radial-gradient(circle at 16% 12%, rgba(217, 255, 143, 0.08), transparent 26rem),
    radial-gradient(circle at 86% 18%, rgba(139, 74, 47, 0.26), transparent 30rem),
    linear-gradient(135deg, #211d18 0%, #3b2419 100%);
  color: #fffaf2;
  font-family: 'Instrument Sans', system-ui, sans-serif;
}

.product-detail {
  min-height: calc(100vh - 82px);
  padding: clamp(64px, 7vw, 108px) 20px 48px;
  overflow: hidden;
}

.product-detail::before,
.review-section::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 250, 242, 0.34) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255, 250, 242, 0.22) 0 1px, transparent 1px);
  background-size: 18px 18px, 26px 26px;
}

.product-detail::after {
  content: 'Product';
  position: absolute;
  left: 5vw;
  top: 48px;
  color: rgba(255, 250, 242, 0.045);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(8rem, 20vw, 22rem);
  line-height: 0.8;
  letter-spacing: -0.09em;
  pointer-events: none;
}

.product-container,
.loading {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.product-container {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(360px, 0.72fr);
  gap: clamp(28px, 5vw, 68px);
  align-items: start;
  padding: clamp(18px, 2.5vw, 28px);
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 34px 100px rgba(0, 0, 0, 0.2);
}

/* Media */
.product-media {
  display: grid;
  gap: 18px;
}

.main-image-wrapper,
.model-3d-container {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 28px;
  background: rgba(255, 250, 242, 0.055);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.14);
}

.main-image-wrapper {
  padding: 14px;
  aspect-ratio: 1 / 1;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 22px;
  transition: transform 520ms ease;
}

.main-image-wrapper:hover .product-image {
  transform: scale(1.045);
}

.image-badge {
  position: absolute;
  top: 26px;
  right: 26px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid rgba(217, 255, 143, 0.38);
  border-radius: 999px;
  background: rgba(33, 29, 24, 0.58);
  color: #d9ff8f;
  backdrop-filter: blur(12px);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* 3D */
.model-3d-container {
  background:
    radial-gradient(circle at top right, rgba(217, 255, 143, 0.08), transparent 18rem),
    rgba(255, 250, 242, 0.055);
}

.model-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 250, 242, 0.12);
}

.model-badge,
.model-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.model-badge {
  color: #d9ff8f;
}

.model-hint {
  color: rgba(255, 250, 242, 0.52);
}

.model-viewer {
  width: 100%;
  height: 360px;
  background: transparent;
}

/* Info */
.product-info {
  display: grid;
  gap: 24px;
  align-content: start;
  padding: clamp(8px, 1vw, 14px);
}

.product-header {
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(255, 250, 242, 0.12);
}

.product-title {
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4rem, 6.8vw, 7.2rem);
  font-weight: 500;
  line-height: 0.84;
  letter-spacing: -0.085em;
}

.product-title::before {
  content: 'Fresh selection';
  display: block;
  margin-bottom: 18px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.product-description {
  max-width: 560px;
  margin: 24px 0 0;
  color: rgba(255, 250, 242, 0.7);
  font-size: 1rem;
  line-height: 1.75;
}

/* Meta */
.product-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-height: 104px;
  padding: 16px;
  border: 1px solid rgba(255, 250, 242, 0.12);
  border-radius: 22px;
  background: rgba(255, 250, 242, 0.055);
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.meta-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 250, 242, 0.08);
  border-color: rgba(255, 250, 242, 0.22);
}

.meta-item svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #d9ff8f;
}

.meta-item > div {
  display: grid;
  gap: 7px;
}

.meta-label {
  color: rgba(255, 250, 242, 0.48);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.meta-value {
  color: #fffaf2;
  font-size: 0.98rem;
  font-weight: 800;
}

.stock-tag.in {
  border-color: rgba(125, 190, 145, 0.24);
  background: rgba(66, 106, 79, 0.16);
}

.stock-tag.low {
  border-color: rgba(240, 200, 121, 0.26);
  background: rgba(154, 106, 33, 0.18);
}

.stock-tag.out {
  border-color: rgba(255, 138, 120, 0.26);
  background: rgba(159, 45, 32, 0.18);
}

/* Price */
.price-section {
  padding: 20px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 26px;
  background: rgba(255, 250, 242, 0.055);
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.currency {
  color: #d9ff8f;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.2rem;
  font-weight: 600;
}

.amount {
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4rem, 6vw, 6.3rem);
  font-weight: 600;
  line-height: 0.85;
  letter-spacing: -0.07em;
}

.price-note {
  margin: 14px 0 0;
  color: rgba(255, 250, 242, 0.56);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

/* Actions */
.action-section {
  display: flex;
}

.add-to-cart-btn {
  min-height: 54px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #fffaf2;
  border-radius: 999px;
  background: #fffaf2;
  color: #211d18;
  padding: 0 24px;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
  box-shadow: none;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
}

.add-to-cart-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
  box-shadow: none;
}

.add-to-cart-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: rgba(255, 250, 242, 0.22);
  color: rgba(255, 250, 242, 0.7);
}

/* Features */
.product-features {
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(255, 250, 242, 0.12);
  border-radius: 22px;
  background: rgba(255, 250, 242, 0.045);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 250, 242, 0.7);
  font-size: 0.92rem;
  font-weight: 650;
}

.feature-item svg {
  color: #d9ff8f;
  flex-shrink: 0;
}

/* Loading */
.loading {
  min-height: 460px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 16px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  color: rgba(255, 250, 242, 0.68);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 250, 242, 0.16);
  border-top-color: #d9ff8f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Reviews */
.review-section {
  position: relative;
  padding: 72px 20px 96px;
  border-top: 1px solid rgba(255, 250, 242, 0.12);
}

.review-section > * {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin-left: auto;
  margin-right: auto;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 28px;
}

.review-header h2 {
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(3.6rem, 6vw, 6.8rem);
  font-weight: 500;
  line-height: 0.86;
  letter-spacing: -0.08em;
}

.review-header h2::before {
  content: 'Customer notes';
  display: block;
  margin-bottom: 18px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.average-rating {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.055);
  color: #fffaf2;
}

.rating-number {
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: rgba(255, 250, 242, 0.22);
  font-size: 1rem;
}

.star.filled,
.review-rating .star.filled,
.star-input.selected,
.star-input:hover {
  color: #d9ff8f;
}

.review-count,
.rating-text {
  color: rgba(255, 250, 242, 0.54);
  font-size: 0.8rem;
}

.reviews-container {
  display: grid;
  gap: 14px;
  margin-bottom: 32px;
}

.review-card,
.review-form,
.no-reviews,
.login-prompt {
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 24px 70px rgba(0, 0, 0, 0.14);
}

.review-card {
  padding: 18px;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.review-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 250, 242, 0.24);
}

.review-header-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 50%;
  background: rgba(217, 255, 143, 0.12);
  color: #d9ff8f;
  font-weight: 800;
  text-transform: uppercase;
}

.reviewer-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-name {
  margin: 0;
  color: #fffaf2;
  font-size: 1rem;
  font-weight: 800;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
}

.review-rating .star {
  font-size: 0.88rem;
}

.review-date {
  color: rgba(255, 250, 242, 0.44);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.review-comment {
  margin: 0;
  color: rgba(255, 250, 242, 0.68);
  font-size: 0.95rem;
  line-height: 1.7;
}

.no-reviews,
.login-prompt {
  padding: 42px 24px;
  margin-bottom: 28px;
  text-align: center;
}

.no-reviews-icon {
  display: none;
}

.no-reviews h3,
.login-prompt h3,
.review-form h3 {
  margin: 0 0 10px;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.4rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.055em;
}

.no-reviews p,
.login-prompt p {
  margin: 0;
  color: rgba(255, 250, 242, 0.62);
  line-height: 1.6;
}

.review-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  color: rgba(255, 250, 242, 0.62);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.star-input {
  color: rgba(255, 250, 242, 0.25);
  font-size: 2rem;
  cursor: pointer;
  transition: transform 160ms ease, color 160ms ease;
}

.star-input:hover,
.star-input.selected {
  transform: scale(1.08);
}

.rating-label {
  color: #d9ff8f;
  font-weight: 800;
}

.review-textarea {
  width: 100%;
  padding: 15px 16px;
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 18px;
  background: rgba(255, 250, 242, 0.08);
  color: #fffaf2;
  font: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.review-textarea::placeholder {
  color: rgba(255, 250, 242, 0.36);
}

.review-textarea:focus {
  border-color: rgba(217, 255, 143, 0.58);
  background: rgba(255, 250, 242, 0.11);
  box-shadow: 0 0 0 4px rgba(217, 255, 143, 0.08);
}

.review-textarea.error {
  border-color: rgba(255, 138, 120, 0.55);
}

.character-count {
  margin-top: 6px;
  color: rgba(255, 250, 242, 0.44);
  font-size: 0.78rem;
  text-align: right;
}

.submit-review-btn {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fffaf2;
  border-radius: 999px;
  background: #fffaf2;
  color: #211d18;
  padding: 0 22px;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
}

.submit-review-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
}

.submit-review-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-link {
  color: #d9ff8f;
  font-weight: 800;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 980px) {
  .product-container {
    grid-template-columns: 1fr;
  }

  .product-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .review-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .product-detail {
    padding: 54px 14px 36px;
  }

  .review-section {
    padding: 58px 14px 76px;
  }

  .product-container {
    padding: 14px;
    border-radius: 26px;
  }

  .main-image-wrapper,
  .model-3d-container {
    border-radius: 22px;
  }

  .product-title {
    font-size: 4rem;
  }

  .product-meta {
    grid-template-columns: 1fr;
  }

  .amount {
    font-size: 4.2rem;
  }

  .model-header,
  .review-header-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .model-viewer {
    height: 300px;
  }

  .average-rating {
    flex-wrap: wrap;
    border-radius: 22px;
    padding: 12px 14px;
  }
}

@media (max-width: 420px) {
  .product-title {
    font-size: 3.45rem;
  }

  .product-image {
    border-radius: 18px;
  }

  .main-image-wrapper {
    padding: 10px;
  }

  .review-header h2 {
    font-size: 3.4rem;
  }
}
</style>