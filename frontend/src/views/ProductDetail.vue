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
.product-detail {
    padding: 20px;
    min-height: 85vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.product-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

/* Left Column - Media */
.product-media {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.main-image-wrapper {
    position: relative;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 20px;
    overflow: hidden;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.product-image {
    width: 100%;
    height: auto;
    border-radius: 16px;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.main-image-wrapper:hover .product-image {
    transform: scale(1.05);
}

.image-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #2d3748;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

/* 3D Model Container */
.model-3d-container {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.model-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.model-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a78bfa;
    font-size: 13px;
    font-weight: 600;
}

.model-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
}

.model-viewer {
    width: 100%;
    height: 350px;
    background: transparent;
}

/* Right Column - Info */
.product-info {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.product-header {
    border-bottom: 2px solid #f1f3f5;
    padding-bottom: 20px;
}

.product-title {
    font-size: 32px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 12px 0;
    line-height: 1.2;
    letter-spacing: -0.5px;
}

.product-description {
    font-size: 16px;
    color: #6c757d;
    line-height: 1.6;
    margin: 0;
}

/* Meta Info */
.product-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    background: #f8f9fa;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.meta-item:hover {
    border-color: #667eea;
    transform: translateY(-2px);
}

.meta-item svg {
    flex-shrink: 0;
    color: #667eea;
}

.meta-item > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.meta-label {
    font-size: 11px;
    color: #868e96;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.meta-value {
    font-size: 15px;
    color: #1a1a2e;
    font-weight: 700;
}

.stock-tag.low {
    background: #fff3cd;
    border-color: #ffc107;
}

.stock-tag.low svg {
    color: #ff9800;
}

.stock-tag.out {
    background: #f8d7da;
    border-color: #dc3545;
}

.stock-tag.out svg {
    color: #dc3545;
}

.stock-tag.in {
    background: #d4edda;
    border-color: #28a745;
}

.stock-tag.in svg {
    color: #28a745;
}

/* Price Section */
.price-section {
    background: linear-gradient(135deg, #667eea15, #764ba215);
    padding: 24px;
    border-radius: 16px;
    border: 2px solid #667eea30;
}

.price-main {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 8px;
}

.currency {
    font-size: 24px;
    color: #667eea;
    font-weight: 700;
}

.amount {
    font-size: 42px;
    font-weight: 800;
    color: #1a1a2e;
    letter-spacing: -1px;
}

.price-note {
    font-size: 13px;
    color: #667eea;
    margin: 0;
    font-weight: 500;
}

/* Action Buttons */
.action-section {
    display: flex;
    gap: 12px;
}

.add-to-cart-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 18px 32px;
    border: none;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.add-to-cart-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.add-to-cart-btn:active:not(:disabled) {
    transform: translateY(-1px);
}

.add-to-cart-btn:disabled {
    background: linear-gradient(135deg, #adb5bd, #868e96);
    cursor: not-allowed;
    box-shadow: none;
}

.wishlist-btn {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.wishlist-btn:hover {
    border-color: #ff6b6b;
    background: #fff5f5;
    transform: scale(1.05);
}

.wishlist-btn:hover svg {
    stroke: #ff6b6b;
    fill: #ff6b6b;
}

.wishlist-btn svg {
    transition: all 0.3s ease;
}

/* Product Features */
.product-features {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    border-left: 4px solid #667eea;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #495057;
    font-weight: 500;
}

.feature-item svg {
    color: #28a745;
    flex-shrink: 0;
}

/* Loading */
.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 400px;
    font-size: 16px;
    color: #6c757d;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f1f3f5;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Tablet & Desktop */
@media (min-width: 768px) {
    .product-container {
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        padding: 48px;
    }

    .model-viewer {
        height: 400px;
    }

    .product-title {
        font-size: 40px;
    }

    .amount {
        font-size: 52px;
    }
}

@media (min-width: 1024px) {
    .product-container {
        padding: 56px;
    }
}

/* Mobile Optimization */
@media (max-width: 767px) {
    .product-detail {
        padding: 12px;
    }

    .product-container {
        padding: 20px;
        gap: 24px;
    }

    .product-title {
        font-size: 26px;
    }

    .product-meta {
        grid-template-columns: 1fr;
    }

    .amount {
        font-size: 36px;
    }

    .action-section {
        flex-direction: column;
    }

    .wishlist-btn {
        width: 100%;
        height: 50px;
    }
}

/* Enhanced Review Styles */
.review-section {
    /* margin-top: 24px; */
    border-top: 2px solid #e2e8f0;
    padding: 30px 30px 30px 30px;
    background: linear-gradient(135deg, #e0e7ff, #edf2ff);
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.review-header h2 {
    font-size: 28px;
    font-weight: 700;
    color: #2d3748;
    margin: 0;
}

.review-stats {
    display: flex;
    align-items: center;
    gap: 16px;
}

.average-rating {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.rating-number {
    font-size: 24px;
    font-weight: 700;
}

.stars {
    display: flex;
    gap: 2px;
}

.star {
    color: #ffd700;
    font-size: 16px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.star.filled {
    color: #ffd700;
}

.review-count {
    font-size: 14px;
    opacity: 0.9;
}

.reviews-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
}

.review-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
}

.review-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e0;
}

.review-header-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.reviewer-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  text-transform: uppercase;
}

.reviewer-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.reviewer-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.reviewer-name {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
}

.review-rating {
    display: flex;
    align-items: center;
    gap: 8px;
}

.review-rating .star {
    color: #e2e8f0;
    font-size: 14px;
}

.review-rating .star.filled {
    color: #ffd700;
}

.rating-text {
    font-size: 12px;
    color: #718096;
    font-weight: 500;
}

.review-date {
    font-size: 12px;
    color: #a0aec0;
}

.review-comment {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
    font-size: 15px;
}

.no-reviews {
    text-align: center;
    padding: 48px 24px;
    background: #f7fafc;
    border-radius: 16px;
    border: 2px dashed #e2e8f0;
    margin-bottom: 32px;
}

.no-reviews-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.no-reviews h3 {
    font-size: 20px;
    color: #2d3748;
    margin: 0 0 8px 0;
}

.no-reviews p {
    color: #718096;
    margin: 0;
}

.review-form {
    background: #f7fafc;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #e2e8f0;
}

.review-form h3 {
    font-size: 20px;
    color: #2d3748;
    margin: 0 0 20px 0;
    font-weight: 600;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
    font-size: 14px;
}

.rating-input {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.star-input {
    font-size: 28px;
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
}

.star-input:hover,
.star-input.selected {
    color: #ffd700;
    transform: scale(1.1);
}

.rating-label {
    font-size: 14px;
    color: #667eea;
    font-weight: 600;
}

.review-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    transition: all 0.3s ease;
    font-family: inherit;
    background: white;
}

.review-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.review-textarea.error {
    border-color: #e53e3e;
}

.character-count {
    font-size: 12px;
    color: #a0aec0;
    text-align: right;
    margin-top: 4px;
}

.submit-review-btn {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.submit-review-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.submit-review-btn:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.login-prompt {
    text-align: center;
    padding: 48px 24px;
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    margin-bottom: 10px;
}

.login-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.login-prompt h3 {
    font-size: 20px;
    color: #2d3748;
    margin: 0 0 8px 0;
}

.login-prompt p {
    color: #718096;
    margin: 0;
}

.login-link {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: border-color 0.3s ease;
}

.login-link:hover {
    border-bottom-color: #667eea;
}

/* Tablet styles */
@media (min-width: 768px) {
    .product-detail {
        padding: 24px;
    }

    .product-container {
        flex-direction: row;
        gap: 32px;
        padding: 32px;
        max-width: 1000px;
    }

    .product-image {
        width: 350px;
        max-width: none;
        flex-shrink: 0;
    }

    .product-info h1 {
        font-size: 32px;
    }

    .price {
        font-size: 32px;
    }

    .review-header {
        flex-wrap: nowrap;
    }
}

/* Desktop styles */
@media (min-width: 1024px) {
    .product-detail {
        padding: 40px;
    }

    .product-container {
        padding: 40px;
        gap: 40px;
    }

    .product-image {
        width: 400px;
    }

    .product-info h1 {
        font-size: 36px;
    }
}

/* Small mobile optimization */
@media (max-width: 480px) {
    .product-detail {
        padding: 12px;
    }

    .product-container {
        padding: 16px;
        gap: 16px;
        border-radius: 12px;
    }

    .product-info h1 {
        font-size: 20px;
    }

    .description {
        font-size: 14px;
    }

    .flavor {
        font-size: 14px;
    }

    .price {
        font-size: 24px;
    }

    .add-to-cart-btn {
        padding: 14px 20px;
        font-size: 14px;
    }

    .review-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .review-header h2 {
        font-size: 24px;
    }

    .average-rating {
        padding: 8px 16px;
    }

    .rating-number {
        font-size: 20px;
    }

    .reviewer-info {
        gap: 8px;
    }

    .reviewer-avatar {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }

    .star-input {
        font-size: 24px;
    }

    .review-form {
        padding: 16px;
    }
}
</style>