// routes/paymentRoute.js
const express = require('express');
const router = express.Router();
const stripeWebhookRoute = express.Router();
const Order = require('../models/Order');
const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');
const Product = require('../models/Product');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 🧠 Generate orderId
const generateOrderId = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MOCHI-${timestamp}-${random}`;
};

// Telegram Bot setup
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      paymentMethod,
      items,
      total,
      discountApplied
    } = req.body;

    console.log('📦 Nhận order từ client:', {
        name,
        phone,
        email,
        address,
        paymentMethod,
        items,
        total,
        discountApplied
      });

    const existingOrder = await Order.findOne({ email });
    const firstOrder = existingOrder ? false : true;
    // Nếu không phải firstOrder → discountApplied = false (ngăn client gian lận)
    const safeDiscountApplied = firstOrder ? discountApplied : false;
    const serverTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const finalTotal = safeDiscountApplied ? serverTotal * 0.9 : serverTotal;

    const newOrder = new Order({
      orderId: generateOrderId(),
      name,
      phone,
      email,
      address,
      paymentMethod,
      items,
      total: finalTotal,
      discountApplied: safeDiscountApplied,
      status: 'Pending' // ✅ thêm status mặc định
    });


    for (const item of items) {
      const product = await Product.findById(item.productId);
  
      if (!product) {
          return res.status(400).json({ message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
            message: `Only ${product.stock} "${product.name}" left in stock, but you requested ${item.quantity}!` 
        });
    }
  
      // if (product.stock < item.quantity) {
      //     return res.status(400).json({ 
      //         message: `Sản phẩm "${product.name}" chỉ còn lại ${product.stock} cái, bạn đang đặt ${item.quantity} cái!` 
      //     });
      // }
  
      // Nếu đủ stock thì trừ
      await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true }
      );
  }
  
    await newOrder.save();

    const productLines = items.map(item => `- ${item.name} x${item.quantity}: $${item.price * item.quantity}`).join('\n');

    const message = `
🎁 *Có đơn hàng mới!*

👤 *Khách hàng:* ${name}
📧 *Email:* ${email}
📱 *SĐT:* ${phone}
🏠 *Địa chỉ:* ${address}
💳 *Thanh toán:* ${paymentMethod}
🎁 *Giảm giá:* ${safeDiscountApplied  ? 'Có (-10%)' : 'Không'}
📦 *Sản phẩm:*\n${productLines}
💰 *Tổng tiền:* $${finalTotal}
📅 *Thời gian:* ${new Date().toLocaleString()}
    `;

    const emailHtml = `
  <div style="font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 40px 20px; margin: 0;">
    <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg></div>
        <div style="position: relative; z-index: 1;">
          <img src="https://yolie-patisserie.com/img/logo.png" alt="Mochi Store" style="max-height: 60px; margin-bottom: 20px; filter: brightness(0) invert(1);" />
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">Order Confirmation</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 8px 0 0 0;">Thank you for trusting Mochi Store</p>
        </div>
      </div>

      <!-- Greeting Section -->
      <div style="padding: 30px 30px 20px 30px;">
        <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Hello ${name}!</h2>
        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0;">
          We have received your order and are preparing it for shipment. Here are your order details:
        </p>
      </div>

      <!-- Order Details Section -->
      <div style="margin: 0 30px 30px 30px; background: #f8fafc; border-radius: 12px; padding: 24px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center;">
          <span style="width: 24px; height: 24px; border-radius: 50%; align-items: center; justify-content: center; margin-right: 8px; font-size: 16px;">📦</span>
          Order Information
        </h3>

        <!-- Order Items Table -->
        <div style="background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="text-align: left; padding: 16px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Product</th>
<th style="text-align: center; padding: 16px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Quantity</th>
                <th style="text-align: right; padding: 16px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr style="border-bottom: ${index === items.length - 1 ? 'none' : '1px solid #f1f5f9'};">
                  <td style="padding: 16px; color: #1e293b; font-size: 15px; font-weight: 500;">
  <div style="display: flex; align-items: center; gap: 12px;">
    <img src="${item.imageUrl}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;" />
    <span style="margin-left: 10px; margin-top: 10px;">${item.name}</span>
  </div>
