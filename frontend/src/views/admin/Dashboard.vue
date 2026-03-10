<script setup>
import { ref, onMounted, computed } from 'vue'

const stats = ref({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalReviews: 0, totalChats: 0 })
const orders = ref([])
const products = ref([])
const reviews = ref([])
const loading = ref(true)
const selectedPeriod = ref('7d')

onMounted(async () => {
  try {
    const [statsRes, ordersRes, productsRes, reviewsRes] = await Promise.all([
      fetch('http://localhost:5000/api/admin/stats', { credentials: 'include' }),
      fetch('http://localhost:5000/api/admin/orders', { credentials: 'include' }),
      fetch('http://localhost:5000/api/admin/products', { credentials: 'include' }),
      fetch('http://localhost:5000/api/admin/reviews', { credentials: 'include' }),
    ])
    stats.value = await statsRes.json()
    orders.value = await ordersRes.json()
    products.value = await productsRes.json()
    reviews.value = await reviewsRes.json()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

// ── Revenue Chart Data ──────────────────────────────────────────────────────
const periods = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
]

const revenueData = computed(() => {
  const days = selectedPeriod.value === '7d' ? 7 : selectedPeriod.value === '30d' ? 30 : 90
  const now = new Date()
  const buckets = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)

    const dayOrders = orders.value.filter(o => {
      const od = new Date(o.createdAt)
      return od >= d && od < next && o.status !== 'Cancelled'
    })
    const revenue = dayOrders.reduce((s, o) => s + (o.total || 0), 0)
    const label = days <= 7
      ? d.toLocaleDateString('en-US', { weekday: 'short' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    buckets.push({ label, revenue, count: dayOrders.length })
  }
  return buckets
})

const maxRevenue = computed(() => Math.max(...revenueData.value.map(d => d.revenue), 1))
const totalRevenue = computed(() => orders.value.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0))
const paidOrders = computed(() => orders.value.filter(o => o.status === 'Paid').length)
const pendingOrders = computed(() => orders.value.filter(o => o.status === 'Pending').length)

const barHeight = (revenue) => Math.max((revenue / maxRevenue.value) * 100, revenue > 0 ? 2 : 0)

// ── Top Selling Products ────────────────────────────────────────────────────
const topSelling = computed(() => {
  const map = {}
  orders.value.forEach(order => {
    if (order.status === 'Cancelled') return
    ;(order.items || []).forEach(item => {
      const id = item._id || item.productId || item.name
      if (!map[id]) map[id] = { name: item.name, qty: 0, revenue: 0, imageUrl: item.imageUrl || '' }
      map[id].qty += item.quantity || 1
      map[id].revenue += (item.price || 0) * (item.quantity || 1)
    })
  })
  return Object.values(map)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .map((p, i) => ({ ...p, rank: i + 1 }))
})

const maxQty = computed(() => Math.max(...topSelling.value.map(p => p.qty), 1))

// ── Average Rating ──────────────────────────────────────────────────────────
const avgRating = computed(() => {
  if (!reviews.value.length) return '0.0'
  return (reviews.value.reduce((s, r) => s + (r.rating || 0), 0) / reviews.value.length).toFixed(1)
})

const recentOrders = computed(() =>
  [...orders.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
)

const formatCurrency = (n) => '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
const formatDate = (s) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const statusClass = (s) => ({ Paid: 'badge-paid', Pending: 'badge-pending', Cancelled: 'badge-cancelled' }[s] || '')
</script>

<template>
  <div class="dashboard">

    <!-- ── Header ── -->
    <div class="dash-header">
      <div class="dash-header-left">
        <h1 class="dash-title">Dashboard</h1>
        <p class="dash-sub">Welcome back — here's what's happening today 🍡</p>
      </div>
      <div class="dash-date">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</div>
    </div>

    <!-- ── KPI Cards ── -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-revenue">
        <div class="kpi-icon">💰</div>
        <div class="kpi-body">
          <div class="kpi-value">{{ formatCurrency(totalRevenue) }}</div>
          <div class="kpi-label">Total Revenue</div>
        </div>
        <div class="kpi-sparkline"></div>
      </div>
      <div class="kpi-card kpi-orders">
        <div class="kpi-icon">🛒</div>
        <div class="kpi-body">
          <div class="kpi-value">{{ stats.totalOrders }}</div>
          <div class="kpi-label">Total Orders</div>
          <div class="kpi-sub-row">
            <span class="chip chip-green">{{ paidOrders }} paid</span>
            <span class="chip chip-yellow">{{ pendingOrders }} pending</span>
          </div>
        </div>
      </div>
      <div class="kpi-card kpi-products">
        <div class="kpi-icon">📦</div>
        <div class="kpi-body">
          <div class="kpi-value">{{ stats.totalProducts }}</div>
          <div class="kpi-label">Products</div>
        </div>
      </div>
      <div class="kpi-card kpi-users">
        <div class="kpi-icon">👥</div>
        <div class="kpi-body">
          <div class="kpi-value">{{ stats.totalUsers }}</div>
          <div class="kpi-label">Users</div>
        </div>
      </div>
      <div class="kpi-card kpi-rating">
        <div class="kpi-icon">⭐</div>
        <div class="kpi-body">
          <div class="kpi-value">{{ avgRating }}</div>
          <div class="kpi-label">Avg Rating</div>
          <div class="kpi-sub-row">
            <span class="chip chip-blue">{{ stats.totalReviews }} reviews</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Main Grid ── -->
    <div class="main-grid">

      <!-- Revenue Chart -->
      <div class="chart-card">
        <div class="card-head">
          <div>
            <h2 class="card-title">Revenue Overview</h2>
            <p class="card-sub">Net revenue from non-cancelled orders</p>
          </div>
          <div class="period-pills">
            <button
              v-for="p in periods" :key="p.value"
              class="period-pill"
              :class="{ active: selectedPeriod === p.value }"
              @click="selectedPeriod = p.value"
            >{{ p.label }}</button>
          </div>
        </div>

        <div v-if="loading" class="chart-loading">
          <div class="spinner"></div>
        </div>
        <div v-else class="chart-area">
          <div
            class="chart-bars"
            :style="{ '--bar-gap': selectedPeriod === '90d' ? '2px' : selectedPeriod === '30d' ? '3px' : '6px' }"
          >
            <div
              v-for="(d, i) in revenueData"
              :key="i"
              class="bar-col"
              :title="`${d.label}: ${formatCurrency(d.revenue)} (${d.count} orders)`"
            >
              <div class="bar-tooltip">
                <span class="tooltip-amt">{{ formatCurrency(d.revenue) }}</span>
                <span class="tooltip-cnt">{{ d.count }} orders</span>
              </div>
              <div class="bar-wrap">
                <div
                  class="bar-fill"
                  :style="{ height: barHeight(d.revenue) + '%' }"
                  :class="{ 'bar-zero': d.revenue === 0 }"
                ></div>
              </div>
              <div
                class="bar-label"
                :style="{
                  visibility: (selectedPeriod === '90d' && i % 14 !== 0) ||
                              (selectedPeriod === '30d' && i % 5 !== 0)
                              ? 'hidden' : 'visible'
                }"
              >{{ d.label }}</div>
            </div>
          </div>
          <div class="chart-total-row">
            <span class="chart-total-label">Period Total</span>
            <span class="chart-total-val">{{ formatCurrency(revenueData.reduce((s, d) => s + d.revenue, 0)) }}</span>
          </div>
        </div>
      </div>

      <!-- Top Selling -->
      <div class="topsell-card">
        <div class="card-head">
          <div>
            <h2 class="card-title">🏆 Top Selling Mochi</h2>
            <p class="card-sub">Ranked by units sold</p>
          </div>
        </div>

        <div v-if="loading" class="chart-loading"><div class="spinner"></div></div>
        <div v-else-if="topSelling.length === 0" class="empty-msg">No sales data yet.</div>
        <div v-else class="topsell-list">
          <div v-for="p in topSelling" :key="p.rank" class="topsell-row">
            <div class="ts-rank" :class="`rank-${p.rank}`">{{ p.rank }}</div>
            <div class="ts-info">
              <div class="ts-name">{{ p.name }}</div>
              <div class="ts-bar-wrap">
                <div class="ts-bar" :style="{ width: (p.qty / maxQty * 100) + '%' }"></div>
              </div>
            </div>
            <div class="ts-stats">
              <div class="ts-qty">{{ p.qty }} <span>units</span></div>
              <div class="ts-rev">{{ formatCurrency(p.revenue) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bottom Row ── -->
    <div class="bottom-grid">

      <!-- Recent Orders -->
      <div class="recent-card">
        <div class="card-head">
          <h2 class="card-title">Recent Orders</h2>
          <router-link to="/admin/orders" class="view-all">View all →</router-link>
        </div>
        <div v-if="loading" class="chart-loading"><div class="spinner"></div></div>
        <div v-else class="recent-list">
          <div v-if="recentOrders.length === 0" class="empty-msg">No orders yet.</div>
          <div v-for="o in recentOrders" :key="o._id" class="recent-row">
            <div class="recent-avatar">{{ (o.name || 'G')[0].toUpperCase() }}</div>
            <div class="recent-info">
              <div class="recent-name">{{ o.name || 'Guest' }}</div>
              <div class="recent-date">{{ formatDate(o.createdAt) }}</div>
            </div>
            <span class="badge" :class="statusClass(o.status)">{{ o.status }}</span>
            <div class="recent-total">{{ formatCurrency(o.total) }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-card">
        <div class="card-head">
          <h2 class="card-title">Quick Actions</h2>
        </div>
        <div class="quick-grid">
          <router-link to="/admin/products" class="quick-item">
            <div class="qi-icon">➕</div>
            <div class="qi-label">Add Product</div>
          </router-link>
          <router-link to="/admin/orders" class="quick-item">
            <div class="qi-icon">📋</div>
            <div class="qi-label">View Orders</div>
          </router-link>
          <router-link to="/admin/users" class="quick-item">
            <div class="qi-icon">👤</div>
            <div class="qi-label">Manage Users</div>
          </router-link>
          <router-link to="/admin/reviews" class="quick-item">
            <div class="qi-icon">⭐</div>
            <div class="qi-label">Reviews</div>
          </router-link>
          <router-link to="/admin/chats" class="quick-item">
            <div class="qi-icon">💬</div>
            <div class="qi-label">Chatbot</div>
          </router-link>
        </div>

        <!-- Order Status Donut-ish -->
        <div class="status-breakdown">
          <div class="sb-title">Order Status Breakdown</div>
          <div class="sb-rows">
            <div class="sb-row">
              <span class="sb-dot dot-paid"></span>
              <span class="sb-name">Paid</span>
              <div class="sb-bar-wrap"><div class="sb-bar bar-paid" :style="{ width: (paidOrders / Math.max(stats.totalOrders,1) * 100) + '%' }"></div></div>
              <span class="sb-count">{{ paidOrders }}</span>
            </div>
            <div class="sb-row">
              <span class="sb-dot dot-pending"></span>
              <span class="sb-name">Pending</span>
              <div class="sb-bar-wrap"><div class="sb-bar bar-pending" :style="{ width: (pendingOrders / Math.max(stats.totalOrders,1) * 100) + '%' }"></div></div>
              <span class="sb-count">{{ pendingOrders }}</span>
            </div>
            <div class="sb-row">
              <span class="sb-dot dot-cancelled"></span>
              <span class="sb-name">Cancelled</span>
              <div class="sb-bar-wrap"><div class="sb-bar bar-cancelled" :style="{ width: ((stats.totalOrders - paidOrders - pendingOrders) / Math.max(stats.totalOrders,1) * 100) + '%' }"></div></div>
              <span class="sb-count">{{ stats.totalOrders - paidOrders - pendingOrders }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

.dashboard {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  font-family: 'Sora', sans-serif;
  color: #1a1a2e;
  box-sizing: border-box;
}

/* ── Header ── */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  padding: 28px 32px;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  border-radius: 20px;
  color: white;
  position: relative;
  overflow: hidden;
}
.dash-header::before {
  content: '🍡';
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 5rem;
  opacity: 0.08;
}
.dash-title {
  margin: 0 0 4px;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.dash-sub {
  margin: 0;
  color: rgba(255,255,255,0.65);
  font-size: 0.95rem;
}
.dash-date {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  font-family: 'JetBrains Mono', monospace;
}

/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f5;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.kpi-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--kpi-accent);
}
.kpi-revenue  { --kpi-accent: linear-gradient(90deg,#f6d365,#fda085); }
.kpi-orders   { --kpi-accent: linear-gradient(90deg,#667eea,#764ba2); }
.kpi-products { --kpi-accent: linear-gradient(90deg,#11998e,#38ef7d); }
.kpi-users    { --kpi-accent: linear-gradient(90deg,#f093fb,#f5576c); }
.kpi-rating   { --kpi-accent: linear-gradient(90deg,#4facfe,#00f2fe); }

.kpi-icon {
  font-size: 1.6rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}
.kpi-value {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #1a1a2e;
  margin-bottom: 2px;
}
.kpi-label {
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.kpi-sub-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.chip {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}
.chip-green   { background: #dcfce7; color: #166534; }
.chip-yellow  { background: #fef9c3; color: #854d0e; }
.chip-blue    { background: #dbeafe; color: #1e40af; }

/* ── Main Grid ── */
.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  margin-bottom: 16px;
}

/* Shared Card ── */
.chart-card, .topsell-card, .recent-card, .quick-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f5;
  min-width: 0;
  overflow: hidden;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}
.card-title {
  margin: 0 0 4px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a2e;
}
.card-sub {
  margin: 0;
  font-size: 0.78rem;
  color: #aaa;
}

/* Period Pills ── */
.period-pills {
  display: flex;
  gap: 4px;
  background: #f4f4f8;
  border-radius: 10px;
  padding: 4px;
}
.period-pill {
  padding: 5px 14px;
  border: none;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: #888;
  transition: all 0.2s;
  font-family: 'Sora', sans-serif;
}
.period-pill.active {
  background: #2c7a7b;
  color: white;
  box-shadow: 0 2px 8px rgba(44,122,123,0.35);
}

/* Bar Chart ── */
.chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 180px;
}
.spinner {
  width: 32px; height: 32px;
  border: 3px solid #f0f0f5;
  border-top-color: #38b2ac;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.chart-area {
  height: 220px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: var(--bar-gap, 6px);
  padding-bottom: 4px;
  overflow: hidden;
}
.bar-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.bar-col:hover .bar-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }
.bar-tooltip {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  background: #1a1a2e;
  color: white;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.tooltip-amt { font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.tooltip-cnt { color: rgba(255,255,255,0.6); font-size: 0.65rem; }
.bar-wrap {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: flex-end;
}
.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #43e97b 0%, #38b2ac 60%, #2c7a7b 100%);
  border-radius: 4px 4px 2px 2px;
  transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1);
  min-height: 3px;
  position: relative;
}
.bar-col:hover .bar-fill:not(.bar-zero) {
  background: linear-gradient(180deg, #68d391 0%, #4fd1c5 60%, #2c7a7b 100%);
  filter: brightness(1.08);
}
.bar-fill::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(255,255,255,0.15), transparent);
  border-radius: 4px 4px 0 0;
}
.bar-fill.bar-zero { background: #e8e8f0; min-height: 3px; }
.bar-label {
  font-size: 0.55rem;
  color: #aaa;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
  text-overflow: clip;
  font-family: 'JetBrains Mono', monospace;
}
.chart-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f5;
  margin-top: 4px;
}
.chart-total-label { font-size: 0.78rem; color: #aaa; font-weight: 600; }
.chart-total-val   { font-size: 1rem; font-weight: 800; color: #2c7a7b; font-family: 'JetBrains Mono', monospace; }

/* Top Selling ── */
.topsell-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.topsell-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ts-rank {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.8rem;
  flex-shrink: 0;
}
.rank-1 { background: linear-gradient(135deg,#f6d365,#fda085); color: white; }
.rank-2 { background: linear-gradient(135deg,#c0c0c0,#a8a8a8); color: white; }
.rank-3 { background: linear-gradient(135deg,#cd7f32,#b5651d); color: white; }
.rank-4, .rank-5 { background: #f0f0f5; color: #888; }

.ts-info { flex: 1; min-width: 0; }
.ts-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ts-bar-wrap {
  height: 6px;
  background: #f0f0f5;
  border-radius: 3px;
  overflow: hidden;
}
.ts-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.34,1.2,0.64,1);
}

.ts-stats { text-align: right; flex-shrink: 0; }
.ts-qty {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a1a2e;
  font-family: 'JetBrains Mono', monospace;
}
.ts-qty span { font-size: 0.65rem; color: #aaa; font-weight: 400; font-family: 'Sora', sans-serif; }
.ts-rev { font-size: 0.72rem; color: #10b981; font-weight: 600; }

/* ── Bottom Grid ── */
.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
}

/* Recent Orders ── */
.view-all {
  font-size: 0.78rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  align-self: center;
}
.view-all:hover { text-decoration: underline; }
.recent-list { display: flex; flex-direction: column; gap: 10px; }
.recent-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.15s;
}
.recent-row:hover { background: #f8f8fc; }
.recent-avatar {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #302b63, #667eea);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.recent-info { flex: 1; min-width: 0; }
.recent-name { font-size: 0.85rem; font-weight: 600; color: #1a1a2e; }
.recent-date { font-size: 0.72rem; color: #aaa; }
.badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}
.badge-paid      { background: #dcfce7; color: #166534; }
.badge-pending   { background: #fef9c3; color: #854d0e; }
.badge-cancelled { background: #fee2e2; color: #991b1b; }
.recent-total {
  font-size: 0.85rem;
  font-weight: 700;
  color: #302b63;
  font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
}

/* Quick Actions + Status ── */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px 6px;
  background: #f8f8fc;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.quick-item:hover {
  background: #ededf8;
  border-color: #d0d0ea;
  transform: translateY(-2px);
}
.qi-icon  { font-size: 1.3rem; line-height: 1; }
.qi-label { font-size: 0.6rem; color: #555; font-weight: 600; text-align: center; }

.status-breakdown { border-top: 1px solid #f0f0f5; padding-top: 16px; }
.sb-title { font-size: 0.75rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.sb-rows { display: flex; flex-direction: column; gap: 10px; }
.sb-row  { display: flex; align-items: center; gap: 8px; }
.sb-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-paid      { background: #10b981; }
.dot-pending   { background: #f59e0b; }
.dot-cancelled { background: #ef4444; }
.sb-name { font-size: 0.78rem; color: #555; font-weight: 500; width: 65px; flex-shrink: 0; }
.sb-bar-wrap { flex: 1; height: 6px; background: #f0f0f5; border-radius: 3px; overflow: hidden; }
.sb-bar { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
.bar-paid      { background: #10b981; }
.bar-pending   { background: #f59e0b; }
.bar-cancelled { background: #ef4444; }
.sb-count { font-size: 0.78rem; font-weight: 700; color: #1a1a2e; width: 24px; text-align: right; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }

.empty-msg { color: #aaa; font-size: 0.85rem; text-align: center; padding: 20px 0; }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .main-grid, .bottom-grid {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}
@media (max-width: 860px) {
  .main-grid, .bottom-grid { grid-template-columns: 1fr; }
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 560px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .quick-grid { grid-template-columns: repeat(3, 1fr); }
  .kpi-value { font-size: 1.1rem; }
}
</style>