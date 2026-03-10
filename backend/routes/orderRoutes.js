// backend/routes/orderRoutes.js (Sửa lại để map với model cũ)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shipping, tax, total, note } = req.body;
    
    // Validate stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${item.name}. Only ${product.stock} available.` 
        });
      }
    }
    
    // Create order với structure cũ
    const order = await Order.create({
      name: shippingAddress.fullName,
      phone: shippingAddress.phone,
      email: req.user.email, // Lấy từ user đang login
      address: `${shippingAddress.address}, ${shippingAddress.city}${shippingAddress.zipCode ? ', ' + shippingAddress.zipCode : ''}`,
      paymentMethod: paymentMethod === 'cash' ? 'COD' : paymentMethod, // Map cash -> COD
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl
      })),
      subtotal,
      shipping,
      tax,
      total,
      note
    });
    
    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: err.message || 'Failed to create order' });
  }
});

// Get user orders (cần thêm userId vào Order model hoặc query bằng email)
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      email: req.user.email 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Cancel order
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      email: req.user.email
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ❌ Không cho hủy nếu đã thanh toán hoặc đã hủy
    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: 'This order cannot be cancelled'
      });
    }

    // ✅ Hoàn lại stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    // ✅ Update status
    order.status = 'Cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});


module.exports = router;