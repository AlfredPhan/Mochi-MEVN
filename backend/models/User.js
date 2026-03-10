// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: { // ⭐ Thêm field này
    type: String,
    default: '',
    trim: true
  },
  address: { // ⭐ Thêm field này
    type: String,
    default: '',
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
  type: String,
  default: '', // URL ảnh
},

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);