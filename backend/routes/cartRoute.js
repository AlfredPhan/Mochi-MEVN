// routes/cartRoute.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Optional auth middleware (copy từ chatbotRoute)
const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) { req.user = null; return next(); }
  try {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('name email role');
    req.user = user ? { _id: user._id, name: user.name, email: user.email, role: user.role } : null;
  } catch { req.user = null; }
  next();
};

// Áp dụng optionalAuth cho tất cả routes
router.use(optionalAuth);

function getCartQuery(req) {
  if (req.user?._id) return { userId: req.user._id };
  return { sessionId: req.sessionID || req.ip };
}

function calcTotal(items = []) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

// GET /api/cart — Lấy giỏ hàng, kèm stock từ Product
router.get('/', async (req, res) => {
  try {
    const query = getCartQuery(req);
    const cart = await Cart.findOne(query);
    if (!cart || cart.items.length === 0) {
      return res.json({ items: [], total: 0 });
    }

    // ✅ Lấy stock thực tế từ Product cho mỗi item
    const productIds = cart.items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).select('_id stock');
    const stockMap = {};
    products.forEach(p => { stockMap[p._id.toString()] = p.stock; });

    const itemsWithStock = cart.items.map(item => ({
      _id: item.productId.toString(),   // ✅ _id = productId để Cart.vue dùng được
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      stock: stockMap[item.productId.toString()] ?? 999  // ✅ stock thực tế
    }));

    res.json({ items: itemsWithStock, total: calcTotal(cart.items) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/cart/add
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items in stock` });
    }

    const query = getCartQuery(req);
    let cart = await Cart.findOne(query);
    if (!cart) cart = new Cart({ ...query, items: [] });

    const existing = cart.items.find(i => i.productId.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity
      });
    }

    await cart.save();
    res.json({
      message: `Added ${quantity}x ${product.name} to cart ✓`,
      cart: { items: cart.items, total: calcTotal(cart.items) }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/cart/update
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const query = getCartQuery(req);
    const cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    } else {
      // ✅ Validate không vượt quá stock
      const product = await Product.findById(productId).select('stock');
      if (product && quantity > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} items in stock` });
      }
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ items: cart.items, total: calcTotal(cart.items) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', async (req, res) => {
  try {
    const query = getCartQuery(req);
    const cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
    await cart.save();
    res.json({ items: cart.items, total: calcTotal(cart.items) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/cart/clear
router.delete('/clear', async (req, res) => {
  try {
    const query = getCartQuery(req);
    await Cart.findOneAndDelete(query);
    res.json({ message: 'Cart cleared', items: [], total: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;