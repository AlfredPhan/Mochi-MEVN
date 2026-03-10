import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles.css'
import router from './router'
import { useCart } from './stores/cart'

const app = createApp(App)

const cartStore = useCart()

// Provide toàn bộ store
app.provide('cart', cartStore)
// Provide riêng ref giỏ hàng để dễ inject
app.provide('cartItems', cartStore.cart)

app.use(router).mount('#app')
