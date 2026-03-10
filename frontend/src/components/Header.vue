<!-- frontend/src/components/Header.vue -->
<template>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo-section">
                    <h1 class="logo">
                        <img src="../assets/logo.png" alt="Mochi Logo" class="logo-img" />
                        <span class="logo-text">Mochi Store</span>
                    </h1>
                    <span class="tagline">Premium Japanese Treats</span>
                </div>

                <nav class="nav-section">
                    <ul class="nav">
                        <li><router-link to="/" class="nav-link" active-class="active"
                                @click="resetAuthState">Home</router-link></li>
                        <li><router-link to="/about" class="nav-link" active-class="active"
                                @click="resetAuthState">About</router-link></li>
                        <li><router-link to="/contact" class="nav-link" active-class="active"
                                @click="resetAuthState">Contact</router-link></li>
                        <li v-if="auth?.user?.role === 'admin'">
  <router-link to="/admin/dashboard">Admin</router-link>
</li>

                    </ul>
                </nav>

                <div class="header-actions">
                    <!-- Auth links for desktop -->
                    <div class="auth-section desktop-only">
                        <template v-if="user && user.name">
                            <div class="user-info" @click="toggleUserMenu">
  <div class="user-avatar">
    <img
      v-if="user?.avatar"
      :src="user.avatar"
      alt="avatar"
      class="avatar-img"
    />
    <span v-else class="user-initial">
      {{ user?.name?.charAt(0).toUpperCase() }}
    </span>
  </div>

  <div class="user-details">
    <span class="user-greeting">Hello,</span>
    <span class="user-name">{{ user.name }}</span>
  </div>

  <!-- Dropdown -->
  <div
    v-if="showUserMenu"
    class="user-dropdown"
    @click.stop
  >
    <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
      <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Profile</span>
    </router-link>
<router-link
  to="/orders"
  class="dropdown-item"
  @click="closeUserMenu"
>
  <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 17H15M9 13H15M7 21H17a2 2 0 0 0 2-2V5
         a2 2 0 0 0-2-2H7
         a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  <span>Order History</span>
</router-link>


    <div class="dropdown-divider"></div>
    <button class="dropdown-item logout-item" @click="logoutAndCloseMenu">
      <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Logout</span>
    </button>
  </div>
</div>

                        </template>
                        <template v-else>
                            <div class="auth-links">
                                <router-link to="/login" class="auth-link" :class="{ 'active-auth': isLoginActive }"
                                    @click="setActiveAuth('login')">Login</router-link>
                                <router-link to="/register" class="auth-link"
                                    :class="{ 'active-auth': isRegisterActive }"
                                    @click="setActiveAuth('register')">Register</router-link>
                            </div>
                        </template>
                    </div>

                    <div class="action-buttons">
                        <button class="search-btn" @click="toggleSearch" :class="{ 'search-active': showSearch }">
                            <div class="search-btn-content">
                                <svg class="search-icon" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="currentcolor" stroke-width="2" />
                                    <path d="m21 21-4.35-4.35" stroke="currentcolor" stroke-width="2" />
                                </svg>
                                <span class="search-text desktop-search-text">Search</span>
                            </div>
                            <div class="search-ripple"></div>
                        </button>

                        <div class="cart-section">
                            <button class="cart-btn" @click="goToCart">
                                <div class="cart-btn-content">
                                    <svg class="cart-icon" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16 5 16H17M17 13V16M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                    <span class="cart-count" v-if="cart?.cartCount?.value > 0">
                                        {{ cart.cartCount.value }}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <button class="menu-toggle mobile-only" @click="toggleMobileMenu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <nav class="mobile-nav" v-if="showMobileMenu" @click.stop>
                <ul class="mobile-nav-list">
                    <li><router-link to="/" class="mobile-nav-link" active-class="active"
                            @click="resetAuthState; hideMobileMenu()">Home</router-link></li>
                    <li><router-link to="/about" class="mobile-nav-link" active-class="active"
                            @click="resetAuthState; hideMobileMenu()">About</router-link></li>
                    <li><router-link to="/contact" class="mobile-nav-link" active-class="active"
                            @click="resetAuthState; hideMobileMenu()">Contact</router-link></li>

                    <!-- Auth section for mobile -->
                    <div class="mobile-auth-section">
                        <template v-if="user && user.name">
                            <div class="mobile-user-card">
                                <div class="mobile-user-avatar">
  <img 
    v-if="user?.avatar" 
    :src="user.avatar" 
    alt="avatar" 
    class="avatar-img"
  />
  <span v-else class="mobile-user-initial">
    {{ user.name.charAt(0).toUpperCase() }}
  </span>
