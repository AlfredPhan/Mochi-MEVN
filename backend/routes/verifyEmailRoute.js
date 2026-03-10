// routes/verifyEmailRoute.js
const express = require('express');
const router = express.Router();
const OtpVerification = require('../models/OtpVerification');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// POST /api/verify-email
router.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    // 1️⃣ Check nếu email đã từng mua → ko gửi OTP
    // const existingOrder = await Order.findOne({ email });
    // if (existingOrder) {
    //   return res.status(400).json({ message: 'Email này đã từng mua hàng, không được giảm giá 10%' });
    // }

    // 2️⃣ Tạo OTP mới
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // 3️⃣ Lưu OTP vào DB
    await OtpVerification.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // 4️⃣ Gửi email OTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Mochi Store" <${process.env.MAIL_USER}>`,
      to: email,
      subject: '🔐 Verify your email to get 10% off',
      html: `
  <div style="font-family: Arial; padding: 20px;">
    <h2>Hello,</h2>
    <p>You are placing an order at Mochi Store.</p>
    <p>This is your email verification code (valid for 5 minutes):</p>
    <h1 style="font-size: 32px; color: #D4825A;">${otp}</h1>
    <p>If you did not request this, please ignore this email.</p>
    <br/>
    <p>❤️ Mochi Store Team</p>
  </div>
`

    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP code has been sent to your email. Please check your email to verify.' });

  } catch (err) {
    console.error('❌ Error sending OTP:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/verify-email/confirm-otp
const Order = require('../models/Order'); // ✅ bật lại dòng này

// POST /api/verify-email/confirm-otp
router.post('/confirm-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OtpVerification.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (record.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP code has expired' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP code' });
    }

    // ✅ Xoá OTP
    await OtpVerification.deleteOne({ email });

    // ✅ Check nếu đã từng đặt hàng
    const existingOrder = await Order.findOne({ email });
    const firstOrder = !existingOrder;

    return res.json({
      message: 'OTP verification successful',
      firstOrder, // 👈 Gửi thêm cho frontend biết có được giảm không
    });
  } catch (err) {
    console.error('❌ Error verifying OTP:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

  

module.exports = router;
