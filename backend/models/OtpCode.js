// backend/models/OtpCode.js
const mongoose = require('mongoose');
const OtpCodeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  phone: { type: String, required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
module.exports = mongoose.model('OtpCode', OtpCodeSchema);