</div>

                                <div class="mobile-user-info">
                                    <span class="mobile-user-greeting">👋 Hello,</span>
                                    <span class="mobile-user-name">{{ user.name }}</span>
                                </div>
                            </div>
                            <li>
                                <button class="mobile-logout-btn" @click="() => { handleLogout(); hideMobileMenu() }">
                                    <svg class="mobile-logout-icon" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    Logout
                                </button>
                            </li>
                        </template>
                        <template v-else>
                            <li><router-link to="/login" class="mobile-auth-link"
                                    :class="{ 'active-mobile-auth': isLoginActive }"
                                    @click="setActiveAuth('login'); hideMobileMenu()">Login</router-link></li>
                            <li><router-link to="/register" class="mobile-auth-link"
                                    :class="{ 'active-mobile-auth': isRegisterActive }"
                                    @click="setActiveAuth('register'); hideMobileMenu()">Register</router-link></li>
                        </template>
                    </div>
                </ul>
            </nav>

            <!-- Search Overlay -->
            <Teleport to="body">
                <div class="search-overlay" v-if="showSearch" @click="closeSearch">
                    <div class="search-container" @click.stop>
                        <div class="search-header">
                            <h3 class="search-title">Search Mochi</h3>

                        </div>
                        <div class="search-input-container">
                            <svg class="search-input-icon" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentcolor" stroke-width="2" />
                                <path d="m21 21-4.35-4.35" stroke="currentcolor" stroke-width="2" />
                            </svg>
                            <input type="text" placeholder="Search for mochi flavors, brands..." class="search-input"
                                v-model="searchQuery" @keyup.enter="performSearch" ref="searchInputRef" required>
                            <button class="search-submit" @click="performSearch" :disabled="!searchQuery.trim()">
                                <span>Search</span>
                                <svg class="search-submit-icon" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <div class="search-suggestions">
                            <span class="suggestion-label">Popular searches:</span>
                            <div class="suggestion-tags">
                                <span class="suggestion-tag" @click="searchSuggestion('strawberry')">Strawberry</span>
                                <span class="suggestion-tag" @click="searchSuggestion('chocolate')">Chocolate</span>
                                <span class="suggestion-tag" @click="searchSuggestion('matcha')">Matcha</span>
                                <span class="suggestion-tag" @click="searchSuggestion('taro')">Taro</span>
                            </div>
                        </div>
                        <!-- <button class="search-close" @click="closeSearch">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="m18 6-12 12M6 6l12 12" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button> -->
                    </div>
                </div>
            </Teleport>
        </div>
    </header>
</template>

<!-- Add this to your Header.vue script section -->
<script setup>
import { ref, inject, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const showSearch = ref(false)
const searchQuery = ref('')
const showMobileMenu = ref(false)
const activeAuth = ref(null)
const searchInputRef = ref(null)

const cart = inject('cart')
const router = useRouter()
const route = useRoute()

const isLoginActive = computed(() => route.path === '/login')
const isRegisterActive = computed(() => route.path === '/register')

const user = inject('user')
const logout = inject('logout')

// Debug để kiểm tra user data
watch(() => user?.value, (newUser) => {
    // console.log('👤 User data in header:', newUser)
    // console.log('🖼️ Avatar URL:', newUser?.avatar)
    // console.log('📝 User name:', newUser?.name)
}, { immediate: true, deep: true })

// Computed để xử lý avatar
const avatarUrl = computed(() => {
    const url = user?.value?.avatar
    // console.log('Computed avatar URL:', url)
    return url
})

const hasAvatar = computed(() => {
    return user?.value?.avatar && user.value.avatar.trim() !== ''
})

const handleLogout = () => {
    logout()
}

const goToCart = () => {
    router.push('/cart')
}

const setActiveAuth = (type) => {
    activeAuth.value = type
    setTimeout(() => {
        if (route.path !== '/login' && route.path !== '/register') {
            activeAuth.value = null
        }
    }, 300)
}

const resetAuthState = () => {
    activeAuth.value = null
}

const logoutAndCloseMenu = () => {
  handleLogout()
  closeUserMenu()
}


watch(() => route.path, (newPath) => {
    if (newPath !== '/login' && newPath !== '/register') {
        activeAuth.value = null
    }
})

// console.log('Cart count:', cart?.cartCount?.value)

const toggleSearch = async () => {
    showSearch.value = !showSearch.value
    if (showSearch.value) {
        await nextTick()
        searchInputRef.value?.focus()
    }
}

const closeSearch = (resetQuery = true) => {
    // console.log('Closing search overlay')
    showSearch.value = false
    if (resetQuery) {
        searchQuery.value = ''
    }
}

const performSearch = () => {
    if (!searchQuery.value.trim()) return
    // console.log('Searching for:', searchQuery.value)
    router.push({ path: '/products', query: { search: searchQuery.value } })
    closeSearch(false)
}

const searchSuggestion = (suggestion) => {
    searchQuery.value = suggestion
    performSearch()
}

const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value
}

