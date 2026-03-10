<template>
  <div class="admin-products">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">📦</span>
        Product Management
      </h1>
      <p class="page-subtitle">Manage your store products efficiently</p>
    </div>

    <!-- Add / Edit Form Card -->
    <div class="form-card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="card-icon">{{ editingProduct ? '✏️' : '➕' }}</span>
          {{ editingProduct ? "Edit Product" : "Add New Product" }}
        </h2>
      </div>
      
      <form @submit.prevent="saveProduct" class="product-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Product Name</label>
            <input 
              id="name"
              v-model="form.name" 
              type="text" 
              placeholder="Enter product name" 
              required 
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="flavor">Flavor</label>
            <input 
              id="flavor"
              v-model="form.flavor" 
              type="text" 
              placeholder="Enter flavor" 
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="price">Price ($)</label>
            <input 
              id="price"
              v-model.number="form.price" 
              type="number" 
              placeholder="0.00" 
              required 
              class="form-input"
              step="0.01"
            />
          </div>

          <div class="form-group">
            <label for="stock">Stock Quantity</label>
            <input 
              id="stock"
              v-model.number="form.stock" 
              type="number" 
              placeholder="0" 
              class="form-input"
            />
          </div>

          <div class="form-group full-width">
            <label for="description">Description</label>
            <input 
              id="description"
              v-model="form.description" 
              type="text" 
              placeholder="Enter product description" 
              class="form-input"
            />
          </div>

          <div class="form-group full-width">
            <label for="imageUrl">Image URL</label>
            <input 
              id="imageUrl"
              v-model="form.imageUrl" 
              type="url" 
              placeholder="https://example.com/image.jpg" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <span>{{ editingProduct ? "Update Product" : "Add Product" }}</span>
          </button>
          <button 
            v-if="editingProduct" 
            type="button" 
            @click="cancelEdit" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Products Table Card -->
    <div class="table-card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="card-icon">📋</span>
          Products List
          <span class="products-count">({{ products.length }} items)</span>
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading products...</p>
      </div>

      <!-- Products Table -->
      <div v-else-if="products.length > 0" class="table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Flavor</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in products" :key="product._id" class="product-row">
              <td class="index-cell">{{ index + 1 }}</td>
              <td class="image-cell">
                <div class="product-image">
                  <img 
                    v-if="product.imageUrl" 
                    :src="product.imageUrl" 
                    :alt="product.name"
                    class="product-thumb"
                    @error="handleImageError"
                  />
                  <div v-else class="no-image">📷</div>
                </div>
              </td>
              <td class="name-cell">
                <div class="product-name">{{ product.name }}</div>
              </td>
              <td class="description-cell">
                <div class="product-description">{{ product.description || '-' }}</div>
              </td>
              <td class="flavor-cell">
                <span class="flavor-tag">{{ product.flavor || '-' }}</span>
              </td>
              <td class="price-cell">
                <div class="price">${{ product.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
              </td>
              <td class="stock-cell">
                <span class="stock-badge" :class="getStockStatus(product.stock)">
                  {{ product.stock }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button class="btn-action btn-edit" @click="editProduct(product)" title="Edit">
                    ✏️
                  </button>
                  <button class="btn-action btn-delete" @click="deleteProduct(product._id)" title="Delete">
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
        <div class="empty-icon">📦</div>
        <h3>No Products Found</h3>
        <p>Start by adding your first product to the inventory.</p>
      </div>
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
      <p>Are you sure you want to delete this product?</p>
      <div class="warning-info">
        <div class="warning-item">
          <strong>Product:</strong> {{ productToDelete?.name }}
        </div>
        <div class="warning-item">
          <strong>Price:</strong> ${{ productToDelete?.price }}
        </div>
      </div>
      <div class="warning-note">
        <strong>Warning:</strong> This action cannot be undone. The product will be permanently removed.
      </div>
    </div>
    
    <div class="modal-footer">
      <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
      <button @click="confirmDelete" class="btn btn-danger">Delete Product</button>
    </div>
  </div>
</div>

</template>

<script setup>
import { ref, onMounted, inject } from 'vue'

const products = ref([])
const loading = ref(true)
const showToast = inject('showToast')
const showDeleteModal = ref(false)
const productToDelete = ref(null)


// Form state
const form = ref({ name: '', description: '', flavor: '', price: 0, imageUrl: '', stock: 0 })
const editingProduct = ref(null)

// Load products
const fetchProducts = async () => {
  try {
    const res = await fetch('https://mochi-mevn.onrender.com/api/admin/products', { credentials: 'include' })
    const data = await res.json()
    products.value = data
  } catch (err) {
    console.error('Error fetching products:', err)
    showToast('Failed to load products', 'error')
  } finally {
    loading.value = false
  }
}

// Save (Add or Update)
const saveProduct = async () => {
  try {
    const url = editingProduct.value
      ? `https://mochi-mevn.onrender.com/api/admin/products/${editingProduct.value._id}`
      : 'https://mochi-mevn.onrender.com/api/admin/products'
    const method = editingProduct.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form.value)
    })

    const data = await res.json()

    if (res.ok) {
      if (editingProduct.value) {
        // Update product in list
        const idx = products.value.findIndex(p => p._id === editingProduct.value._id)
        if (idx !== -1) products.value[idx] = data
        showToast('Product updated successfully!', 'success')
      } else {
        products.value.unshift(data) // add new product
        showToast('Product added successfully!', 'success')
      }
      resetForm()
    } else {
      showToast(data.message || 'Failed to save product', 'error')
    }
  } catch (err) {
    console.error('Error saving product:', err)
    showToast('Server error when saving', 'error')
  }
}

