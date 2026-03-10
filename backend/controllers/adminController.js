// backend/controllers/adminController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');
const Chat = require('../models/ChatHistory');

exports.getStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalChats = await Chat.countDocuments();

    res.json({ totalProducts, totalOrders, totalUsers,totalReviews,totalChats });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