const hideMobileMenu = () => {
    showMobileMenu.value = false
}

const handleClickOutside = (event) => {
    const mobileNav = document.querySelector('.mobile-nav')
    const menuToggle = document.querySelector('.menu-toggle')

    if (showMobileMenu.value &&
        mobileNav &&
        !mobileNav.contains(event.target) &&
        !menuToggle.contains(event.target)) {
        showMobileMenu.value = false
    }
}

const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

// Tự đóng khi click ra ngoài
const handleClickOutsideUserMenu = (e) => {
  const userInfo = document.querySelector('.user-info')
  const dropdown = document.querySelector('.user-dropdown')

  if (
    showUserMenu.value &&
    dropdown &&
    !dropdown.contains(e.target) &&
    !userInfo.contains(e.target)
  ) {
    showUserMenu.value = false
  }
}


onMounted(() => {
  document.addEventListener('click', handleClickOutsideUserMenu)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideUserMenu)
})


onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    // console.log('Header mounted - User:', user?.value)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    transition: all 0.3s ease;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
}

/* Logo Section */
.logo-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 28px;
    font-weight: 700;
}

.logo-img {
    width: 42px;
    height: 42px;
    border-radius: 6px;
    object-fit: cover;
}

.logo-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
}

.tagline {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-left: 54px;
}

/* Navigation */
.nav-section {
    flex: 1;
    display: flex;
    justify-content: center;
}

.nav {
    list-style: none;
    display: flex;
    gap: 40px;
    margin: 0;
    padding: 0;
}

.nav-link {
    text-decoration: none;
    color: #6b7280;
    font-weight: 500;
    font-size: 16px;
    padding: 10px 20px;
    border-radius: 25px;
    transition: all 0.3s ease;
    position: relative;
    border: 2px solid transparent;
}

.nav-link:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.08);
    border-color: rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
}

.nav-link.active {
    color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
    border-color: rgba(102, 126, 234, 0.3);
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
}

/* Header Actions */
.header-actions {
    display: flex;
    align-items: center;
    gap: 24px;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 16px;
}

/* Auth Section - Desktop */
.auth-section {
    display: flex;
    align-items: center;
    padding-right: 20px;
    border-right: 1px solid rgba(102, 126, 234, 0.2);
}

/* User Info - Desktop */
.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
    padding: 12px 16px;
    border-radius: 20px;
    border: 1px solid rgba(102, 126, 234, 0.2);
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.3);
}

.user-initial {
    color: white;
    font-weight: 700;
    font-size: 16px;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-greeting {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
}

.user-name {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
}

.logout-btn {
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.2);
    color: #dc2626;
    cursor: pointer;
    font-weight: 600;
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.logout-btn:hover {
    background: rgba(220, 38, 38, 0.15);
    border-color: rgba(220, 38, 38, 0.3);
    transform: translateY(-1px);
}

.logout-icon {
    width: 14px;
    height: 14px;
}

/* Auth Links - Desktop (for non-logged in users) */
.auth-links {
    display: flex;
    align-items: center;
    gap: 12px;
}

.auth-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    padding: 10px 20px;
    border-radius: 25px;
    transition: all 0.3s ease;
    color: #6b7280;
    border: 1px solid rgba(102, 126, 234, 0.3);
}

.auth-link:hover {
    transform: translateY(-1px);
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-color: rgba(102, 126, 234, 0.5);
}

.auth-link.active-auth {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    border-color: transparent;
}

.auth-link.active-auth:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
}

/* Enhanced Search Button */
.search-btn {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
    border: 2px solid rgba(102, 126, 234, 0.2);
    padding: 12px 16px;
    border-radius: 16px;
    cursor: pointer;
    color: #667eea;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    font-weight: 500;
}

.search-btn:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1));
    border-color: rgba(102, 126, 234, 0.4);
    color: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
}

.search-btn.search-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.search-btn-content {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 2;
}