</td>

                  <td style="padding: 16px; text-align: center; color: #64748b; font-size: 15px;">
                    <span style="background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-weight: 500;">${item.quantity}</span>
                  </td>
                  <td style="padding: 16px; text-align: right; color: #1e293b; font-size: 15px; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Information Section -->
      <div style="margin: 0 30px 30px 30px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center;">
          <span style="width: 24px; height: 24px; border-radius: 50%; align-items: center; justify-content: center; margin-right: 8px; font-size: 16px;">👤</span>
          Customer Information
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <div style="margin-bottom: 12px;">
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0;">${name}</p>
            </div>
            <div style="margin-bottom: 12px;">
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Email</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0;">${email}</p>
            </div>
            <div>
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0;">${phone}</p>
</div>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <div style="margin-bottom: 12px;">
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0; line-height: 1.5;">${address}</p>
            </div>
            <div>
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0;">${paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary Section -->
      <div style="margin: 0 30px 30px 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="color: #64748b; font-size: 15px;">Discount Applied: </span>
          <span style="color: ${safeDiscountApplied ? '#10b981' : '#64748b'}; font-weight: 600; font-size: 15px; margin-left: 10px;">
            ${safeDiscountApplied ? '-10%' : ' Not applied '}
          </span>
        </div>
        
        <div style="border-top: 2px solid #e2e8f0; padding-top: 16px;">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <span style="color: #1e293b; font-size: 20px; font-weight: 700;">Total Payment:</span>
    <span style="color: #10b981; font-size: 24px; font-weight: 700; margin-left: 10px; margin-right: 8px;">$${finalTotal.toFixed(2)}</span>
  </div>

  ${
    paymentMethod === 'COD'
      ? `
      <div style="margin-top: 16px; padding: 16px; background: #fefce8; border-radius: 8px; border: 1px dashed #facc15;">
        <p style="color: #b45309; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">COD Method:</p>
        <p style="color: #92400e; font-size: 14px; margin: 0;">Prepaid: $${(finalTotal * 0.5).toFixed(2)}</p>
        <p style="color: #92400e; font-size: 14px; margin: 0;">Pay on delivery: $${(finalTotal * 0.5).toFixed(2)}</p>
      </div>
      `
      : `
      <div style="margin-top: 16px; padding: 16px; background: #ecfdf5; border-radius: 8px; border: 1px dashed #10b981;">
        <p style="color: #065f46; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Stripe Payment:</p>
        <p style="color: #047857; font-size: 14px; margin: 0;">Full payment: $${finalTotal.toFixed(2)}</p>
      </div>
      `
  }
</div>

        </div>
      </div>

      <!-- Support Section -->
      <div style="margin: 0 30px 30px 30px; background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); border-radius: 12px; padding: 24px; text-align: center;">
        <h4 style="color: #92400e; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">Need Support?</h4>
        <p style="color: #92400e; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
          If you have any questions about your order, please don't hesitate to contact us via email or our fanpage.
        </p>
        <div style="display: inline-flex; gap: 12px;">
          <a href="mailto:support@mochistore.com" style="background: #ffffff; color: #92400e; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; border: 1px solid #f59e0b;">
            Support Email
          </a>
<a href="https://www.facebook.com/people/YoliePatisserie/61569133920452/?mibextid=wwXIfr&rdid=XRp65f0LmWaWkHP0&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18HyQzkneo%2F%3Fmibextid%3DwwXIfr" style="background: #ffffff; color: #92400e; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; border: 1px solid #f59e0b;">
            Fanpage
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #1e293b; padding: 30px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">
          Thank you for trusting and supporting Mochi Store!
        </p>
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          © 2024 Mochi Store. All rights reserved.
        </p>
      </div>
    </div>
  </div>
