<template>
  <div class="order-history-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="page-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 17H15M9 13H15M7 21H17a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Order History
        </h1>
        <p class="page-subtitle">Track all your mochi orders in one place</p>
      </div>
      
      <div class="stats-cards" v-if="!loading && orders.length > 0">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M16 8v8m-8-8v8m-3-8h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Orders</span>
            <span class="stat-value">{{ orders.length }}</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon success">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Completed</span>
            <span class="stat-value">{{ completedCount }}</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon pending">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Pending</span>
            <span class="stat-value">{{ pendingCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your orders...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M9 17H15M9 13H15M9 9H15M7 21H17a2 2 0 0 0 2-2V7.414a1 1 0 0 0-.293-.707l-3.414-3.414A1 1 0 0 0 14.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <h3 class="empty-title">No Orders Yet</h3>
      <p class="empty-text">Start shopping to see your order history here</p>
      <button class="empty-cta" @click="$router.push('/products')">
        <span>Browse Mochi</span>
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Order List -->
    <div v-else class="order-list">
      <div
        v-for="(order, index) in orders"
        :key="order._id"
        class="order-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <!-- Order Header -->
        <div class="order-header">
          <div class="order-id-section">
            <span class="order-label">Order ID</span>
            <span class="order-id">{{ formatOrderId(order._id) }}</span>
          </div>
          <span
  class="status-badge"
  :class="normalizeStatus(order.status)"
>
  <span class="status-dot"></span>
  {{ normalizeStatus(order.status) }}
</span>

        </div>

        <!-- Order Meta Info -->
        <div class="order-meta">
          <div class="meta-item">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="meta-content">
              <span class="meta-label">Order Date</span>
              <span class="meta-value">{{ formatDate(order.createdAt) }}</span>
            </div>
          </div>

          <div class="meta-item">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M2 10h20" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div class="meta-content">
              <span class="meta-label">Payment Method</span>
              <span class="meta-value">{{ order.paymentMethod }}</span>
            </div>
          </div>

          <div class="meta-item total">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="meta-content">
              <span class="meta-label">Total Amount</span>
              <span class="meta-value total-price">{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items">
          <div class="items-header">
            <h4 class="items-title">Order Items ({{ order.items.length }})</h4>
          </div>
          <div class="items-list">
            <div
              v-for="item in order.items"
              :key="item.productId"
              class="order-item"
            >
              <div class="item-image-wrapper">
                <img :src="item.imageUrl" :alt="item.name" class="item-image" />
              </div>
              <div class="item-details">
                <h5 class="item-name">{{ item.name }}</h5>
                <div class="item-meta">
                  <span class="item-quantity">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Qty: {{ item.quantity }}
                  </span>
                  <span class="item-unit-price">{{ formatPrice(item.price) }} each</span>
                </div>
              </div>
              <div class="item-price-wrapper">
                <span class="item-price">{{ formatPrice(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Actions -->
        <div class="order-actions">
          <button class="action-btn secondary" @click="openDetail(order)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="2"/>
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            View Details
          </button>
          <button 
            v-if="normalizeStatus(order.status) !== 'cancelled' && normalizeStatus(order.status) !== 'completed'"
            class="action-btn danger" 
            @click="openCancelModal(order._id)"
            :disabled="order.cancelling"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ order.cancelling ? 'Cancelling...' : 'Cancel Order' }}
          </button>
          <button 
            v-else-if="normalizeStatus(order.status) === 'completed'"
            class="action-btn primary" 
            @click="reorder(order._id)"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.4.4-.1.7.3.7H17m0 0v3M17 16v3m0-3h3m-3 0h-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Reorder
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Cancel Order Modal -->
<Transition name="fade">
  <div v-if="showCancelModal" class="modal-overlay modal-center">

    <div class="modal-box">
      <h3>Cancel Order</h3>
      <p>
        Are you sure you want to cancel this order?<br />
        <strong>This action cannot be undone.</strong>
      </p>

      <div class="modal-actions">
        <button
          class="action-btn secondary"
          @click="showCancelModal = false"
        >
          Keep Order
        </button>

        <button
          class="action-btn danger"
          :disabled="cancelling"
          @click="confirmCancel"
        >
          {{ cancelling ? 'Cancelling...' : 'Yes, Cancel Order' }}
        </button>
      </div>
    </div>
  </div>
</Transition>

<!-- Order Detail Modal -->
<Transition name="fade">
  <div v-if="showDetailModal" class="modal-overlay modal-scroll">

    <div class="modal-box detail">

      <!-- Header -->
      <div class="detail-header">
        <div>
          <h3>Order Details</h3>
          <span class="detail-order-id">
            {{ formatOrderId(selectedOrder._id) }}
          </span>
        </div>

        <span
          class="status-badge"
          :class="normalizeStatus(selectedOrder.status)"
        >
          <span class="status-dot"></span>
          {{ normalizeStatus(selectedOrder.status) }}
        </span>
      </div>

      <!-- Summary -->
      <div class="detail-summary">
        <div class="summary-item">
          <span>Order Date</span>
          <strong>{{ formatDate(selectedOrder.createdAt) }}</strong>
        </div>

        <div class="summary-item">
          <span>Payment</span>
          <strong>{{ selectedOrder.paymentMethod }}</strong>
        </div>

        <div class="summary-item total">
          <span>Total</span>
          <strong>{{ formatPrice(selectedOrder.total) }}</strong>
        </div>
      </div>

      <!-- Items -->
      <div class="detail-items">
        <h4>Items ({{ selectedOrder.items.length }})</h4>

        <div
          v-for="(item, i) in selectedOrder.items"
          :key="i"
          class="detail-item"
        >
          <img :src="item.imageUrl" :alt="item.name" />

          <div class="detail-item-info">
            <h5>{{ item.name }}</h5>
            <span>Qty: {{ item.quantity }}</span>
          </div>

          <div class="detail-item-price">
            {{ formatPrice(item.price * item.quantity) }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-actions">
        <button
          class="action-btn secondary"
          @click="showDetailModal = false"
        >
          Close
        </button>
      </div>

    </div>
  </div>
</Transition>



</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const orders = ref([])
const loading = ref(true)
const router = useRouter()
const showDetailModal = ref(false)
const selectedOrder = ref(null)

const cancelOrderId = ref(null)

// const toast = useToast();

const showCancelModal = ref(false);
const cancelling = ref(false);
const selectedOrderId = ref(null);

// const confirmCancel = async () => {
//   try {
//     cancelling.value = true;

//     await api.cancelOrder(selectedOrderId.value); // API của bạn

//     toast.success('Order cancelled successfully');
//     showCancelModal.value = false;
//   } catch (err) {
//     toast.error('Failed to cancel order');
//   } finally {
//     cancelling.value = false;
//   }
// };


const user = JSON.parse(localStorage.getItem('mochi_user'))

// 🔐 Protect page
if (!user) {
  router.push('/login')
}

const completedCount = computed(() => {
  return orders.value.filter(o =>
    normalizeStatus(o.status) === 'completed'
  ).length
})


const pendingCount = computed(() => {
  return orders.value.filter(o =>
    normalizeStatus(o.status) === 'pending'
  ).length
})

const normalizeStatus = (status) => {
  if (!status) return ''

  const s = status.toLowerCase()

  if (['paid', 'completed', 'success'].includes(s)) return 'completed'
  if (['pending', 'processing'].includes(s)) return 'pending'
  if (['cancelled', 'canceled'].includes(s)) return 'cancelled'

  return s
}

const openDetail = (order) => {
  selectedOrder.value = order
  showDetailModal.value = true
}


const openCancelModal = (orderId) => {
  cancelOrderId.value = orderId
  showCancelModal.value = true
}


const confirmCancel = async () => {
  try {
    cancelling.value = true
    await cancelOrder(cancelOrderId.value)

    toast.success('Order cancelled successfully', {
      position: 'top-right',
      autoClose: 3000,
    })

    showCancelModal.value = false
  } catch (err) {
    toast.error(err.message || 'Cancel failed')
  } finally {
    cancelling.value = false
  }
}



const fetchOrders = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/orders/my-orders', {
      credentials: 'include'
    })

    if (!res.ok) throw new Error('Unauthorized')

    orders.value = await res.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('vi-VN') + ' $'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}


const formatOrderId = (id) => {
  return '#' + id.slice(-8).toUpperCase()
}

const viewDetails = (orderId) => {
  console.log('View order:', orderId)
  // Implement view details logic
}

const reorder = (orderId) => {
  console.log('Reorder:', orderId)
  // Implement reorder logic
}

const cancelOrder = async (orderId) => {
  const order = orders.value.find(o => o._id === orderId)
  if (!order) return

  try {
    order.cancelling = true

    const res = await fetch(
      `http://localhost:5000/api/orders/${orderId}/cancel`,
      {
        method: 'PATCH',
        credentials: 'include'
      }
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Cancel failed')
    }

    order.status = data.order.status
  } finally {
    order.cancelling = false
  }
}



onMounted(fetchOrders)
</script>

<style scoped>
.order-history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9ff 0%, #fef6f9 100%);
}

/* Hero Section */
.hero-section {
  margin-bottom: 48px;
}

.hero-content {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 42px;
  font-weight: 800;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
}

.title-icon {
  width: 48px;
  height: 48px;
  stroke: url(#gradient);
}

.page-subtitle {
  font-size: 18px;
  color: #6b7280;
  font-weight: 500;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(102, 126, 234, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 28px;
  height: 28px;
}

.stat-icon.total {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
  color: #667eea;
}

.stat-icon.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15));
  color: #10b981;
}

