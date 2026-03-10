// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const chatbotRoute = require('./routes/chatbotRoute');
const verifyEmailRoute = require('./routes/verifyEmailRoute');
const paymentRoute = require('./routes/paymentRoute');
const adminRoute = require('./routes/adminRoute');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoute = require('./routes/cartRoute');
require('./config/passport'); // import config passport


const app = express();
const port = process.env.PORT || 5000;


const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(
  '/api/payment/webhook',
  require('./routes/paymentRoute').stripeWebhookRoute
);



const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',')
  : [];

app.use(cors({
  origin: function (origin, callback) {

    // cho phép Postman / mobile app
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }

  },
  credentials: true
}));


app.use(express.json());

app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none'
}
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/chatbot', chatbotRoute);

app.use('/api/verify-email', verifyEmailRoute);
app.use('/api/payment', paymentRoute.router);

app.use('/api/admin', adminRoute);

app.use('/api/users', userRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/cart', cartRoute);



app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Lỗi JSON:', err.message);
    return res.status(400).json({ message: 'Invalid JSON body' });
  }
  next();
});

const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const contactRoute = require('./routes/contact');
const reviewRoute = require('./routes/reviewRoute');
app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/contact', contactRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/favorites', favoriteRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/api/ping', (req, res) => {
  res.send('pong');
});


app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
});

