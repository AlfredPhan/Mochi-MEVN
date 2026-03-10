<template>
  <div class="admin-orders">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">🛒</span>
        Order Management
      </h1>
      <p class="page-subtitle">Track and manage customer orders efficiently</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-number">{{ getOrderCount('Pending') }}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
      
      <div class="stat-card paid">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ getOrderCount('Paid') }}</div>
          <div class="stat-label">Paid</div>
        </div>
      </div>
      
      <div class="stat-card cancelled">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <div class="stat-number">{{ getOrderCount('Cancelled') }}</div>
          <div class="stat-label">Cancelled</div>
        </div>
      </div>
      
      <div class="stat-card total">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-number">{{ orders.length }}</div>
          <div class="stat-label">Total Orders</div>
        </div>
      </div>
    </div>

    <!-- Orders Table Card -->
    <div class="table-card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="card-icon">📋</span>
          Orders List
          <span class="orders-count">({{ orders.length }} orders)</span>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>

      <!-- Orders Table -->
      <div v-else-if="orders.length > 0" class="table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer Info</th>
              <th>Contact</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(order, index) in orders" :key="order._id" class="order-row">
              <td class="index-cell">{{ index + 1 }}</td>
              
              <td class="customer-cell">
                <div class="customer-info">
                  <div class="customer-name">{{ order.name }}</div>
                  <div class="customer-address">{{ truncateText(order.address, 30) }}</div>
                </div>
              </td>
              
              <td class="contact-cell">
                <div class="contact-info">
                  <div class="contact-email">{{ order.email }}</div>
                  <div class="contact-phone">{{ order.phone }}</div>
                </div>
              </td>
              
              <td class="total-cell">
                <div class="order-total">${{ order.total.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
              </td>
              
              <td class="payment-cell">
                <span class="payment-method">{{ order.paymentMethod }}</span>
              </td>
              
              <td class="status-cell">
                <select 
                  v-model="order.status" 
                  @change="updateStatus(order)" 
                  class="status-select"
                  :class="getStatusClass(order.status)"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              
              <td class="date-cell">
                <div class="order-date">
                  <div class="date">{{ formatDate(order.createdAt) }}</div>
                  <div class="time">{{ formatTime(order.createdAt) }}</div>
                </div>
              </td>
              
              <td class="actions-cell">
                <button class="btn-action btn-detail" @click="viewOrder(order)" title="View Details">
                  👁️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>No Orders Found</h3>
        <p>Orders will appear here when customers make purchases.</p>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="modal-icon">📄</span>
            Order Details
          </h2>
          <button @click="closeModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="order-summary">
            <div class="summary-grid">
              <div class="summary-item">
                <label>Customer</label>
                <div class="summary-value">{{ selectedOrder.name }}</div>
              </div>
              
              <div class="summary-item">
                <label>Email</label>
                <div class="summary-value">{{ selectedOrder.email }}</div>
              </div>
              
              <div class="summary-item">
                <label>Phone</label>
                <div class="summary-value">{{ selectedOrder.phone }}</div>
              </div>
              
              <div class="summary-item">
                <label>Status</label>
                <div class="summary-value">
                  <span class="status-badge" :class="getStatusClass(selectedOrder.status)">
                    {{ selectedOrder.status }}
                  </span>
                </div>
              </div>
              
              <div class="summary-item full-width">
                <label>Delivery Address</label>
                <div class="summary-value">{{ selectedOrder.address }}</div>
              </div>
              
              <div class="summary-item">
                <label>Payment Method</label>
                <div class="summary-value">{{ selectedOrder.paymentMethod }}</div>
              </div>
              
              <div class="summary-item">
                <label>Order Total</label>
                <div class="summary-value total-amount">
                  ${{ selectedOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
              </div>
            </div>
          </div>

          <div class="order-items">
            <h3 class="items-title">
              <span class="items-icon">📦</span>
              Order Items ({{ selectedOrder.items.length }})
            </h3>
            
            <div class="items-list">
              <div v-for="item in selectedOrder.items" :key="item._id" class="item-card">
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-details">
                    Qty: {{ item.quantity }} × ${{ item.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </div>
                </div>
                <div class="item-total">
                  ${{ (item.quantity * item.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from "vue";

const orders = ref([]);
const loading = ref(true);
const selectedOrder = ref(null);
const showToast = inject("showToast");

// Fetch orders
const fetchOrders = async () => {
  try {
    const res = await fetch("https://mochi-mevn.onrender.com/api/admin/orders", {
      credentials: "include",
    });
    const data = await res.json();
    orders.value = data;
  } catch (err) {
    console.error("Error fetching orders:", err);
    showToast("Failed to load orders", "error");
  } finally {
    loading.value = false;
  }
};

// Update order status
const updateStatus = async (order) => {
  try {
    const res = await fetch(
      `https://mochi-mevn.onrender.com/api/admin/orders/${order._id}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: order.status }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      showToast("Order status updated successfully!", "success");
    } else {
      showToast(data.message || "Failed to update status", "error");
    }
  } catch (err) {
    console.error("Error updating order:", err);
    showToast("Server error when updating status", "error");
  }
};

// View order details
const viewOrder = (order) => {
  selectedOrder.value = order;
};

// Close modal
const closeModal = () => {
  selectedOrder.value = null;
};

// Get order count by status
const getOrderCount = (status) => {
  return orders.value.filter(order => order.status === status).length;
};

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    'Pending': 'status-pending',
    'Paid': 'status-paid',
    'Cancelled': 'status-cancelled'
  };
  return classes[status] || '';
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format time
const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Truncate text
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

onMounted(fetchOrders);
</script>

<style scoped>
.admin-orders {
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

.stat-card.pending {
  --accent-color: #f59e0b;
}

.stat-card.paid {
  --accent-color: #10b981;
}

.stat-card.cancelled {
  --accent-color: #ef4444;
}

.stat-card.total {
  --accent-color: #3b82f6;
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

.orders-count {
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

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.orders-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.orders-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.order-row:hover {
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
  min-width: 150px;
}

.customer-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 2px;
}

.customer-address {
  font-size: 0.8rem;
  color: #64748b;
}

.contact-info {
  min-width: 140px;
}

.contact-email {
  font-size: 0.8rem;
  color: #3b82f6;
  margin-bottom: 2px;
}

.contact-phone {
  font-size: 0.8rem;
  color: #64748b;
}

.order-total {
  font-weight: 600;
  color: #059669;
  font-size: 1rem;
}

.payment-method {
  background: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.status-select.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-select.status-paid {
  background: #dcfce7;
  color: #166534;
}

.status-select.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.order-date {
  min-width: 100px;
}

.date {
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 2px;
}

.time {
  font-size: 0.8rem;
  color: #64748b;
}

.btn-action {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-detail {
  background: #dbeafe;
  color: #1e40af;
}

.btn-detail:hover {
  background: #bfdbfe;
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

.order-summary {
  margin-bottom: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item.full-width {
  grid-column: 1 / -1;
}

.summary-item label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.summary-value {
  font-weight: 500;
  color: #1a202c;
}

.summary-value.total-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #059669;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-paid {
  background: #dcfce7;
  color: #166534;
}

.status-badge.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.order-items {
  border-top: 1px solid #f1f5f9;
  padding-top: 24px;
}

.items-title {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-icon {
  font-size: 1.2rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.item-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.item-details {
  font-size: 0.9rem;
  color: #64748b;
}

.item-total {
  font-weight: 600;
  color: #059669;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
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
  
  .orders-table {
    font-size: 0.8rem;
  }
  
  .orders-table th,
  .orders-table td {
    padding: 8px;
  }
  
  .customer-info,
  .contact-info {
    min-width: 120px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
}
</style>