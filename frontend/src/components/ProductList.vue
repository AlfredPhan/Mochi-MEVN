<template>
    <section class="product-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Featured Products</h2>
                <p class="section-subtitle">Discover our most popular items</p>
                <div v-if="route.query.search" class="search-info">
                    <p>
                        Search results for: <strong>"{{ route.query.search }}"</strong>
                        ({{ products.length }} {{ products.length === 1 ? 'product' : 'products' }} found)
                    </p>
                    <button @click="clearSearch" class="clear-search-btn">Clear Search</button>
                </div>


            </div>

            <!-- <div class="product-grid"> -->
            <TransitionGroup name="fade-slide" tag="div" class="product-grid">
                <div class="product-card" v-for="item in visibleProducts" :key="item._id">
                    <router-link :to="`/product/${item._id}`" class="card-image" style="text-decoration: none;">
                        <img :src="item.imageUrl" :alt="item.name" loading="lazy" />
                        <div class="image-overlay">
                            <button class="quick-view-btn">View Details</button>
                        </div>
                    </router-link>


                    <div class="card-content">
                        <h3 class="product-name">{{ item.name }}</h3>
                        <p class="product-description" v-if="item.description">{{ item.description }}</p>
                        <div class="product-flavor" v-if="item.flavor">
                            <span class="flavor-badge">{{ item.flavor }}</span>
                        </div>

                        <div class="price-section">
                            <span class="current-price">{{ formatPrice(item.price) }}$</span>
                        </div>

                        <div class="stock-info">
                            <span class="stock-badge" :class="getStockClass(item.stock)">
                                {{ getStockText(item.stock) }}
                            </span>
                        </div>

                        <button class="add-btn" @click="addToCart(item, $event)" :disabled="item.stock === 0">
                            <svg class="cart-icon" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16 5 16H17M17 13V16M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                            {{ item.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
                        </button>
                    </div>
                </div>
            </TransitionGroup>
            <!-- </div> -->

            <div v-if="products.length === 0 && !loading" class="no-results">
                No products found.
            </div>


            <div class="load-more-section" v-if="visibleCount < products.length">
                <button class="load-more-btn" @click="loadMore" :disabled="loadingMore">
                    <svg v-if="loadingMore" class="loading-spinner" viewBox="0 0 24 24">
                        <!-- spinner icon -->
                    </svg>
                    {{ loadingMore ? 'Loading...' : 'Load More Products' }}
                </button>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, inject, computed, TransitionGroup, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()



// Danh sách sản phẩm
const products = ref([])
const loading = ref(false)


// Inject từ App.vue (cần provide ở App hoặc Layout)
const cart = inject('cart')   // hàm thêm sản phẩm vào cart
const cartItems = inject('cartItems')             // ref số lượng trong cart

const visibleCount = ref(6)       // Số sản phẩm hiển thị ban đầu
const perPage = 4                 // Mỗi lần load thêm

const loadingMore = ref(false)

const showToast = inject('showToast')



const loadMore = async () => {
    loadingMore.value = true
    // Giả lập delay để thấy loading effect
    await new Promise(resolve => setTimeout(resolve, 500))
    visibleCount.value += perPage
    loadingMore.value = false
}

const visibleProducts = computed(() => {
    return products.value.slice(0, visibleCount.value)
})

const clearSearch = () => {
    router.push({ path: '/products' }) // Clear search param
}



// Hàm thêm vào giỏ hàng + hiệu ứng bay
// Thêm vào giỏ
const addToCart = (product, event) => {
  const currentInCart = cartItems.value.find(i => i._id === product._id)?.quantity || 0

  if (currentInCart >= product.stock) {
    showToast?.(`Only ${product.stock} "${product.name}" left in stock`, 'error')
    return
  }

  cart.addToCart(product)
  animateToCart(event.currentTarget.closest('.product-card').querySelector('img'))

  showToast?.(`${product.name} has been added to your cart`, 'success')
}



// Animation bay vào icon giỏ hàng
const animateToCart = (imgEl) => {
    const clone = imgEl.cloneNode(true)
    const rect = imgEl.getBoundingClientRect()
    const cart = document.querySelector('.cart-btn')
    const cartRect = cart.getBoundingClientRect()

    // Gắn clone ảnh vào body
    clone.style.position = 'fixed'
    clone.style.left = `${rect.left}px`
    clone.style.top = `${rect.top}px`
    clone.style.width = `${rect.width}px`
    clone.style.height = `${rect.height}px`
    clone.style.zIndex = 9999
    clone.style.transition = 'all 0.8s ease-in-out'
    clone.style.borderRadius = '12px'
    clone.style.pointerEvents = 'none'

    document.body.appendChild(clone)

    // Tính vị trí trung tâm của icon cart
    const targetX = cartRect.left + cartRect.width / 2 - rect.width / 2
    const targetY = cartRect.top + cartRect.height / 2 - rect.height / 2

    // Bắt đầu animation
    requestAnimationFrame(() => {
        clone.style.left = `${targetX}px`
        clone.style.top = `${targetY}px`
        clone.style.opacity = '0'
        clone.style.transform = 'scale(0.3)'
    })

    // Xoá clone sau animation
    setTimeout(() => {
        document.body.removeChild(clone)
    }, 800)
}

// API
const fetchProducts = async () => {
    loading.value = true

    // console.log('Calling fetchProducts with search:', route.query.search)
    try {
        let url = 'https://mochi-mevn.onrender.com/api/products'

        // Nếu có search param → thêm vào URL
        if (route.query.search) {
            url += `?search=${encodeURIComponent(route.query.search)}`
        }

        const res = await fetch(url)
        const data = await res.json()
        products.value = data
    } catch (error) {
        console.error('Lỗi khi gọi API:', error)
    } finally {
        loading.value = false
    }
}


// Format giá tiền
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
}

// Xử lý tồn kho
const getStockClass = (stock) => {
    if (stock === 0) return 'out-of-stock'
    if (stock <= 5) return 'low-stock'
    return 'in-stock'
}

const getStockText = (stock) => {
    if (stock === 0) return 'Out of stock';
    if (stock <= 5) return `${stock} items left`;
    return 'In stock';
}

// Hiện thông báo đơn giản
const showNotification = (message) => {
    const toast = document.createElement('div')
    toast.className = 'custom-toast'
    toast.innerText = message

    document.getElementById('toast-container').appendChild(toast)

    setTimeout(() => {
        toast.classList.add('show')
    }, 10)

    // Tự động xoá sau 3s
    setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => toast.remove(), 300)
    }, 1500)
}

