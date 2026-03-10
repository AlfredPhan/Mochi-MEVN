
// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { upload } = require('../config/cloudinary');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { enabled: smsEnabled, client, verifyServiceSid, otpDevMode } = require('../config/twilio');
const OtpCode = require('../models/OtpCode'); // chỉ khi dùng DEV
const emailOtpMap = new Map();


// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Kiểm tra trùng email (nếu có đổi)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
    };

    // Nếu có file upload từ Cloudinary
    if (req.file) {
      updateData.avatar = req.file.path; // Cloudinary auto trả về link public
    }

    // Cập nhật DB
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error('❌ Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Upload avatar
router.put('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    console.log("📂 File received:", req.file);
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path }, // Cloudinary url
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Utils
function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}
function isE164(phone) {
  return /^\+\d{8,15}$/.test(phone);
}
function maskPhone(p) {
  if (!p) return '';
  const tail = p.slice(-3);
  return `${p.slice(0, 3)}****${tail}`;
}

// 1) Gửi OTP SMS để đổi số điện thoại
// 1) Gửi OTP SMS để đổi số điện thoại
router.post('/phone/change/request', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !isE164(phone)) {
      return res.status(400).json({ message: 'Phone must be in E.164 format, e.g., +84901234567' });
    }

    // ✅ Ưu tiên DEV MODE trước
    if (otpDevMode) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await OtpCode.deleteMany({ userId: req.user.id, phone }); // clear cũ
      await OtpCode.create({
        userId: req.user.id,
        phone,
        codeHash: hashCode(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });
      console.log(`[DEV OTP] Phone ${phone} => Code: ${otp}`);
      return res.json({
        message: 'DEV OTP generated (check server console)',
        to: maskPhone(phone),
        provider: 'dev'
      });
    }

    // Nếu không bật DEV -> gửi thật qua Twilio
    if (smsEnabled) {
      await client.verify.v2.services(verifyServiceSid)
        .verifications
        .create({ to: phone, channel: 'sms', locale: 'vi' });
      return res.json({ message: 'OTP sent via SMS', to: maskPhone(phone), provider: 'twilio' });
    }

    return res.status(500).json({ message: 'OTP service not configured' });

  } catch (err) {
    console.error('send otp error', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});


// 2) Xác minh OTP và cập nhật số điện thoại
// 2) Xác minh OTP và cập nhật số điện thoại
router.post('/phone/change/verify', authMiddleware, async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !isE164(phone) || !code) {
      return res.status(400).json({ message: 'Phone and code are required' });
    }

    let approved = false;

    // ✅ Ưu tiên kiểm tra Dev Mode trước
    if (otpDevMode) {
      const rec = await OtpCode.findOne({ userId: req.user.id, phone }).sort({ createdAt: -1 });
      if (!rec || rec.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
      if (rec.attempts >= 5) {
        return res.status(429).json({ message: 'Too many attempts' });
      }
      if (rec.codeHash !== hashCode(code)) {
        rec.attempts += 1;
        await rec.save();
        return res.status(400).json({ message: 'Incorrect code' });
      }

      approved = true;
      await rec.deleteOne();
    }

    // Nếu không bật DEV -> dùng Twilio thật
    else if (smsEnabled) {
      const check = await client.verify.v2.services(verifyServiceSid)
        .verificationChecks
        .create({ to: phone, code: String(code) });
      approved = (check.status === 'approved');
    } 
    else {
      return res.status(500).json({ message: 'OTP service not configured' });
    }

    if (!approved) {
      return res.status(400).json({ message: 'OTP not approved' });
    }

    // Cập nhật số điện thoại & flag verified
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone, phoneVerified: true },
      { new: true }
    ).select('-password');

    res.json({ message: 'Phone updated', user });
  } catch (err) {
    console.error('verify otp error', err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Gửi OTP đến email mới
router.post('/email/change/request', authMiddleware, async (req, res) => {
  try {
     const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Sinh OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

    // Lưu vào Map (ghi đè nếu có OTP cũ)
    emailOtpMap.set(req.user.id, { otp, email, expiresAt });

    // Hẹn xoá sau 5 phút để tránh rò rỉ OTP
    setTimeout(() => {
      const rec = emailOtpMap.get(req.user.id);
      if (rec && rec.email === email) emailOtpMap.delete(req.user.id);
    }, 5 * 60 * 1000);

    // Gửi email OTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
  from: '"Mochi Store" <no-reply@mochi.com>',
  to: email,
  subject: 'Mochi Store – Email Verification OTP',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              
              <!-- Header with gradient -->
              <tr>
                <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                    Mochi Store
                  </h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">
                    Email Verification
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding:48px 32px;">
                  <p style="margin:0 0 8px;color:#333;font-size:16px;line-height:1.6;">
                    Hello <strong>${req.user.name || 'there'}</strong>,
                  </p>
                  <p style="margin:0 0 32px;color:#666;font-size:15px;line-height:1.6;">
                    You requested to verify your new email address. Please use the OTP code below:
                  </p>
                  
                  <!-- OTP Box -->
                  <div style="background:linear-gradient(135deg,#f8f9ff 0%,#f0f0ff 100%);border:2px dashed #764ba2;border-radius:12px;padding:24px;text-align:center;margin:0 0 32px;">
                    <div style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                      Your Verification Code
                    </div>
                    <div style="color:#764ba2;font-size:36px;font-weight:700;letter-spacing:8px;font-family:'Courier New',monospace;">
                      ${otp}
                    </div>
                  </div>
                  
                  <!-- Warning -->
                  <div style="background:#fff8e6;border-left:4px solid #fbbf24;padding:16px;border-radius:8px;margin:0 0 24px;">
                    <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
                      ⏱️ This code will expire in <strong>5 minutes</strong>. Please do not share this code with anyone.
                    </p>
                  </div>
                  
                  <p style="margin:0 0 8px;color:#666;font-size:14px;line-height:1.6;">
                    If you didn't request this verification, please ignore this email or contact our support team.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background:#f8f9fa;padding:32px;text-align:center;border-top:1px solid #e8e8e8;">
                  <p style="margin:0 0 8px;color:#333;font-size:14px;font-weight:600;">
                    Thank you for choosing Mochi Store! 🎉
                  </p>
                  <p style="margin:0;color:#999;font-size:13px;">
                    © ${new Date().getFullYear()} Mochi Store. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
});

    console.log(`[DEV OTP] Email ${email} => Code: ${otp}`);
    res.json({ message: 'OTP sent to email' });

  } catch (err) {
    console.error('Email OTP send error:', err);
    res.status(500).json({ message: 'Failed to send OTP email' });
  }
});

// Xác minh OTP
// Xác minh OTP email
router.post('/email/change/verify', authMiddleware, async (req, res) => {
  try {
    const { email, code } = req.body;
    const record = emailOtpMap.get(req.user.id);

    if (!record)
      return res.status(400).json({ message: 'No OTP found or expired' });

    if (Date.now() > record.expiresAt)
      return res.status(400).json({ message: 'OTP has expired, please request a new one' });

    if (record.email !== email || record.otp !== code)
      return res.status(400).json({ message: 'Invalid OTP or email mismatch' });

    // Cập nhật email vào DB
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true }
    ).select('-password');

    // Xoá OTP sau khi xác minh thành công
    emailOtpMap.delete(req.user.id);

    res.json({ message: 'Email verified successfully', user });
  } catch (err) {
    console.error('Email verify error:', err);
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});




module.exports = router;