.search-icon {
    width: 18px;
    height: 18px;
    transition: transform 0.3s ease;
}

.search-btn:hover .search-icon {
    transform: scale(1.1);
}

.search-text {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.desktop-search-text {
    display: inline;
}

.search-ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.search-btn:active .search-ripple {
    width: 300px;
    height: 300px;
}



/* Cart Button */
.cart-btn {
    background: transparent;
    border: 2px solid rgba(102, 126, 234, 0.2);
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    color: #374151;
    transition: all 0.3s ease;
    position: relative;
}

.cart-btn:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-color: rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
}

.cart-btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.cart-icon {
    width: 20px;
    height: 20px;
}

.cart-section {
    position: relative;
}

.cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    animation: bounce 0.6s ease infinite alternate;
}

@keyframes bounce {
    to {
        transform: scale(1.1);
    }
}

/* Mobile Toggle */
.menu-toggle {
    display: none;
    flex-direction: column;
    gap: 3px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
}

.menu-toggle span {
    width: 20px;
    height: 2px;
    background: #374151;
    border-radius: 1px;
    transition: all 0.3s ease;
}

/* Mobile Navigation */
.mobile-nav {
    display: flex;
    flex-direction: column;
    background: white;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 999;
    padding: 24px 20px;
    animation: slideDown 0.3s ease;
}

.mobile-nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.mobile-nav-list li {
    margin-bottom: 8px;
}

.mobile-nav-link {
    text-decoration: none;
    font-size: 16px;
    color: #374151;
    font-weight: 500;
    display: block;
    padding: 12px 16px;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
    color: #667eea;
    font-weight: 600;
    transform: translateX(4px);
}

/* Mobile Auth Section */
.mobile-auth-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Mobile User Card */
.mobile-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
    padding: 16px;
    border-radius: 16px;
    margin-bottom: 12px;
    border: 1px solid rgba(102, 126, 234, 0.2);
}

.mobile-user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.mobile-user-initial {
    color: white;
    font-weight: 700;
    font-size: 20px;
}

.mobile-user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mobile-user-greeting {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

.mobile-user-name {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
}

.mobile-logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
    font-weight: 600;
    color: #dc2626;
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.2);
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.mobile-logout-btn:hover {
    background: rgba(220, 38, 38, 0.15);
    border-color: rgba(220, 38, 38, 0.3);
    transform: translateY(-1px);
}

.mobile-logout-icon {
    width: 18px;
    height: 18px;
}

/* Mobile Auth Links (for non-logged in users) */
.mobile-auth-link {
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    display: block;
    padding: 12px 16px;
    border-radius: 12px;
    transition: all 0.3s ease;
    margin-bottom: 8px;
    text-align: center;
    color: #667eea;
    border: 2px solid #667eea;
}

.mobile-auth-link:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
}

.mobile-auth-link.active-mobile-auth {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: 2px solid transparent;
}

.mobile-auth-link.active-mobile-auth:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Search Overlay */
.search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
    cursor: pointer;
}

.search-container {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
    display: flex;
    gap: 16px;
    min-width: 400px;
    animation: slideUp 0.3s ease;
    cursor: default;
}

.search-input {
    flex: 1;
    padding: 14px 18px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.3s ease;
}

.search-input:focus {
    border-color: #667eea;
}

.search-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    /* giống height của input */
    padding: 0 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s ease;
}



.search-submit:hover {
    transform: translateY(-2px);
}

/* Responsive Classes */
.desktop-only {
    display: flex;
}

.mobile-only {
    display: none;
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive Design */
@media (max-width: 1024px) {
    .nav {
        gap: 32px;
    }

    .header-actions {
        gap: 20px;
    }
}

@media (max-width: 968px) {
    .nav-section {
        display: none;
    }

    .header-actions {
        gap: 16px;
    }

    .auth-section {
        border-right: none;
        padding-right: 0;
    }

    .user-info {
        padding: 10px 12px;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
    }

    .user-initial {
        font-size: 14px;
    }

    .logout-btn {
        padding: 6px 10px;
        font-size: 11px;
    }

    .logout-icon {
        width: 12px;
        height: 12px;
    }
}

@media (max-width: 768px) {
    .desktop-only {
        display: none;
    }

    .mobile-only {
        display: flex;
    }

    .header-content {
        padding: 16px 0;
    }

    .tagline {
        display: none;
    }

    .logo {
        font-size: 24px;
    }

    .header-actions {
        gap: 12px;
    }

    .search-container {
        margin: 20px;
        min-width: auto;
        width: 100%;
        max-width: 410px;
    }
}

@media (max-width: 480px) {
    .container {
        padding: 0 15px;
    }

    .action-buttons {
        gap: 8px;
    }

    .search-container {
        flex-direction: column;
        padding: 30px 20px;
    }

    .logo {
        font-size: 20px;
    }

    .tagline {
        margin-left: 48px;
    }

    .mobile-user-card {
        padding: 12px;
    }

    .mobile-user-avatar {
        width: 40px;
        height: 40px;
    }

    .mobile-user-initial {
        font-size: 18px;
    }
}

.suggestion-tag {
    background: rgba(102, 126, 234, 0.08);
    border-radius: 12px;
    padding: 6px 12px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
    display: inline-block;
    margin: 4px;
}

.suggestion-tag:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
}

