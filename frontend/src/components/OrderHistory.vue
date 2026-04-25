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
    const res = await fetch('https://mochi-mevn.onrender.com/api/orders/my-orders', {
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
      `https://mochi-mevn.onrender.com/api/orders/${orderId}/cancel`,
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
  position: relative;
  min-height: calc(100vh - 82px);
  max-width: none;
  margin: 0;
  padding: clamp(64px, 7vw, 108px) 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 12%, rgba(217, 255, 143, 0.08), transparent 26rem),
    radial-gradient(circle at 86% 20%, rgba(139, 74, 47, 0.26), transparent 30rem),
    linear-gradient(135deg, #211d18 0%, #3b2419 100%);
  color: #fffaf2;
}

.order-history-container::before {
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

.order-history-container::after {
  content: 'Orders';
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

.hero-section,
.order-list,
.loading-state,
.empty-state {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 0px));
  margin-left: auto;
  margin-right: auto;
}

/* Hero */
.hero-section {
  margin-bottom: 42px;
}

.hero-content {
  max-width: 760px;
  margin-bottom: 34px;
}

.page-title {
  display: block;
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(4.2rem, 8vw, 8.4rem);
  font-weight: 500;
  line-height: 0.84;
  letter-spacing: -0.085em;
}

.title-icon {
  display: none;
}

.page-title::before {
  content: 'Order history';
  display: block;
  margin-bottom: 20px;
  color: #d9ff8f;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.page-subtitle {
  max-width: 560px;
  margin: 28px 0 0;
  color: rgba(255, 250, 242, 0.72);
  font-size: 1.04rem;
  line-height: 1.75;
}

/* Stats */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  position: relative;
  min-height: 136px;
  display: grid;
  align-content: end;
  gap: 14px;
  padding: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 24px 70px rgba(0, 0, 0, 0.16);
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.085);
  border-color: rgba(255, 250, 242, 0.24);
}

.stat-icon {
  display: none;
}

.stat-label {
  color: rgba(255, 250, 242, 0.56);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.stat-value {
  display: block;
  margin-top: 8px;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(2.8rem, 4.8vw, 4.4rem);
  font-weight: 600;
  line-height: 0.9;
  letter-spacing: -0.06em;
  -webkit-text-fill-color: currentColor;
  background: none;
}

/* Loading */
.loading-state {
  min-height: 420px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 18px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 250, 242, 0.16);
  border-top-color: #d9ff8f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: rgba(255, 250, 242, 0.68);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

/* Empty */
.empty-state {
  min-height: 460px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 54px 24px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
}

.empty-icon {
  display: none;
}

.empty-title {
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(3.4rem, 7vw, 6rem);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.07em;
}

.empty-text {
  max-width: 420px;
  margin: 20px auto 30px;
  color: rgba(255, 250, 242, 0.68);
  font-size: 1rem;
  line-height: 1.7;
}

.empty-cta {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border: 1px solid #fffaf2;
  border-radius: 999px;
  background: #fffaf2;
  color: #211d18;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: none;
  transition: transform 160ms ease, background 160ms ease;
}

.empty-cta:hover {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
}

.empty-cta svg {
  width: 18px;
  height: 18px;
}

/* Order list */
.order-list {
  display: grid;
  gap: 18px;
}

.order-card {
  position: relative;
  overflow: hidden;
  padding: 22px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 24px 70px rgba(0, 0, 0, 0.16);
  opacity: 0;
  animation: slideUp 0.6s ease forwards;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.order-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 250, 242, 0.24);
}

.order-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 250, 242, 0.12);
}

.order-label {
  display: block;
  margin-bottom: 7px;
  color: rgba(255, 250, 242, 0.48);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.order-id {
  color: #fffaf2;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.95rem;
  font-weight: 700;
}

/* Status */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 13px;
  border-radius: 999px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  background: rgba(255, 250, 242, 0.08);
  color: rgba(255, 250, 242, 0.76);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  animation: pulse 2s ease infinite;
}

.status-badge.pending {
  background: rgba(154, 106, 33, 0.18);
  color: #f0c879;
  border-color: rgba(240, 200, 121, 0.26);
}

.status-badge.pending .status-dot {
  background: #f0c879;
}

.status-badge.completed,
.status-badge.paid {
  background: rgba(66, 106, 79, 0.22);
  color: #dff7e6;
  border-color: rgba(125, 190, 145, 0.28);
}

.status-badge.completed .status-dot,
.status-badge.paid .status-dot {
  background: #9fe0b0;
}

.status-badge.cancelled {
  background: rgba(159, 45, 32, 0.2);
  color: #ffd9d4;
  border-color: rgba(255, 138, 120, 0.26);
}

.status-badge.cancelled .status-dot {
  background: #ff8a78;
}

/* Meta */
.order-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-height: 78px;
  padding: 14px;
  border: 1px solid rgba(255, 250, 242, 0.12);
  border-radius: 20px;
  background: rgba(255, 250, 242, 0.055);
}

.meta-icon {
  width: 18px;
  height: 18px;
  color: #d9ff8f;
  flex-shrink: 0;
  margin-top: 2px;
}

.meta-content {
  display: grid;
  gap: 6px;
}