// Khi trang load
onMounted(fetchProducts)

watch(
    () => route.query.search,
    () => {
        fetchProducts()
    },
    { immediate: true }
)

</script>

<style scoped>
.product-section {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    padding: 60px 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.section-header {
    text-align: center;
    margin-bottom: 50px;
}

.section-title {
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
}

.section-subtitle {
    font-size: clamp(14px, 3vw, 18px);
    color: #6b7280;
    font-weight: 400;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    align-items: stretch;
    margin-bottom: 50px;
}

.product-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    position: relative;
    height: 100%;
    /* Thêm này để card fill full height */
    display: flex;
    flex-direction: column;
}

.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
}

.card-image {
    position: relative;
    overflow: hidden;
    height: 240px;
    background: #f8f9fa;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-card:hover .card-image img {
    transform: scale(1.05);
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.product-card:hover .image-overlay {
    opacity: 1;
}

.quick-view-btn {
    background: white;
    color: #667eea;
    border: none;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transform: translateY(20px);
    transition: transform 0.3s ease;
}

.product-card:hover .quick-view-btn {
    transform: translateY(0);
}

.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
}

.product-name {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
}

.product-description {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
    min-height: 40px;
}

.product-flavor {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.flavor-badge {
    display: inline-block;
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 15px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.price-section {
    display: flex;
    align-items: center;
    gap: 8px;
}

.current-price {
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stock-info {
    margin-bottom: 4px;
}

.stock-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.stock-badge.in-stock {
    background: #dcfce7;
    color: #166534;
}

.stock-badge.low-stock {
    background: #fef3c7;
    color: #92400e;
}

.stock-badge.out-of-stock {
    background: #fee2e2;
    color: #dc2626;
}

.add-btn {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    margin-top: auto;
}

.add-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.add-btn:active:not(:disabled) {
    transform: translateY(0);
}

.add-btn:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
}

.cart-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

.load-more-section {
    text-align: center;
    padding-top: 20px;
}

.load-more-btn {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
    padding: 14px 28px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.load-more-btn:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25);
}

/* Responsive design */
@media (max-width: 1024px) {
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 20px;
    }
}

@media (max-width: 768px) {
    .product-section {
        padding: 40px 0;
    }

    .container {
        padding: 0 16px;
    }

    .section-header {
        margin-bottom: 30px;
    }

    .product-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }

    .card-image {
        height: 180px;
    }

    .card-content {
        padding: 16px;
        gap: 10px;
    }

    .product-name {
        font-size: 16px;
    }

    .current-price {
        font-size: 18px;
    }

    .add-btn {
        padding: 10px 12px;
        font-size: 13px;
    }

    .cart-icon {
        width: 14px;
        height: 14px;
    }
}

@media (max-width: 480px) {
    .container {
        padding: 0 12px;
    }

    .product-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .product-card {
        max-width: 340px;
        margin: 0 auto;
    }

    .card-image {
        height: 200px;
    }

    .card-content {
        padding: 16px;
    }

    .product-name {
        font-size: 16px;
    }

    .add-btn {
        padding: 12px 16px;
        font-size: 14px;
    }
}

@media (max-width: 360px) {
    .card-content {
        padding: 14px;
    }

    .add-btn {
        font-size: 13px;
        padding: 10px 14px;
    }
}

/* Loading animation */
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.loading {
    animation: pulse 2s infinite;
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}

/* Custom toast styles */
.custom-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 10000;
}

.custom-toast.show {
    transform: translateX(0);
}

@media (max-width: 480px) {
    .custom-toast {
        right: 12px;
        left: 12px;
        text-align: center;
    }
}

/* Transition animations */
.fade-slide-enter-active {
    transition: all 0.6s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}

.fade-slide-enter-to {
    opacity: 1;
    transform: translateY(0) scale(1);
}

/* Stagger animation cho multiple items */
.fade-slide-enter-active:nth-child(1) {
    transition-delay: 0.1s;
}

.fade-slide-enter-active:nth-child(2) {
    transition-delay: 0.2s;
}

.fade-slide-enter-active:nth-child(3) {
    transition-delay: 0.3s;
}

.fade-slide-enter-active:nth-child(4) {
    transition-delay: 0.4s;
}

/* Loading spinner */
.loading-spinner {
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* .product-grid-inner {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    align-items: stretch;
} */

.search-info {
    margin-bottom: 16px;
    font-size: 16px;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
}

.clear-search-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.clear-search-btn:hover {
    background: #dc2626;
}
</style>