.search-input-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    flex-shrink: 0;
}

.search-input-container {
    display: flex;
    align-items: center;
    /* Cái này sẽ align theo Y */
    gap: 12px;
}

.search-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.search-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
}


.search-close {
    background: rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
    color: #667eea;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    backdrop-filter: blur(10px);
}

.search-close:hover {
    background: rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.4);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.search-close svg {
    width: 22px;
    height: 22px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* User dropdown */
.user-dropdown {
  position: absolute;
  top: 100%;
  margin-top: 12px;
  right: 0;
  background: white;
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  min-width: 180px;
  animation: fadeSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  z-index: 999;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.user-info {
  position: relative;
  cursor: pointer;
}

.user-info:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.08));
  transition: background 0.3s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 14px 18px;
  background: transparent;
  border: none;
  outline: none;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
  transition: width 0.3s ease;
  z-index: 0;
}

.dropdown-item:hover::before {
  width: 100%;
}

.dropdown-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}


.dropdown-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  z-index: 1;
  position: relative;
}

.dropdown-item:hover .dropdown-icon {
  transform: scale(1.1);
}

.dropdown-item span {
  z-index: 1;
  position: relative;
}

.dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
  margin: 4px 0;
}

.logout-item {
  color: #dc2626;
}

.logout-item::before {
  background: linear-gradient(90deg, rgba(220, 38, 38, 0.1), transparent);
}

.logout-item:hover {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(220, 38, 38, 0.05));
  color: #b91c1c;
}

.logout-item:hover::before {
  background: linear-gradient(90deg, rgba(220, 38, 38, 0.15), transparent);
}


/* Cập nhật search button cho mobile */
@media (max-width: 768px) {
    .search-btn {
        padding: 10px;
        border-radius: 12px;
        min-width: 44px;
        /* Đảm bảo touch target đủ lớn */
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .search-icon {
        width: 20px;
        height: 20px;
    }

    .desktop-search-text {
        display: none;
        /* Ẩn text "Search" trên mobile */
    }
}

/* Tối ưu search overlay cho mobile */
@media (max-width: 768px) {
    .search-overlay {
        padding: 20px;
        align-items: flex-start;
        padding-top: 60px;
        /* Đẩy xuống dưới header */
    }

    .search-container {
        width: 100%;
        max-width: none;
        padding: 24px 20px;
        margin: 0;
        border-radius: 16px;
    }

    .search-header {
        margin-bottom: 20px;
        padding-bottom: 12px;
    }

    .search-title {
        font-size: 20px;
    }

    .search-close {
        width: 40px;
        height: 40px;
        padding: 8px;
    }

    .search-close:hover {
        background: rgba(102, 126, 234, 0.2);
    }

    .search-close svg {
        width: 20px;
        height: 20px;
    }
}

/* Tối ưu input container cho mobile */
@media (max-width: 480px) {
    .search-input-container {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .search-input {
        padding: 16px;
        font-size: 16px;
        /* Tránh zoom trên iOS */
        border-radius: 12px;
    }

    .search-submit {
        width: 100%;
        height: 48px;
        gap: 8px;
        justify-content: center;
    }

    .search-submit-icon {
        width: 16px;
        height: 16px;
    }

    .search-suggestions {
        margin-top: 20px;
    }

    .suggestion-label {
        display: block;
        margin-bottom: 12px;
        font-weight: 500;
        color: #6b7280;
    }

    .suggestion-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .suggestion-tag {
        padding: 8px 12px;
        font-size: 14px;
        margin: 0;
    }

    .search-title {
        font-size: 18px;
    }

    .search-close {
        width: 36px;
        height: 36px;
        padding: 6px;
    }

    .search-close svg {
        width: 18px;
        height: 18px;
    }
}
</style>