.meta-label {
  color: rgba(255, 250, 242, 0.48);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.meta-value {
  color: rgba(255, 250, 242, 0.82);
  font-size: 0.92rem;
  font-weight: 650;
}

.total-price {
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.7rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.04em;
  -webkit-text-fill-color: currentColor;
  background: none;
}

/* Items */
.order-items {
  margin-bottom: 22px;
}

.items-header {
  margin-bottom: 12px;
}

.items-title {
  margin: 0;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.55rem;
  font-weight: 600;
  letter-spacing: -0.04em;
}

.items-list {
  display: grid;
  gap: 10px;
}

.order-item {
  display: grid;
  grid-template-columns: 84px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid rgba(255, 250, 242, 0.10);
  border-radius: 20px;
  background: rgba(255, 250, 242, 0.045);
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.order-item:hover {
  transform: translateX(4px);
  background: rgba(255, 250, 242, 0.07);
  border-color: rgba(255, 250, 242, 0.18);
}

.item-image-wrapper {
  width: 84px;
  height: 84px;
  overflow: hidden;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 16px;
  background: rgba(255, 250, 242, 0.08);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

.order-item:hover .item-image {
  transform: scale(1.06);
}

.item-details {
  display: grid;
  gap: 7px;
}

.item-name {
  margin: 0;
  color: #fffaf2;
  font-size: 0.98rem;
  font-weight: 750;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: rgba(255, 250, 242, 0.56);
  font-size: 0.82rem;
}

.item-quantity {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.item-quantity svg {
  width: 14px;
  height: 14px;
  color: #d9ff8f;
}

.item-price {
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: -0.04em;
}

/* Actions */
.order-actions {
  display: flex;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 250, 242, 0.12);
}

.action-btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 0 16px;
  border-radius: 999px;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
}

.action-btn svg {
  width: 17px;
  height: 17px;
}

.action-btn.secondary {
  border: 1px solid rgba(255, 250, 242, 0.22);
  background: transparent;
  color: #fffaf2;
}

.action-btn.secondary:hover {
  transform: translateY(-2px);
  background: rgba(255, 250, 242, 0.08);
  border-color: rgba(255, 250, 242, 0.36);
}

.action-btn.primary {
  border: 1px solid rgba(255, 250, 242, 0.34);
  background: rgba(255, 250, 242, 0.88);
  color: #211d18;
  box-shadow: none;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  background: #d9ff8f;
  border-color: #d9ff8f;
}

.action-btn.danger {
  border: 1px solid rgba(255, 138, 120, 0.28);
  background: transparent;
  color: #ffd9d4;
}

.action-btn.danger:hover:not(:disabled) {
  transform: translateY(-2px);
  background: rgba(159, 45, 32, 0.22);
  border-color: rgba(255, 138, 120, 0.42);
  box-shadow: none;
}

.action-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding: 18px;
  overflow-y: auto;
  background: rgba(33, 29, 24, 0.62);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal-center {
  align-items: center;
}

.modal-scroll {
  align-items: flex-start;
  padding-top: 86px;
}

.modal-box {
  width: min(440px, 100%);
  padding: 26px;
  border: 1px solid rgba(255, 250, 242, 0.14);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(217, 255, 143, 0.08), transparent 18rem),
    rgba(33, 29, 24, 0.94);
  color: #fffaf2;
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.36);
}

.modal-box h3 {
  margin: 0 0 10px;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.3rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.05em;
}

.modal-box p {
  margin: 0;
  color: rgba(255, 250, 242, 0.68);
  line-height: 1.7;
}

.modal-box strong {
  color: #fffaf2;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.modal-box.detail {
  width: min(760px, 100%);
  max-width: 760px;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  padding: 28px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.detail-header h3 {
  margin: 0;
}

.detail-order-id {
  display: block;
  margin-top: 8px;
  color: rgba(255, 250, 242, 0.5);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.summary-item {
  padding: 15px;
  border: 1px solid rgba(255, 250, 242, 0.12);
  border-radius: 20px;
  background: rgba(255, 250, 242, 0.055);
  display: grid;
  gap: 7px;
}

.summary-item span {
  color: rgba(255, 250, 242, 0.48);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.summary-item strong {
  color: rgba(255, 250, 242, 0.84);
  font-size: 0.95rem;
}

.summary-item.total strong {
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.6rem;
  line-height: 1;
  letter-spacing: -0.04em;
}

.detail-items {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
}

.detail-items h4 {
  margin: 0 0 12px;
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.04em;
}

.detail-item {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 250, 242, 0.10);
  border-radius: 20px;
  background: rgba(255, 250, 242, 0.045);
}

.detail-item img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 16px;
}

.detail-item-info h5 {
  margin: 0 0 5px;
  color: #fffaf2;
  font-size: 0.98rem;
}

.detail-item-info span {
  color: rgba(255, 250, 242, 0.56);
  font-size: 0.82rem;
}

.detail-item-price {
  color: #fffaf2;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.04em;
}

/* Scrollbars */
.detail-items::-webkit-scrollbar {
  width: 8px;
}

.detail-items::-webkit-scrollbar-thumb {
  border: 3px solid transparent;
  border-radius: 999px;
  background: rgba(255, 250, 242, 0.24);
  background-clip: padding-box;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 220ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 860px) {
  .stats-cards,
  .order-meta,
  .detail-summary {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
  }

  .order-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .order-history-container {
    padding: 54px 14px;
  }

  .page-title {
    font-size: 4.1rem;
  }

  .order-card {
    padding: 18px;
    border-radius: 24px;
  }

  .order-item,
  .detail-item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .item-image-wrapper,
  .detail-item img {
    width: 100%;
    height: 180px;
  }

  .modal-box.detail {
    padding: 20px;
  }

  .detail-header {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