`;


    try {
      await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
    } catch (e) {
      console.warn('⚠️ Gửi Telegram thất bại:', e.message);
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"Mochi Store" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Order Confirmation from Mochi Store',
        html: emailHtml
      });
    } catch (e) {
      console.warn('⚠️ Send Email error:', e.message);
    }

    res.json({ message: 'Order successfully!', firstOrder });
  } catch (err) {
    console.error('❌ Error create-order:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/payment/create-stripe-session
router.post('/create-stripe-session', async (req, res) => {
  try {
    const { items, customerEmail, customerPhone, customerAddress, customerName, discountApplied, finalTotal } = req.body;

    const discount = discountApplied ? 0.9 : 1;

    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd', // 💵 USD vì sản phẩm của bạn đang hiển thị $
        product_data: {
          name: item.name,
          images: [item.imageUrl],
        },
        unit_amount: Math.round(item.price * discount * 100),
      },
      quantity: item.quantity,
    }));
    

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: customerEmail,
      success_url: 'http://localhost:5173/payment-success',
      cancel_url: 'http://localhost:5173/payment-cancel',
      metadata: {
        order_items: JSON.stringify(items),
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_name: customerName,
        discountApplied: String(!!discountApplied)
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error create-stripe-session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

stripeWebhookRoute.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('✅ Payment successful!', session);

      try {
        // --- 👇 CHÈN ĐOẠN NÀY NGAY ĐÂY ---
        const discountApplied = session.metadata.discountApplied === 'true';
        let items = JSON.parse(session.metadata.order_items);

        let total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (discountApplied) {
          total = total * 0.9;
        }

        // Tiếp theo là các trường lấy từ metadata (không đổi)
        const customerEmail = session.metadata.customer_email;
        const customerPhone = session.metadata.customer_phone;
        const customerAddress = session.metadata.customer_address;
        const customerName = session.metadata.customer_name;

        // --- Khi tạo order, dùng total đã discount ---
        const newOrder = new Order({
          orderId: generateOrderId(),
          name: customerName || 'Stripe Payment',
          phone: customerPhone || '',
          email: customerEmail,
          address: customerAddress || '',
          paymentMethod: 'Stripe',
          items,
          total,                  // 💡 Dùng biến total đã tính ở trên
          discountApplied,
          status: 'Paid'
        });

        // Trừ stock
        for (const item of items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
        }

        await newOrder.save();

        // Gửi Telegram
        const productLines = items.map(item => `- ${item.name} x${item.quantity}: $${item.price * item.quantity}`).join('\n');
        const message = `
💳 *ĐƠN HÀNG STRIPE (ĐÃ THANH TOÁN)*

👤 *Khách hàng:* ${customerName || 'Không có'}
📧 *Email:* ${customerEmail}
📱 *SĐT:* ${customerPhone || 'Không có'}
🏠 *Địa chỉ:* ${customerAddress || 'Không có'}

🎁 *Giảm giá:* ${discountApplied ? 'Có (-10%)' : 'Không'}

📦 *Sản phẩm:*
${productLines}

