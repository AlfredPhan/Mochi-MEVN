<template>
  <div class="admin-users">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">👥</span>
        User Management
      </h1>
      <p class="page-subtitle">Manage user accounts and permissions</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card total-users">
        <div class="stat-icon">👤</div>
        <div class="stat-info">
          <div class="stat-number">{{ users.length }}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>
      
      <div class="stat-card admin-users">
        <div class="stat-icon">👑</div>
        <div class="stat-info">
          <div class="stat-number">{{ getUserCount('admin') }}</div>
          <div class="stat-label">Admins</div>
        </div>
      </div>
      
      <div class="stat-card regular-users">
        <div class="stat-icon">👨‍💻</div>
        <div class="stat-info">
          <div class="stat-number">{{ getUserCount('user') }}</div>
          <div class="stat-label">Regular Users</div>
        </div>
      </div>
      
      <div class="stat-card new-users">
        <div class="stat-icon">🆕</div>
        <div class="stat-info">
          <div class="stat-number">{{ getNewUsersCount() }}</div>
          <div class="stat-label">New This Month</div>
        </div>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="table-card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="card-icon">📋</span>
          Users List
          <span class="users-count">({{ users.length }} users)</span>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading users...</p>
      </div>

      <!-- Users Table -->
      <div v-else-if="users.length > 0" class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User Info</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in users" :key="user._id" class="user-row">
              <td class="index-cell">{{ index + 1 }}</td>
              
              <td class="user-info-cell">
                <div class="user-info">
                  <div class="user-avatar">
                    <img 
                      v-if="user.avatar" 
                      :src="user.avatar" 
                      alt="avatar" 
                      class="avatar-img"
                    />
                    <span v-else>
                      {{ getInitials(user.name) }}
                    </span>
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-id">ID: {{ user._id.substring(0, 8) }}...</div>
                  </div>
                </div>
              </td>
              
              <td class="email-cell">
                <div class="user-email">{{ user.email }}</div>
              </td>
              
              <td class="contact-cell">
                <div class="contact-info">
                  <span v-if="user.phone" class="contact-value">
                    <span class="contact-icon">📱</span>
                    {{ user.phone }}
                  </span>
                  <span v-else class="no-data">Not provided</span>
                </div>
              </td>
              
              <td class="address-cell">
                <div class="address-info">
                  <span v-if="user.address" class="address-value" :title="user.address">
                    <span class="contact-icon">📍</span>
                    {{ truncateText(user.address, 30) }}
                  </span>
                  <span v-else class="no-data">Not provided</span>
                </div>
              </td>
              
              <td class="role-cell">
                <select 
                  v-model="user.role" 
                  @change="updateRole(user)" 
                  class="role-select"
                  :class="getRoleClass(user.role)"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              
              <td class="date-cell">
                <div class="join-date">
                  <div class="date">{{ formatDate(user.createdAt) }}</div>
                  <div class="time-ago">{{ getTimeAgo(user.createdAt) }}</div>
                </div>
              </td>
              
              <td class="status-cell">
                <span class="status-badge active">Active</span>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    class="btn-action btn-delete" 
                    @click="deleteUser(user._id)" 
                    title="Delete User"
                    :disabled="user.role === 'admin' && getUserCount('admin') === 1"
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
        <div class="empty-icon">👥</div>
        <h3>No Users Found</h3>
        <p>User accounts will appear here when people register.</p>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="modal-icon">⚠️</span>
            Confirm Delete
          </h2>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to delete this user account?</p>
          <div class="warning-info">
            <div class="warning-item">
              <strong>User:</strong> {{ userToDelete?.name }}
            </div>
            <div class="warning-item">
              <strong>Email:</strong> {{ userToDelete?.email }}
            </div>
            <div class="warning-item" v-if="userToDelete?.phone">
              <strong>Phone:</strong> {{ userToDelete?.phone }}
            </div>
            <div class="warning-item" v-if="userToDelete?.address">
              <strong>Address:</strong> {{ userToDelete?.address }}
            </div>
          </div>
          <div class="warning-note">
            <strong>Warning:</strong> This action cannot be undone. All user data will be permanently removed.
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'

