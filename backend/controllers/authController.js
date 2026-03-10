// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Đặt biến môi trường thật sự trong .env

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    console.log("🔐 [LOGIN] API HIT!"); // 👈 Thêm dòng này
    console.log("Body:", req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Your email or password incorrect' });

    const token = jwt.sign(
  {
    userId: user._id, // ✅ đúng
    name: user.name,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);



    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false, // ❗ Cho localhost, khi deploy thì dùng true + HTTPS
        sameSite: 'Lax', // ✅ Cho phép gửi cookie trong fetch POST từ localhost khác cổng
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .status(200)
      .json({
        message: 'Login successful',
        token,
        user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      phone: user.phone || '',      // ✅ Thêm dòng này
      address: user.address || ''   // ✅ Thêm dòng này
    }
      });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 1000 * 60 * 15; // 15 phút

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiration;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`; // hoặc domain thật khi deploy

    // 👉 Gửi email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,     // từ .env
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Mochi Store" <${process.env.MAIL_USER}>`,
      to: email,
      subject: '🔐 Reset Your Mochi Store Password',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8f8f8; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <img src="https://i.postimg.cc/QxwJ86wJ/logo.webp" alt="Mochi Store" style="height: 60px; margin-bottom: 20px;" />
              <h2 style="color: #D4825A;">Reset Your Password</h2>
            </div>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your Mochi Store account password. Click the button below to reset it. This link will expire in 15 minutes.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #D4825A; color: white; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            <hr style="margin: 40px 0;" />
            <p style="font-size: 12px; color: #888;">Mochi Store • Sweetness Delivered</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Failed to send email:', error);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log('📧 Email sent:', info.response);
      return res.json({ message: 'Reset link sent to your email' });
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

