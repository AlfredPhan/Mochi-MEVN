// routes/authRoute.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');



// ✅ TEST ROUTE
router.get('/test', (req, res) => {
  res.send('✅ Auth route working!');
});

// REGISTER
router.post('/register', authController.register);

// LOGIN
router.post('/login', authController.login);

// FORGOT PASSWORD
router.post('/forgot-password', authController.forgotPassword);

// RESET PASSWORD
router.post('/reset-password/:token', authController.resetPassword);


// GET CURRENT USER (dành cho frontend lấy thông tin user sau khi login)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GOOGLE LOGIN
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login`, session: true }),
  (req, res) => {
    const token = jwt.sign(
      { 
        userId: req.user._id, 
        name: req.user.name,
        role: req.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

    // ✅ Gửi tới TẤT CẢ origins được phép
    const allowedOrigins = process.env.CLIENT_URLS.split(',');
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              const allowedOrigins = ${JSON.stringify(allowedOrigins)};
              
              // Gửi message tới tất cả origins
              allowedOrigins.forEach(origin => {
                try {
                  window.opener.postMessage(
                    { type: 'google-login-success' }, 
                    origin
                  );
                } catch (e) {
                  console.log('Failed to send to:', origin);
                }
              });
              
              setTimeout(() => {
                window.close();
              }, 500);
            } else {
              window.location.href = '${process.env.CLIENT_URL}';
            }
          </script>
        </body>
      </html>
    `);
  }
);


// routes/authRoute.js

router.get('/logout', (req, res) => {
  res.clearCookie('token', {
  httpOnly: true,
  secure: true,
  sameSite: 'None'
});
  
  res.json({ message: 'Logged out' });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out successfully' })
})



module.exports = router;