const users = ref([])
const loading = ref(true)
const showToast = inject('showToast')
const showDeleteModal = ref(false)
const userToDelete = ref(null)

// Fetch users
const fetchUsers = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/admin/users', {
      credentials: 'include'
    })
    const data = await res.json()
    users.value = data
  } catch (err) {
    showToast('Failed to load users', 'error')
  } finally {
    loading.value = false
  }
}

// Update role
const updateRole = async (user) => {
  // Prevent removing the last admin
  if (user.role === 'user' && getUserCount('admin') === 1) {
    showToast('Cannot remove the last admin user', 'error')
    user.role = 'admin' // Revert the change
    return
  }

  try {
    const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role: user.role })
    })
    const data = await res.json()
    if (res.ok) {
      showToast(`Role updated to ${data.role} successfully!`, 'success')
    } else {
      showToast(data.message || 'Failed to update role', 'error')
    }
  } catch (err) {
    showToast('Error updating role', 'error')
  }
}

// Delete user confirmation
const deleteUser = (id) => {
  const user = users.value.find(u => u._id === id)
  
  // Prevent deleting the last admin
  if (user.role === 'admin' && getUserCount('admin') === 1) {
    showToast('Cannot delete the last admin user', 'error')
    return
  }
  
  userToDelete.value = user
  showDeleteModal.value = true
}

// Confirm delete
const confirmDelete = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/admin/users/${userToDelete.value._id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    const data = await res.json()
    if (res.ok) {
      users.value = users.value.filter(u => u._id !== userToDelete.value._id)
      showToast('User deleted successfully!', 'success')
    } else {
      showToast(data.message || 'Failed to delete user', 'error')
    }
  } catch (err) {
    showToast('Error deleting user', 'error')
  } finally {
    cancelDelete()
  }
}

// Cancel delete
const cancelDelete = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

// Get user count by role
const getUserCount = (role) => {
  return users.value.filter(user => user.role === role).length
}

// Get new users count (this month)
const getNewUsersCount = () => {
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  return users.value.filter(user => {
    const userDate = new Date(user.createdAt)
    return userDate.getMonth() === thisMonth && userDate.getFullYear() === thisYear
  }).length
}

// Get role class for styling
const getRoleClass = (role) => {
  return role === 'admin' ? 'role-admin' : 'role-user'
}

// Get user initials for avatar
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

// Truncate text for long addresses
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
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

onMounted(fetchUsers)
</script>

<style scoped>
.admin-users {
  max-width: 1400px;
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

.stat-card.total-users {
  --accent-color: #3b82f6;
}

.stat-card.admin-users {
  --accent-color: #8b5cf6;
}

.stat-card.regular-users {
  --accent-color: #10b981;
}

.stat-card.new-users {
  --accent-color: #f59e0b;
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

.users-count {
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

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.users-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.users-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.user-row:hover {
  background: #f8fafc;
}

/* Table Cells */
.index-cell {
  width: 50px;
  text-align: center;
  color: #64748b;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 2px;
}

.user-id {
  font-size: 0.8rem;
  color: #64748b;
}

.user-email {
  color: #3b82f6;
  font-weight: 500;
}

.contact-cell,
.address-cell {
  min-width: 150px;
}

.contact-info,
.address-info {
  display: flex;
  align-items: center;
}

.contact-value,
.address-value {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
  font-size: 0.85rem;
}

.contact-icon {
  font-size: 1rem;
}

.no-data {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.85rem;
}

.role-select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.role-select.role-admin {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}

.role-select.role-user {
  background: #dbeafe;
  color: #1e40af;
  border-color: #3b82f6;
}

.join-date {
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

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
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

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover:not(:disabled) {
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
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
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

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #374151;
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
  
  .users-table {
    font-size: 0.8rem;
  }
  
  .users-table th,
  .users-table td {
    padding: 8px;
  }
  
  .user-info {
    min-width: 140px;
  }
  
  .user-avatar {
    width: 35px;
    height: 35px;
  }
  
  .contact-cell,
  .address-cell {
    min-width: 120px;
  }
  
  .modal-content {
    margin: 10px;
  }
}
</style>