.stat-icon.pending {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15));
  color: #f59e0b;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  width: 56px;
  height: 56px;
  border: 4px solid rgba(102, 126, 234, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 18px;
  color: #6b7280;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon svg {
  width: 64px;
  height: 64px;
  stroke: #667eea;
}

.empty-title {
  font-size: 28px;
  font-weight: 700;
  color: #374151;
  margin: 0 0 12px 0;
}

.empty-text {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 32px 0;
}

.empty-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.empty-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

.empty-cta svg {
  width: 20px;
  height: 20px;
}

/* Order List */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.12);
}

/* Order Header */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.order-id-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.order-id {
  font-size: 20px;
  font-weight: 700;
  color: #374151;
  font-family: 'Courier New', monospace;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-badge.pending {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1));
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.pending .status-dot {
  background: #f59e0b;
}

.status-badge.paid,
.status-badge.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.paid .status-dot,
.status-badge.completed .status-dot {
  background: #10b981;
}

.status-badge.cancelled {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1));
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge.cancelled .status-dot {
  background: #ef4444;
}

/* Order Meta */
.order-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.03));
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.meta-item.total {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.05));
}

.meta-icon {
  width: 24px;
  height: 24px;
  color: #667eea;
  flex-shrink: 0;
}

.meta-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.meta-value {
  font-size: 15px;
  color: #374151;
  font-weight: 600;
}

