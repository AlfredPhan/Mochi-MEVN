// frontend/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import About from '../components/About.vue'
import Contact from '../components/Contact.vue'
import Cart from '../components/Cart.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/contact', name: 'Contact', component: Contact },
  { path: '/cart', name: 'Cart', component: Cart },

  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/views/ForgotPassword.vue') },
  { path: '/reset-password/:token', name: 'ResetPassword', component: () => import('@/views/ResetPassword.vue') },

  { path: '/product/:id', name: 'ProductDetail', component: () => import('@/views/ProductDetail.vue'), props: true },
  { path: '/products', name: 'Products', component: () => import('@/components/ProductList.vue') },

  { path: '/checkout', name: 'Checkout', component: () => import('@/views/Checkout.vue') },
  { path: '/checkout-success', name: 'CheckoutSuccess', component: () => import('@/views/CheckoutSuccess.vue') },
  { path: '/payment-success', name: 'PaymentSuccess', component: () => import('@/views/PaymentSuccess.vue') },
  { path: '/payment-cancel', name: 'PaymentCancel', component: () => import('@/views/PaymentCancel.vue') },

  {
  path: '/profile',
  name: 'Profile',
  component: () => import('../views/Profile.vue'),
  meta: { requiresAuth: true }
},

{
  path: '/orders',
  name: 'OrderHistory',
  component: () => import('@/components/OrderHistory.vue'),
  meta: { requiresAuth: true }
},

  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'products', name: 'AdminProducts', component: () => import('@/views/admin/Products.vue') },
      { path: 'orders', name: 'AdminOrders', component: () => import('@/views/admin/Orders.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('@/views/admin/Users.vue') },
      { path: 'reviews', name: 'AdminReviews', component: () => import('@/views/admin/Reviews.vue') },
      { path: 'chats', name: 'AdminChats', component: () => import('@/views/admin/Chats.vue') },
    ],
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// ✅ Guard đặt sau khi tạo router
router.beforeEach((to, from, next) => {
  const auth = JSON.parse(localStorage.getItem('mochi_user'))

  if (to.meta.requiresAuth) {
    if (!auth) {
      return next({ name: 'Login' })
    }

    if (to.meta.role && auth.role !== to.meta.role) {
      return next({ name: 'Home' })
    }
  }

  // ✅ Chỉ đến đây nếu không bị chặn
  next()
})


export default router
