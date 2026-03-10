// backend/models/Order.js (Giữ nguyên structure cũ, chỉ thêm enum)
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    unique: true, 
    default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'Stripe', 'cash', 'card', 'momo', 'zalopay'], // ⭐ Thêm các method mới
    required: true 
  },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: false // 👈 để không crash order cũ
},
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number,
      price: Number,
      imageUrl: String // ⭐ Thêm field này
    }
  ],
  subtotal: { type: Number }, // ⭐ Thêm
  shipping: { type: Number, default: 0 }, // ⭐ Thêm
  tax: { type: Number, default: 0 }, // ⭐ Thêm
  total: { type: Number, required: true },
  note: { type: String }, // ⭐ Thêm
  discountApplied: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);