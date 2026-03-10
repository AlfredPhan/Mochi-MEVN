// routes/adminRoute.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const adminController = require('../controllers/adminController');

// Apply middleware cho toàn bộ admin routes
router.use(isAuthenticated, isAdmin);

// Controllers
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const Review = require('../models/Review');

/**
 * 🧾 GET: Danh sách đơn hàng
 */
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

/**
 * 🔍 GET: Chi tiết đơn hàng
 */
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
});

/**
 * 🔄 PUT: Cập nhật trạng thái đơn
 */
router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatus = ['Pending', 'Paid', 'Cancelled'];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

/**
 * 📦 GET: Sản phẩm
 */
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

/**
 * POST: Add new product
 */
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message })
  }
})

/**
 * PUT: Update product
 */
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message })
  }
})

/**
 * DELETE: Xoá sản phẩm
 */
router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

/**
 * 👥 GET: Người dùng
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

/**
 * PUT: Update user role
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user role', error: err.message });
  }
});

/**
 * DELETE user
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

/**
 * 💬 GET: Chat history - FIXED: Removed duplicate middleware
 */
router.get('/chats', async (req, res) => {
  try {
    const chats = await ChatHistory.find({})
      .populate('userId', 'name email') // Populate user info
      .sort({ createdAt: -1 }); // Changed to descending order (newest first)
    res.json(chats);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

/**
 * ⭐ GET: Reviews
 */
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name avatar email') // ✅ thêm avatar + email
      .populate('productId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});


/**
 * GET: Stats
 */
router.get('/stats', adminController.getStats);

/**
 * DELETE: Review
 */
router.delete('/reviews/:id', async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
});

module.exports = router;