💰 *Tổng tiền:* $${total.toFixed(2)}
📅 *Thời gian:* ${new Date().toLocaleString()}
`;


        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });

        // Gửi email
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
          }
        });

        const emailHtml = `
  <div style="font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 40px 20px; margin: 0;">
    <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg></div>
        <div style="position: relative; z-index: 1;">
          <img src="https://yolie-patisserie.com/img/logo.png" alt="Mochi Store" style="max-height: 60px; margin-bottom: 20px; filter: brightness(0) invert(1);" />
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">Order Confirmation</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 8px 0 0 0;">Thank you for trusting Mochi Store</p>
        </div>
      </div>

      <!-- Greeting Section -->
      <div style="padding: 30px 30px 20px 30px;">
        <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Hello ${customerName}!</h2>
        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0;">
          We have received your order and are preparing it for shipment. Here are your order details:
        </p>
      </div>

      <!-- Order Details Section -->
      <div style="margin: 0 30px 30px 30px; background: #f8fafc; border-radius: 12px; padding: 24px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center;">
          <span style="width: 24px; height: 24px; border-radius: 50%; align-items: center; justify-content: center; margin-right: 8px; font-size: 16px;">📦</span>
          Order Information
        </h3>
        <div style="background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="text-align: left; padding: 16px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Product</th>
                <th style="text-align: center; padding: 16px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Quantity</th>
                <th style="text-align: right; padding: 16px; font-weight: 600; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr style="border-bottom: ${index === items.length - 1 ? 'none' : '1px solid #f1f5f9'};">
                  <td style="padding: 16px; color: #1e293b; font-size: 15px; font-weight: 500;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${item.imageUrl}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;" />
                      <span style="margin-left: 10px; margin-top: 10px;">${item.name}</span>
                    </div>
                  </td>
                  <td style="padding: 16px; text-align: center; color: #64748b; font-size: 15px;">
                    <span style="background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-weight: 500;">${item.quantity}</span>
                  </td>
                  <td style="padding: 16px; text-align: right; color: #1e293b; font-size: 15px; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Information Section -->
      <div style="margin: 0 30px 30px 30px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center;">
          <span style="width: 24px; height: 24px; border-radius: 50%; align-items: center; justify-content: center; margin-right: 8px; font-size: 16px;">👤</span>
          Customer Information
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <div style="margin-bottom: 12px;">
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0;">${customerName}</p>
            </div>
            <div style="margin-bottom: 12px;">
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Email</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0;">${customerEmail}</p>
            </div>
            <div>
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0;">${customerPhone}</p>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <div style="margin-bottom: 12px;">
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0; line-height: 1.5;">${customerAddress}</p>
            </div>
            <div>
              <strong style="color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</strong>
              <p style="color: #1e293b; font-size: 15px; font-weight: 500; margin: 4px 0 0 0;">Stripe</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary Section -->
      <div style="margin: 0 30px 30px 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="color: #64748b; font-size: 15px;">Discount Applied: </span>
          <span style="color: ${discountApplied ? '#10b981' : '#64748b'}; font-weight: 600; font-size: 15px; margin-left: 10px;">
            ${discountApplied ? '-10%' : ' Not applied '}
          </span>
        </div>
        <div style="border-top: 2px solid #e2e8f0; padding-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #1e293b; font-size: 20px; font-weight: 700;">Total Payment:</span>
            <span style="color: #10b981; font-size: 24px; font-weight: 700; margin-left: 10px; margin-right: 8px;">$${total.toFixed(2)}</span>
          </div>
          <div style="margin-top: 16px; padding: 16px; background: #ecfdf5; border-radius: 8px; border: 1px dashed #10b981;">
            <p style="color: #065f46; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Stripe Payment:</p>
            <p style="color: #047857; font-size: 14px; margin: 0;">Full payment: $${total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <!-- Support Section -->
      <div style="margin: 0 30px 30px 30px; background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%); border-radius: 12px; padding: 24px; text-align: center;">
        <h4 style="color: #92400e; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">Need Support?</h4>
        <p style="color: #92400e; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
          If you have any questions about your order, please don't hesitate to contact us via email or our fanpage.
        </p>
        <div style="display: inline-flex; gap: 12px;">
          <a href="mailto:support@mochistore.com" style="background: #ffffff; color: #92400e; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; border: 1px solid #f59e0b;">
            Support Email
          </a>
          <a href="https://www.facebook.com/people/YoliePatisserie/61569133920452/?mibextid=wwXIfr&rdid=XRp65f0LmWaWkHP0&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18HyQzkneo%2F%3Fmibextid%3DwwXIfr" style="background: #ffffff; color: #92400e; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; border: 1px solid #f59e0b;">
            Fanpage
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #1e293b; padding: 30px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">
          Thank you for trusting and supporting Mochi Store!
        </p>
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          © 2024 Mochi Store. All rights reserved.
        </p>
      </div>
    </div>
  </div>
`;

        await transporter.sendMail({
          from: `"Mochi Store" <${process.env.MAIL_USER}>`,
          to: customerEmail,
          subject: 'Order Confirmation from Mochi Store',
          html: emailHtml
        });

        console.log('✅ Đã lưu Order và gửi email + Telegram thành công!');
      } catch (err) {
        console.error('❌ Error processing Stripe webhook:', err.message);
      }
    }

    res.json({ received: true });
  }
);

// EXPORT CẢ 2 ROUTER RA NGOÀI
module.exports = {
  router,             // /api/payment/*
  stripeWebhookRoute  // /api/payment/webhook (chỉ cho webhook)
};
