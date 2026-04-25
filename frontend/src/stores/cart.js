// stores/cart.js
import { ref, computed } from 'vue'

const cart = ref([])
const cartTotal = computed(() => cart.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
const cartCount = computed(() => cart.value.reduce((sum, i) => sum + i.quantity, 0))

// ─── Sync từ DB ───────────────────────────────────────────────────────────────
const syncCartFromDB = async () => {
  try {
    const res = await fetch('/api/cart', { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    // ✅ _id luôn là productId string — dùng thống nhất ở mọi nơi
    cart.value = (data.items || []).map(item => ({
      _id: item._id || item.productId?.toString?.() || item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      stock: typeof item.stock === 'number' ? item.stock : 999
    }))
  } catch (err) {
    console.error('syncCartFromDB error:', err)
  }
}

// ─── Add to cart ──────────────────────────────────────────────────────────────
const addToCart = async (product, quantity = 1) => {
  const existing = cart.value.find(i => i._id?.toString() === product._id?.toString())
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.value.push({
      _id: product._id?.toString(),
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      stock: product.stock ?? 999
    })
  }
  try {
    await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId: product._id, quantity })
    })
    // ✅ Sync lại để lấy stock mới nhất từ DB
    await syncCartFromDB()
  } catch (err) {
    console.error('addToCart API error:', err)
    await syncCartFromDB()
  }
}

// ─── Remove from cart ─────────────────────────────────────────────────────────
const removeFromCart = async (itemId) => {
  cart.value = cart.value.filter(i => i._id?.toString() !== itemId?.toString())
  try {
    await fetch(`/api/cart/remove/${itemId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
  } catch (err) {
    console.error('removeFromCart API error:', err)
    await syncCartFromDB()
  }
}

// ─── Update quantity ──────────────────────────────────────────────────────────
const updateQuantity = async (itemId, newQty) => {
  if (newQty <= 0) { removeFromCart(itemId); return }

  const item = cart.value.find(i => i._id?.toString() === itemId?.toString())
  if (!item) return

  // ✅ Hard-block ở frontend trước khi gọi API
  if (item.stock && newQty > item.stock) return

  item.quantity = newQty

  try {
    const res = await fetch('/api/cart/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId: itemId, quantity: newQty })
    })
    if (!res.ok) {
      // Nếu API từ chối (vượt stock) → rollback
      await syncCartFromDB()
    }
  } catch (err) {
    console.error('updateQuantity API error:', err)
    await syncCartFromDB()
  }
}

// ─── Clear cart ───────────────────────────────────────────────────────────────
const clearCart = async () => {
  cart.value = []
  try {
    await fetch('/api/cart/clear', { method: 'DELETE', credentials: 'include' })
  } catch (err) {
    console.error('clearCart API error:', err)
  }
}

export function useCart() {
  return { cart, cartTotal, cartCount, syncCartFromDB, addToCart, removeFromCart, updateQuantity, clearCart }
}