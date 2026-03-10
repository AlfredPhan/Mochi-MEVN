<!-- src/views/admin/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/admin/dashboard" class="nav-item">
          <span class="nav-icon">📊</span>
          <span>Dashboard</span>
        </router-link>
        
        <router-link to="/admin/products" class="nav-item">
          <span class="nav-icon">📦</span>
          <span>Products</span>
        </router-link>
        
        <router-link to="/admin/orders" class="nav-item">
          <span class="nav-icon">🛒</span>
          <span>Orders</span>
        </router-link>
        
        <router-link to="/admin/users" class="nav-item">
          <span class="nav-icon">👥</span>
          <span>Users</span>
        </router-link>
        
        <router-link to="/admin/reviews" class="nav-item">
          <span class="nav-icon">⭐</span>
          <span>Reviews</span>
        </router-link>
        
        <router-link to="/admin/chats" class="nav-item">
          <span class="nav-icon">💬</span>
          <span>Chatbot</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
    
    <main class="content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const logout = inject('logout')
const router = useRouter()

const handleLogout = () => {
  logout()
  router.push('/') // về Home sau khi logout
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;
}

.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 0 8px;
  border-radius: 8px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8fafc;
}

/* Responsive design */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .nav-menu {
    flex-direction: row;
    padding: 10px;
    gap: 8px;
  }
  
  .nav-item {
    white-space: nowrap;
    margin: 0 4px;
    padding: 8px 12px;
  }
  
  .nav-item span:last-child {
    display: none;
  }
  
  .sidebar-header,
  .sidebar-footer {
    display: none;
  }
}

/* Smooth animations */
* {
  transition: all 0.2s ease;
}

/* Custom scrollbar for content */
.content-wrapper::-webkit-scrollbar {
  width: 6px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>