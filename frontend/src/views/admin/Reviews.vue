<template>
  <div class="admin-reviews">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">⭐</span>
        Review Management
      </h1>
      <p class="page-subtitle">Monitor and manage customer reviews</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card total-reviews">
        <div class="stat-icon">💬</div>
        <div class="stat-info">
          <div class="stat-number">{{ reviews.length }}</div>
          <div class="stat-label">Total Reviews</div>
        </div>
      </div>
      
      <div class="stat-card average-rating">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-number">{{ getAverageRating() }}</div>
          <div class="stat-label">Average Rating</div>
        </div>
      </div>
      
      <div class="stat-card positive-reviews">
        <div class="stat-icon">👍</div>
        <div class="stat-info">
          <div class="stat-number">{{ getReviewsByRating(4, 5) }}</div>
          <div class="stat-label">Positive (4-5★)</div>
        </div>
      </div>
      
      <div class="stat-card negative-reviews">
        <div class="stat-icon">👎</div>
        <div class="stat-info">
          <div class="stat-number">{{ getReviewsByRating(1, 2) }}</div>
          <div class="stat-label">Negative (1-2★)</div>
        </div>
      </div>
    </div>

    <!-- Reviews Table Card -->
    <div class="table-card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="card-icon">📋</span>
          Reviews List
          <span class="reviews-count">({{ reviews.length }} reviews)</span>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>

      <!-- Reviews Table -->
      <div v-else-if="reviews.length > 0" class="table-container">
        <table class="reviews-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(review, index) in reviews" :key="review._id" class="review-row">
              <td class="index-cell">{{ index + 1 }}</td>
              
              <td class="customer-cell">
                <div class="customer-info">
                  <div class="customer-avatar">
  <img 
    v-if="review.userId?.avatar" 
    :src="review.userId.avatar" 
    alt="User Avatar" 
    class="avatar-img"
  />
  <span v-else>
    {{ getInitials(review.userId?.name || 'Unknown') }}
  </span>