.total-price {
  font-size: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

/* Order Items */
.order-items {
  margin-bottom: 24px;
}

.items-header {
  margin-bottom: 16px;
}

.items-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.08);
  transition: all 0.3s ease;
}

.order-item:hover {
  background: rgba(102, 126, 234, 0.06);
  border-color: rgba(102, 126, 234, 0.15);
  transform: translateX(4px);
}

.item-image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.order-item:hover .item-image {
  transform: scale(1.1);
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-quantity svg {
  width: 16px;
  height: 16px;
}

.item-unit-price {
  font-weight: 500;
}

.item-price-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-price {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

/* Order Actions */
.order-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 2px solid rgba(102, 126, 234, 0.1);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.action-btn.secondary:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.action-btn.danger {
  background: transparent;
  color: #dc2626;
  border: 2px solid rgba(220, 38, 38, 0.3);
}

.action-btn.danger:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.25);
}

.action-btn.danger:hover:not(:disabled) svg {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}


.action-btn.danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-box {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-box h3 {
  margin-bottom: 10px;
}

.modal-box p {
  color: #555;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}


/* Responsive Design */
@media (max-width: 768px) {
  .order-history-container {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 32px;
    flex-direction: column;
    gap: 12px;
  }

  .title-icon {
    width: 40px;
    height: 40px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .order-card {
    padding: 20px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-meta {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .order-item {
    flex-direction: column;
    text-align: center;
  }

  .item-image-wrapper {
    width: 100%;
    height: 180px;
  }

  .item-meta {
    flex-direction: column;
    gap: 8px;
  }

  .order-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 28px;
  }

  .order-id {
    font-size: 16px;
  }

  .meta-value {
    font-size: 14px;
  }

  .item-name {
    font-size: 15px;
  }

  .item-price {
    font-size: 16px;
  }

  .stat-value {
    font-size: 26px;
  }

  .empty-title {
    font-size: 22px;
  }

  .empty-text {
    font-size: 14px;
  }

  .empty-cta {
    padding: 14px 24px;
    font-size: 14px;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;

  padding: 16px;
  overflow-y: auto;
  z-index: 999;
}

.modal-center {
  align-items: center;
}

.modal-scroll {
  align-items: flex-start;
  padding-top: 80px; /* chừa header */
}



.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 420px;
}

.modal-box.large {
  width: 700px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.detail-table th,
.detail-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.order-total {
  text-align: right;
  margin-top: 16px;
  font-size: 18px;
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


/* ===== ORDER DETAIL MODAL ===== */
.modal-box.detail {
  width: 100%;
  max-width: 760px;

  max-height: calc(100vh - 120px); /* ✅ then chốt */
  display: flex;
  flex-direction: column;

  border-radius: 20px;
  padding: 28px;
  margin-top: 35px;
}


.detail-items {
  flex: 1;              /* ✅ chiếm phần còn lại */
  overflow-y: auto;     /* ✅ scroll nội dung */
  padding-right: 6px;   /* tránh che scrollbar */
}


.detail-items::-webkit-scrollbar {
  width: 6px;
}
.detail-items::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.4);
  border-radius: 8px;
}


/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.detail-header h3 {
  margin: 0;
  font-size: 22px;
}

.detail-order-id {
  font-size: 14px;
  color: #6b7280;
  font-family: monospace;
}

/* Summary */
.detail-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.summary-item {
  background: rgba(102, 126, 234, 0.06);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item span {
  font-size: 13px;
  color: #6b7280;
}

.summary-item strong {
  font-size: 16px;
  color: #374151;
}

.summary-item.total {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.15),
    rgba(118, 75, 162, 0.12)
  );
}

.summary-item.total strong {
  font-size: 18px;
  color: #667eea;
}

/* Items */
.detail-items h4 {
  margin-bottom: 12px;
  font-size: 18px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  margin-bottom: 12px;
  background: #fff;
}

.detail-item img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 12px;
}

.detail-item-info {
  flex: 1;
}

.detail-item-info h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.detail-item-info span {
  font-size: 14px;
  color: #6b7280;
}

.detail-item-price {
  font-weight: 700;
  color: #667eea;
  font-size: 16px;
}

/* Mobile */
@media (max-width: 640px) {
  .detail-summary {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    text-align: center;
  }

  .detail-item img {
    width: 100%;
    height: 160px;
  }
}

</style>
