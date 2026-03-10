// routes/contact.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Mochi Store" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER, // gửi về admin/store email
      subject: `📩 New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 0 20px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <img src="https://i.postimg.cc/QxwJ86wJ/logo.webp" alt="Mochi Store" style="height: 60px; margin-bottom: 20px;" />
              <h2 style="color: #D4825A;">New Contact Message</h2>
            </div>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D4825A; border-radius: 8px;">
              <p style="white-space: pre-line; line-height: 1.6;">${message}</p>
            </div>
            <hr style="margin: 40px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">This message was sent from the Mochi Store website contact form.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Send Mail Error:', err);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

module.exports = router;