// Edit mode
const editProduct = (product) => {
  editingProduct.value = product
  form.value = { ...product }
}

// Cancel edit
const cancelEdit = () => {
  resetForm()
}

// Reset form
const resetForm = () => {
  editingProduct.value = null
  form.value = { name: '', description: '', flavor: '', price: 0, imageUrl: '', stock: 0 }
}

// Delete product (chỉ mở modal, chưa xoá)
const deleteProduct = (id) => {
  const product = products.value.find(p => p._id === id)
  productToDelete.value = product
  showDeleteModal.value = true
}

// Xác nhận xoá
const confirmDelete = async () => {
  try {
    const res = await fetch(`https://mochi-mevn.onrender.com/api/admin/products/${productToDelete.value._id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    const data = await res.json()

    if (res.ok) {
      products.value = products.value.filter(p => p._id !== productToDelete.value._id)
      showToast('Product deleted successfully!', 'success')
    } else {
      showToast(data.message || 'Failed to delete product', 'error')
    }
  } catch (err) {
    console.error('Error deleting product:', err)
    showToast('Server error when deleting', 'error')
  } finally {
    cancelDelete()
  }
}

// Huỷ xoá
const cancelDelete = () => {
  showDeleteModal.value = false
  productToDelete.value = null
}

// Get stock status for styling
const getStockStatus = (stock) => {
  if (stock === 0) return 'out-of-stock'
  if (stock < 10) return 'low-stock'
  return 'in-stock'
}

// Handle image error
const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextSibling.style.display = 'flex'
}

onMounted(fetchProducts)
</script>

<style scoped>
.admin-products {
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

/* Cards */
.form-card, .table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  margin-bottom: 24px;
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

.products-count {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 400;
}

/* Form */
.product-form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
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

.products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.products-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.products-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.product-row:hover {
  background: #f8fafc;
}

/* Table Cells */
.index-cell {
  width: 50px;
  text-align: center;
  color: #64748b;
  font-weight: 500;
}

.image-cell {
  width: 80px;
}

.product-image {
  width: 60px;
  height: 60px;
  position: relative;
}

.product-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.no-image {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #9ca3af;
}

.product-name {
  font-weight: 600;
  color: #1a202c;
}

.product-description {
  color: #64748b;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flavor-tag {
  background: #ddd6fe;
  color: #7c3aed;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.price {
  font-weight: 600;
  color: #059669;
  font-size: 1rem;
}

.stock-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
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
  color: #991b1b;
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
  font-size: 0.9rem;
}

.btn-edit {
  background: #fef3c7;
  color: #92400e;
}

.btn-edit:hover {
  background: #fde68a;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
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

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.6rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
  
  .products-table {
    font-size: 0.8rem;
  }
  
  .product-description {
    max-width: 120px;
  }
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

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
  }
}

</style>