</div>

                  <div class="customer-details">
                    <div class="customer-name">{{ review.userId?.name || 'Unknown User' }}</div>
                    <div class="customer-id">ID: {{ review.userId?._id?.substring(0, 8) || 'N/A' }}...</div>
                  </div>
                </div>
              </td>
              
              <td class="product-cell">
                <div class="product-info">
                  <div class="product-name">{{ review.productId?.name || 'Unknown Product' }}</div>
                  <div class="product-id">ID: {{ review.productId?._id?.substring(0, 8) || 'N/A' }}...</div>
                </div>
              </td>
              
              <td class="review-content-cell">
                <div class="review-content">
                  <div class="review-text">{{ truncateText(review.comment, 60) }}</div>
                  <button 
                    v-if="review.comment && review.comment.length > 60" 
                    @click="showFullReview(review)"
                    class="read-more-btn"
                  >
                    Read more...
                  </button>
                </div>
              </td>
              
              <td class="rating-cell">
                <div class="rating-display">
                  <div class="stars">
                    <span 
                      v-for="i in 5" 
                      :key="i" 
                      class="star"
                      :class="{ 'filled': i <= (review.rating || 0) }"
                    >
                      ⭐
                    </span>
                  </div>
                  <div class="rating-number">{{ review.rating || 0 }}/5</div>
                </div>
              </td>
              
              <td class="date-cell">
                <div class="review-date">
                  <div class="date">{{ formatDate(review.createdAt) }}</div>
                  <div class="time-ago">{{ getTimeAgo(review.createdAt) }}</div>
                </div>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    class="btn-action btn-view" 
                    @click="viewReview(review)" 
                    title="View Full Review"
                  >
                    👁️
                  </button>
                  <button 
                    class="btn-action btn-delete" 
                    @click="deleteReview(review._id)" 
                    title="Delete Review"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">⭐</div>
        <h3>No Reviews Found</h3>
        <p>Customer reviews will appear here when they rate products.</p>
      </div>
    </div>

    <!-- Review Details Modal -->
    <div v-if="selectedReview" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="modal-icon">⭐</span>
            Review Details
          </h2>
          <button @click="closeModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="review-details">
            <div class="detail-grid">
              <div class="detail-item">
                <label>Customer</label>
                <div class="detail-value">{{ selectedReview.userId?.name || 'Unknown User' }}</div>
              </div>
              
              <div class="detail-item">
                <label>Product</label>
                <div class="detail-value">{{ selectedReview.productId?.name || 'Unknown Product' }}</div>
              </div>
              
              <div class="detail-item">
                <label>Rating</label>
                <div class="detail-value">
                  <div class="rating-display">
                    <div class="stars">
                      <span 
                        v-for="i in 5" 
                        :key="i" 
                        class="star"
                        :class="{ 'filled': i <= (selectedReview.rating || 0) }"
                      >
                        ⭐
                      </span>
                    </div>
                    <span class="rating-text">{{ selectedReview.rating || 0 }} out of 5 stars</span>
                  </div>
                </div>
              </div>
              
              <div class="detail-item">
                <label>Date</label>
                <div class="detail-value">{{ formatDate(selectedReview.createdAt) }}</div>
              </div>
            </div>
            
            <div class="review-comment">
              <label>Review Comment</label>
              <div class="comment-content">
                {{ selectedReview.comment || 'No comment provided' }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Close</button>
          <button @click="deleteFromModal" class="btn btn-danger">Delete Review</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="modal-icon">⚠️</span>
            Confirm Delete
          </h2>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to delete this review?</p>
          <div class="warning-info">
            <div class="warning-item">
              <strong>Customer:</strong> {{ reviewToDelete?.userId?.name || 'Unknown' }}
            </div>
            <div class="warning-item">
              <strong>Product:</strong> {{ reviewToDelete?.productId?.name || 'Unknown' }}
            </div>
            <div class="warning-item">
              <strong>Rating:</strong> {{ reviewToDelete?.rating || 0 }}/5 stars
            </div>
          </div>
          <div class="warning-note">
            <strong>Warning:</strong> This action cannot be undone.
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete Review</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'

const reviews = ref([])
const loading = ref(true)
const showToast = inject('showToast')
const selectedReview = ref(null)
const showDeleteModal = ref(false)
const reviewToDelete = ref(null)

// Fetch reviews
const fetchReviews = async () => {
  try {
    const res = await fetch('https://mochi-mevn.onrender.com/api/admin/reviews', {
      credentials: 'include'
    })
    const data = await res.json()
    reviews.value = data
  } catch (err) {
    showToast('Failed to load reviews', 'error')
  } finally {
    loading.value = false
  }
}

// Delete review
const deleteReview = (id) => {
  const review = reviews.value.find(r => r._id === id)
  reviewToDelete.value = review
  showDeleteModal.value = true
}

// Confirm delete
const confirmDelete = async () => {
  try {
    const res = await fetch(`https://mochi-mevn.onrender.com/api/admin/reviews/${reviewToDelete.value._id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    const data = await res.json()
    if (res.ok) {
      reviews.value = reviews.value.filter(r => r._id !== reviewToDelete.value._id)
      showToast('Review deleted successfully!', 'success')
      selectedReview.value = null
    } else {
      showToast(data.message || 'Failed to delete review', 'error')
    }
  } catch (err) {
    showToast('Error deleting review', 'error')
  } finally {
    cancelDelete()
  }
}

// Cancel delete
const cancelDelete = () => {
  showDeleteModal.value = false
  reviewToDelete.value = null
}

// View review details
const viewReview = (review) => {
  selectedReview.value = review
}

// Show full review (same as view)
const showFullReview = (review) => {
  selectedReview.value = review
}

// Delete from modal
const deleteFromModal = () => {
  reviewToDelete.value = selectedReview.value
  showDeleteModal.value = true
}


// Close modal
const closeModal = () => {
  selectedReview.value = null
}

// Get average rating
const getAverageRating = () => {
  if (reviews.value.length === 0) return '0.0'
  const total = reviews.value.reduce((sum, review) => sum + (review.rating || 0), 0)
  return (total / reviews.value.length).toFixed(1)
}

// Get reviews by rating range
const getReviewsByRating = (min, max) => {
  return reviews.value.filter(review => {
    const rating = review.rating || 0
    return rating >= min && rating <= max
  }).length
}

// Get user initials for avatar
const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

// Truncate text
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get time ago
const getTimeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

onMounted(fetchReviews)
</script>

<style scoped>
.admin-reviews {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 2.2rem;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 1.1rem;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent-color);
}

.stat-card.total-reviews {
  --accent-color: #3b82f6;
}

.stat-card.average-rating {
  --accent-color: #f59e0b;
}

.stat-card.positive-reviews {
  --accent-color: #10b981;
}

.stat-card.negative-reviews {
  --accent-color: #ef4444;
}

.stat-icon {
  font-size: 2rem;
  background: var(--accent-color);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.card-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 1.4rem;
}

.reviews-count {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 400;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Table */
.table-container {
  overflow-x: auto;
}

.reviews-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.reviews-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.reviews-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.review-row:hover {
  background: #f8fafc;
}

/* Table Cells */
.index-cell {
  width: 50px;
  text-align: center;
  color: #64748b;
  font-weight: 500;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 160px;
}

.customer-avatar {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.customer-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 2px;
}

.customer-id,
.product-id {
  font-size: 0.8rem;
  color: #64748b;
}

.product-info {
  min-width: 140px;
}

.product-name {
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 2px;
}

.review-content {
  max-width: 200px;
}

.review-text {
  color: #374151;
  margin-bottom: 4px;
  line-height: 1.4;
}

.read-more-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
}

.read-more-btn:hover {
  text-decoration: underline;
}

.rating-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 0.9rem;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.star.filled {
  opacity: 1;
}

.rating-number {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.review-date {
  min-width: 100px;
}

.date {
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 2px;
}

.time-ago {
  font-size: 0.8rem;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-view {
  background: #dbeafe;
  color: #1e40af;
}

.btn-view:hover {
  background: #bfdbfe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 1.3rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.modal-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-icon {
  font-size: 1.4rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  font-weight: 500;
  color: #1a202c;
}

.rating-text {
  font-size: 0.9rem;
  color: #64748b;
  margin-left: 8px;
}

.review-comment {
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

.review-comment label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.comment-content {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
}

.warning-info {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.warning-item {
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.warning-item:last-child {
  margin-bottom: 0;
}

.warning-note {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.avatar-img:hover {
  transform: scale(1.1);
}


/* Responsive */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .reviews-table {
    font-size: 0.8rem;
  }
  
  .reviews-table th,
  .reviews-table td {
    padding: 8px;
  }
  
  .customer-info {
    min-width: 120px;
  }
  
  .customer-avatar {
    width: 30px;
    height: 30px;
  }
  
  .review-content {
    max-width: 150px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
}
</style>