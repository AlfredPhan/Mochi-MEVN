// routes/chatbotRoute.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const stringSimilarity = require('string-similarity');
const { askGemini, isGeminiAvailable } = require('../utils/gemini');
const ChatHistory = require('../models/ChatHistory');
const { saveChatHistory } = require('../utils/chatHistory');

function normalizeText(text = '') {
    let str = text.toLowerCase();
    str = str.replace(/[^a-zA-Z0-9\s]/g, '');
    str = str.replace(/\s+/g, ' ').trim();
    return str;
}

function isVietnamese(text = '') {
    return /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(text);
}

function polishReply(reply) {
    if (!reply) return reply;

    return reply
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
        .replace(/[✓✗]/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const faqData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/faq.json'), 'utf8')
);

// Cache Gemini status 60s
let geminiStatus = {
    available: null,
    checkedAt: 0
};

async function checkGemini() {
    const now = Date.now();

    if (
        now - geminiStatus.checkedAt < 60000 &&
        geminiStatus.available !== null
    ) {
        return geminiStatus.available;
    }

    const ok = await isGeminiAvailable();

    geminiStatus = {
        available: ok,
        checkedAt: now
    };

    return ok;
}

// ─── Optional Auth ────────────────────────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        );

        const user = await User.findById(decoded.userId).select(
            'name email role'
        );

        req.user = user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
            : null;

    } catch (err) {
        req.user = null;
    }

    next();
};

function getCartQuery(req) {
    if (req.user?._id) {
        return { userId: req.user._id };
    }

    return {
        sessionId: req.sessionID || req.ip
    };
}

// ─── Detect add-to-cart intent ────────────────────────────────────────────────
function detectAddToCartIntent(message, products = []) {
    const msg = message.toLowerCase();

    const explicitKeywords = [
        'add to cart',
        'add to my cart',
        'put in cart',
        'thêm vào giỏ',
        'thêm giúp tôi',
        'thêm cho tôi',
        'cho tôi thêm',
        'thêm vào giỏ hàng',
        'lấy cho tôi',
        'order giúp tôi',
        'đặt hàng giúp',
        'mua giúp tôi'
    ];

    if (explicitKeywords.some(kw => msg.includes(kw))) {
        return true;
    }

    const ambiguousKeywords = [
        'i want to buy',
        'i want to order',
        'i want',
        'get me',
        'buy',
        'order',
        'add',
        'tôi muốn mua',
        'cho tôi mua',
        'mua',
        'đặt',
        'thêm'
    ];

    const hasAmbiguous = ambiguousKeywords.some(kw => msg.includes(kw));

    if (!hasAmbiguous) {
        return false;
    }

    if (products.length > 0) {
        const hasProductName = products.some(product => {
            const productName = product.name.toLowerCase();
            return msg.includes(productName);
        });

        if (hasProductName) {
            return true;
        }

        const names = products.map(product => product.name.toLowerCase());
        const best = stringSimilarity.findBestMatch(msg, names);

        if (best.bestMatch.rating > 0.4) {
            return true;
        }
    }

    return false;
}

// ─── Detect checkout intent ──────────────────────────────────────────────────
function detectCheckoutIntent(message) {
    const msg = message.toLowerCase();

    const keywords = [
        'checkout',
        'check out',
        'proceed to checkout',
        'place order',
        'pay now',
        'i want to pay',
        'ready to pay',
        'ready to order',
        'i want to checkout',
        'complete order',
        'finalize order',
        'go to checkout',
        'thanh toán',
        'tiến hành thanh toán',
        'đặt hàng ngay',
        'thanh toán ngay',
        'muốn thanh toán',
        'tôi muốn thanh toán',
        'xác nhận đơn',
        'hoàn tất đơn',
        'tôi muốn đặt hàng',
        'đi đến thanh toán',
        'tiến hành đặt hàng'
    ];

    return keywords.some(kw => msg.includes(kw));
}

// ─── Build checkout reply ────────────────────────────────────────────────────
function buildCheckoutReply(cart, user, vi) {
    if (!cart || !cart.items || cart.items.length === 0) {
        return {
            reply: vi
                ? polishReply(
                    `Giỏ hàng của bạn đang **trống**.\n\nGõ **"menu"** để xem các loại bánh đang có.`
                )
                : polishReply(
                    `Your cart is **empty**.\n\nType **"menu"** to browse our cakes.`
                ),
            redirect: null,
            redirectLabel: null
        };
    }

    const total = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const count = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    let itemList = '';

    cart.items.forEach(item => {
        itemList += `• **${item.name}** × ${item.quantity} — **$${(item.price * item.quantity).toFixed(2)}**\n\n`;
    });

    if (!user) {
        return {
            reply: vi
                ? polishReply(
                    `**Giỏ hàng của bạn:**\n\n${itemList}Tổng: **$${total.toFixed(2)}** (${count} sản phẩm)\n\n---\n\nBạn cần đăng nhập để tiếp tục thanh toán.`
                )
                : polishReply(
                    `**Your cart:**\n\n${itemList}Total: **$${total.toFixed(2)}** (${count} items)\n\n---\n\nPlease log in to continue to checkout.`
                ),
            redirect: '/login?redirect=/checkout',
            redirectLabel: vi ? 'Đăng nhập để thanh toán' : 'Log in to checkout'
        };
    }

    return {
        reply: vi
            ? polishReply(
                `**Giỏ hàng của bạn:**\n\n${itemList}Tổng: **$${total.toFixed(2)}** (${count} sản phẩm)\n\nBạn có thể tiếp tục thanh toán bên dưới.`
            )
            : polishReply(
                `**Your cart:**\n\n${itemList}Total: **$${total.toFixed(2)}** (${count} items)\n\nYou can continue to checkout below.`
            ),
        redirect: '/checkout',
        redirectLabel: vi ? 'Tiếp tục thanh toán' : 'Continue to checkout'
    };
}

// ─── Extract cart intent fallback ────────────────────────────────────────────
function extractCartIntentFallback(message, products) {
    const msg = message.toLowerCase();
    const items = [];

    const numberWords = {
        một: 1,
        hai: 2,
        ba: 3,
        bốn: 4,
        năm: 5,
        sáu: 6,
        bảy: 7,
        tám: 8,
        chín: 9,
        mười: 10,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10
    };

    let quantity = 1;

    const numMatch = msg.match(/(\d+)/);

    if (numMatch) {
        quantity = parseInt(numMatch[1], 10);
    } else {
        for (const [word, number] of Object.entries(numberWords)) {
            if (msg.includes(word)) {
                quantity = number;
                break;
            }
        }
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
        quantity = 1;
    }

    for (const product of products) {
        const productName = product.name.toLowerCase();

        if (msg.includes(productName)) {
            items.push({
                productId: product._id.toString(),
                productName: product.name,
                quantity
            });
        }
    }

    if (items.length === 0 && products.length > 0) {
        const names = products.map(product => product.name.toLowerCase());
        const best = stringSimilarity.findBestMatch(msg, names);

        if (best.bestMatch.rating > 0.25) {
            const matched = products[names.indexOf(best.bestMatch.target)];

            items.push({
                productId: matched._id.toString(),
                productName: matched.name,
                quantity
            });
        }
    }

    return { items };
}

async function extractCartIntent(message, products) {
    return extractCartIntentFallback(message, products);
}

// ─── Add items to cart ───────────────────────────────────────────────────────
async function addItemsToCart(req, items) {
    const query = getCartQuery(req);

    let cart = await Cart.findOne(query);

    if (!cart) {
        cart = new Cart({
            ...query,
            items: []
        });
    }

    const results = [];

    for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product) {
            results.push({
                success: false,
                name: item.productName,
                reason: 'Product not found'
            });

            continue;
        }

        const requestedQuantity = Math.max(1, item.quantity || 1);

        const existing = cart.items.find(
            cartItem => cartItem.productId.toString() === item.productId
        );

        const currentQty = existing ? existing.quantity : 0;
        const totalQty = currentQty + requestedQuantity;

        if (totalQty > product.stock) {
            const canAdd = product.stock - currentQty;

            if (canAdd <= 0) {
                results.push({
                    success: false,
                    name: product.name,
                    reason: `Already at max stock (${product.stock} in cart)`
                });
            } else {
                results.push({
                    success: false,
                    name: product.name,
                    reason: `Only ${canAdd} more available`
                });
            }

            continue;
        }

        if (existing) {
            existing.quantity += requestedQuantity;
        } else {
            cart.items.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: requestedQuantity
            });
        }

        results.push({
            success: true,
            name: product.name,
            quantity: requestedQuantity,
            price: product.price
        });
    }

    await cart.save();

    const cartTotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const cartCount = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return {
        results,
        cartTotal,
        cartCount
    };
}

// ─── Build cart reply ────────────────────────────────────────────────────────
function buildCartReply(results, cartTotal, cartCount, vi = false) {
    const added = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);

    let reply = '';

    if (added.length > 0) {
        reply += vi ? `Đã thêm vào giỏ hàng:\n\n` : `Added to your cart:\n\n`;

        added.forEach(result => {
            reply += `**${result.name}** × ${result.quantity} — **$${(result.price * result.quantity).toFixed(2)}**\n\n`;
        });

        reply += vi
            ? `Tổng giỏ hàng: **$${cartTotal.toFixed(2)}** · ${cartCount} sản phẩm\n\nGõ **checkout** khi bạn muốn thanh toán.`
            : `Cart total: **$${cartTotal.toFixed(2)}** · ${cartCount} item${cartCount > 1 ? 's' : ''}\n\nYou can continue browsing, or type **checkout** when you're ready.`;
    }

    if (failed.length > 0) {
        if (reply) {
            reply += '\n\n---\n\n';
        }

        failed.forEach(result => {
            reply += `**${result.name}**: ${result.reason}\n\n`;
        });
    }

    if (added.length === 0 && failed.length === 0) {
        reply = vi
            ? `Tôi chưa tìm thấy sản phẩm đó.\n\nBạn có thể thử: **"Thêm 2 Chocolate Cake vào giỏ hàng"**`
            : `I couldn't find that product.\n\nTry: **"Add 2 Chocolate Cake to cart"**`;
    }

    return polishReply(reply);
}

// ─── Local reply ─────────────────────────────────────────────────────────────
function buildLocalReply(question, products) {
    const msg = question.toLowerCase();
    const vi = isVietnamese(question);

    const availableProducts = products.filter(product => product.stock > 0);
    const outOfStockProducts = products.filter(product => product.stock === 0);

    const foundByName = products.find(product => {
        return msg.includes(product.name.toLowerCase());
    });

    // Greeting
    if (/^(hi|hello|hey|xin chào|chào|alo|ơi|good morning|good afternoon|good evening)/.test(msg)) {
        return vi
            ? `Xin chào. Tôi là **Mochi Concierge** của **Mochi Cake Store**.\n\nBạn có thể hỏi về **menu**, **giá bánh**, **giao hàng**, hoặc gõ **"Thêm [tên bánh] vào giỏ hàng"** để đặt.`
            : `Hello. This is **Mochi Concierge** from **Mochi Cake Store**.\n\nYou can ask about the **menu**, **pricing**, **delivery**, or type **"Add [cake name] to cart"** to order.`;
    }

    // Menu
    if (/menu|danh sách|có những|loại bánh|các loại|list|show|xem bánh|bánh nào|what do you have|what cakes/.test(msg)) {
        let reply = vi
            ? `**Menu Mochi Cake Store:**\n\n`
            : `**Mochi Cake Store Menu:**\n\n`;

        if (availableProducts.length === 0) {
            reply += vi
                ? `Hiện tại các sản phẩm đang tạm hết hàng.`
                : `Our products are currently out of stock.`;
        } else {
            availableProducts.forEach(product => {
                reply += `**${product.name}** — **$${product.price}**\n\n`;
            });
        }

        if (outOfStockProducts.length > 0) {
            reply += `---\n\n`;

            outOfStockProducts.forEach(product => {
                reply += `~~${product.name}~~ — ${vi ? 'Hết hàng' : 'Out of stock'}\n\n`;
            });
        }

        reply += vi
            ? `Gõ **"Thêm [tên bánh] vào giỏ hàng"** để đặt.`
            : `Type **"Add [cake name] to cart"** to order.`;

        return reply;
    }

    // Specific price
    if ((/giá|price|bao nhiêu|how much|cost/.test(msg)) && foundByName) {
        const stockText = foundByName.stock > 0
            ? vi
                ? `Còn **${foundByName.stock}** sản phẩm.`
                : `**${foundByName.stock}** in stock.`
            : vi
                ? `Hiện đang hết hàng.`
                : `Currently out of stock.`;

        return vi
            ? `**${foundByName.name}** có giá **$${foundByName.price}**.\n\n${stockText}\n\nGõ **"Thêm ${foundByName.name} vào giỏ hàng"** để đặt.`
            : `**${foundByName.name}** is **$${foundByName.price}**.\n\n${stockText}\n\nType **"Add ${foundByName.name} to cart"** to order.`;
    }

    // Price list
    if (/giá|price|bao nhiêu|how much|price list/.test(msg)) {
        let reply = vi
            ? `**Bảng giá Mochi Cake Store:**\n\n`
            : `**Mochi Cake Store Price List:**\n\n`;

        products.forEach(product => {
            const stock = product.stock > 0
                ? vi ? 'Còn hàng' : 'In stock'
                : vi ? 'Hết hàng' : 'Out of stock';

            reply += `**${product.name}** — **$${product.price}** · ${stock}\n\n`;
        });

        return reply;
    }

    // Stock check
    if ((/còn hàng|in stock|available|hết hàng|out of stock/.test(msg)) && foundByName) {
        return foundByName.stock > 0
            ? vi
                ? `**${foundByName.name}** còn **${foundByName.stock}** sản phẩm.\n\nGõ **"Thêm ${foundByName.name} vào giỏ hàng"** để đặt.`
                : `**${foundByName.name}** has **${foundByName.stock}** items in stock.\n\nType **"Add ${foundByName.name} to cart"** to order.`
            : vi
                ? `**${foundByName.name}** hiện đã hết hàng.\n\nGõ **"menu"** để xem các loại khác.`
                : `**${foundByName.name}** is currently out of stock.\n\nType **"menu"** to see other cakes.`;
    }

    // Recommendation
    if (/gợi ý|recommend|suggest|không biết|nên ăn|ăn gì|chọn gì|tư vấn|muốn ăn|thèm|what should|which one|help me choose/.test(msg)) {
        if (availableProducts.length === 0) {
            return vi
                ? `Hiện tại cửa hàng đang tạm hết hàng. Bạn quay lại sau nhé.`
                : `We're currently out of stock. Please check back later.`;
        }

        const pick = availableProducts[Math.floor(Math.random() * availableProducts.length)];
        const others = availableProducts
            .filter(product => product._id.toString() !== pick._id.toString())
            .slice(0, 2);

        let reply = vi
            ? `Tôi gợi ý **${pick.name}** — **$${pick.price}**.\n\n${pick.description || 'Một lựa chọn nhẹ nhàng và dễ thưởng thức.'}\n\n`
            : `I recommend **${pick.name}** — **$${pick.price}**.\n\n${pick.description || 'A simple, easy choice to enjoy.'}\n\n`;

        if (others.length > 0) {
            reply += vi ? `Bạn cũng có thể thử:\n\n` : `You may also like:\n\n`;

            others.forEach(product => {
                reply += `**${product.name}** — **$${product.price}**\n\n`;
            });
        }

        reply += vi
            ? `Gõ **"Thêm [tên bánh] vào giỏ hàng"** để đặt.`
            : `Type **"Add [cake name] to cart"** to order.`;

        return reply;
    }

    // Flavor recommendations
    const flavorMap = [
        { patterns: /chocolate|socola|choco/, label: 'chocolate' },
        { patterns: /matcha|trà xanh|green tea/, label: 'matcha' },
        { patterns: /strawberry|dâu|berry/, label: 'strawberry' },
        { patterns: /vanilla|vani/, label: 'vanilla' },
        { patterns: /taro|khoai môn/, label: 'taro' },
        { patterns: /lemon|chanh/, label: 'lemon' }
    ];

    for (const flavor of flavorMap) {
        if (flavor.patterns.test(msg)) {
            const found = products.find(product => {
                const text = `${product.name} ${product.flavor || ''}`;
                return flavor.patterns.test(text) && product.stock > 0;
            });

            if (found) {
                return vi
                    ? `Nếu bạn thích **${flavor.label}**, tôi gợi ý **${found.name}** — **$${found.price}**.\n\nGõ **"Thêm ${found.name} vào giỏ hàng"** để đặt.`
                    : `If you like **${flavor.label}**, I recommend **${found.name}** — **$${found.price}**.\n\nType **"Add ${found.name} to cart"** to order.`;
            }

            return vi
                ? `Hiện tại chưa có bánh vị **${flavor.label}** còn hàng. Gõ **"menu"** để xem các loại đang có.`
                : `We do not currently have an available **${flavor.label}** cake. Type **"menu"** to see what is available.`;
        }
    }

    // Birthday
    if (/sinh nhật|birthday|happy birthday|mừng sinh nhật/.test(msg)) {
        const picks = availableProducts.slice(0, 3);

        if (picks.length === 0) {
            return vi
                ? `Hiện tại các mẫu bánh sinh nhật đang tạm hết hàng.`
                : `Our birthday cakes are currently out of stock.`;
        }

        let reply = vi
            ? `Cho dịp sinh nhật, bạn có thể tham khảo:\n\n`
            : `For a birthday, you may like:\n\n`;

        picks.forEach(product => {
            reply += `**${product.name}** — **$${product.price}**\n\n`;
        });

        reply += vi
            ? `Gõ **"Thêm [tên bánh] vào giỏ hàng"** để đặt.`
            : `Type **"Add [cake name] to cart"** to order.`;

        return reply;
    }

    // Opening hours
    if (/giờ|mở cửa|đóng cửa|opening|closing|hours|hoạt động|làm việc|open|close/.test(msg)) {
        return vi
            ? `**Giờ mở cửa Mochi Cake Store:**\n\nThứ 2 – Thứ 6: **7:00 AM – 9:00 PM**\n\nThứ 7 – Chủ nhật: **7:00 AM – 10:00 PM**\n\nCửa hàng mở cửa tất cả các ngày trong tuần.`
            : `**Mochi Cake Store Opening Hours:**\n\nMonday – Friday: **7:00 AM – 9:00 PM**\n\nSaturday – Sunday: **7:00 AM – 10:00 PM**\n\nWe are open every day.`;
    }

    // Address
    if (/địa chỉ|address|ở đâu|where|location|vị trí|cửa hàng|store|find you/.test(msg)) {
        return vi
            ? `**Địa chỉ Mochi Cake Store:**\n\n123 Đường Bánh Ngọt, Quận 1, TP.HCM\n\nHotline: **0398-621-402**\n\nEmail: **mochicake@gmail.com**`
            : `**Mochi Cake Store Location:**\n\n123 Banh Ngot Street, District 1, Ho Chi Minh City\n\nHotline: **0398-621-402**\n\nEmail: **mochicake@gmail.com**`;
    }

    // Contact
    if (/hotline|số điện thoại|phone|liên hệ|contact|gọi|call|email/.test(msg)) {
        return vi
            ? `**Liên hệ Mochi Cake Store:**\n\nHotline: **0398-621-402**\n\nEmail: **mochicake@gmail.com**\n\nHỗ trợ: **7:00 AM – 9:00 PM** hằng ngày.`
            : `**Contact Mochi Cake Store:**\n\nHotline: **0398-621-402**\n\nEmail: **mochicake@gmail.com**\n\nSupport hours: **7:00 AM – 9:00 PM** daily.`;
    }

    // Delivery
    if (/giao hàng|delivery|ship|vận chuyển|freeship|phí ship|shipping fee|deliver/.test(msg)) {
        return vi
            ? `**Chính sách giao hàng:**\n\nMiễn phí giao hàng cho đơn từ **$50**.\n\nThời gian giao dự kiến: **2–4 giờ** trong nội thành.\n\nHỗ trợ giao hàng trong TP.HCM.`
            : `**Delivery Policy:**\n\nFree shipping for orders over **$50**.\n\nEstimated delivery: **2–4 hours** in the city center.\n\nDelivery is available across Ho Chi Minh City.`;
    }

    // Payment
    if (/thanh toán|payment|pay|trả tiền|cod|stripe|online/.test(msg)) {
        return vi
            ? `**Phương thức thanh toán:**\n\n**COD** — Thanh toán khi nhận hàng, cần trả trước 50%.\n\n**Stripe** — Thanh toán online an toàn.\n\nKhi sẵn sàng, bạn có thể gõ **checkout**.`
            : `**Payment Methods:**\n\n**COD** — Pay on delivery, with 50% upfront required.\n\n**Stripe** — Secure online payment.\n\nWhen ready, type **checkout**.`;
    }

    // Discount
    if (/giảm giá|discount|khuyến mãi|promo|sale|coupon|voucher|ưu đãi|offer/.test(msg)) {
        return vi
            ? `**Ưu đãi hiện tại:**\n\nGiảm **10%** cho đơn hàng đầu tiên khi xác thực email.\n\nMiễn phí giao hàng cho đơn từ **$50**.`
            : `**Current Offers:**\n\n**10% off** your first order when you verify your email.\n\nFree shipping for orders over **$50**.`;
    }

    // Thanks
    if (/cảm ơn|thank|thanks|tks|ty|appreciate/.test(msg)) {
        return vi
            ? `Không có gì. Rất vui được hỗ trợ bạn.`
            : `You're welcome. Glad to help.`;
    }

    // Goodbye
    if (/bye|goodbye|tạm biệt|bai|hẹn gặp|see you|take care/.test(msg)) {
        return vi
            ? `Tạm biệt. Cảm ơn bạn đã ghé **Mochi Cake Store**.`
            : `Goodbye. Thank you for visiting **Mochi Cake Store**.`;
    }

    // About
    if (/mochi là gì|about|giới thiệu|introduce|bạn là ai|who are you|bạn tên gì|what is mochi/.test(msg)) {
        return vi
            ? `Tôi là **Mochi Concierge**, trợ lý của **Mochi Cake Store**.\n\nTôi có thể giúp bạn xem **menu**, hỏi **giá**, kiểm tra **giao hàng**, hoặc thêm bánh vào giỏ hàng qua chat.`
            : `I am **Mochi Concierge**, the assistant for **Mochi Cake Store**.\n\nI can help you browse the **menu**, check **prices**, ask about **delivery**, or add cakes to your cart through chat.`;
    }

    // Events
    if (/tiệc|party|sự kiện|event|khai trương|opening|wedding|đám cưới|corporate/.test(msg)) {
        return vi
            ? `**Đặt bánh cho sự kiện:**\n\nMochi Cake Store nhận đặt bánh cho sinh nhật, tiệc, đám cưới, kỷ niệm và sự kiện công ty.\n\nBạn có thể gọi **0398-621-402** để được tư vấn.`
            : `**Cakes for events:**\n\nMochi Cake Store accepts custom orders for birthdays, parties, weddings, anniversaries and corporate events.\n\nCall **0398-621-402** for details.`;
    }

    // Default fallback
    return vi
        ? `Tôi chưa hiểu rõ yêu cầu của bạn.\n\nBạn có thể hỏi về:\n\n**menu** — Xem danh sách bánh\n\n**giá [tên bánh]** — Hỏi giá\n\n**giao hàng** — Chính sách ship\n\n**Thêm [tên bánh] vào giỏ hàng** — Đặt mua`
        : `I did not quite catch that.\n\nYou can ask about:\n\n**menu** — See our cakes\n\n**price list** — View prices\n\n**delivery** — Shipping info\n\n**Add [cake name] to cart** — Order now`;
}

// ─── Gemini safe wrapper ─────────────────────────────────────────────────────
async function askGeminiSafe(prompt, fallbackFn) {
    const available = await checkGemini();

    console.log('Gemini available:', available);

    if (!available) {
        return fallbackFn();
    }

    try {
        const reply = await askGemini(prompt);

        if (!reply || reply.toLowerCase().startsWith('sorry, i could not')) {
            return fallbackFn();
        }

        return reply;

    } catch (err) {
        return fallbackFn();
    }
}

// ─── GET /reply ──────────────────────────────────────────────────────────────
router.get('/reply', async (req, res) => {
    const message = req.query.message?.trim();

    if (!message) {
        return res.status(400).json({
            reply: 'Please enter a question.'
        });
    }

    const messageNormalized = normalizeText(message);
    const faqKeys = Object.keys(faqData).map(key => normalizeText(key));
    const bestMatch = stringSimilarity.findBestMatch(messageNormalized, faqKeys);

    if (bestMatch.bestMatch.rating > 0.6) {
        const idx = faqKeys.indexOf(bestMatch.bestMatch.target);
        const reply = polishReply(faqData[Object.keys(faqData)[idx]]);

        return res.json({
            reply,
            cartUpdated: false
        });
    }

    try {
        const products = await Product.find({});
        const found = products.find(product => {
            return messageNormalized.includes(normalizeText(product.name));
        });

        if (
            ['price', 'how much', 'cost'].some(keyword =>
                messageNormalized.includes(keyword)
            ) &&
            found
        ) {
            const reply = polishReply(
                `The price of **${found.name}** is **$${found.price}**.`
            );

            return res.json({
                reply,
                cartUpdated: false
            });
        }

        if (
            ['available', 'in stock', 'do you have'].some(keyword =>
                messageNormalized.includes(keyword)
            ) &&
            found
        ) {
            const reply = found.stock > 0
                ? `**${found.name}** is in stock (${found.stock} items).`
                : `**${found.name}** is currently out of stock.`;

            return res.json({
                reply: polishReply(reply),
                cartUpdated: false
            });
        }

        if (
            ['thank you', 'thanks'].some(keyword =>
                messageNormalized.includes(keyword)
            )
        ) {
            return res.json({
                reply: "You're welcome.",
                cartUpdated: false
            });
        }

        return res.json({
            reply: 'Sorry, I do not have information on that yet. You can call us at **0398-621-402**.',
            cartUpdated: false
        });

    } catch (err) {
        return res.status(500).json({
            reply: 'An error occurred.'
        });
    }
});

// ─── POST /ai ────────────────────────────────────────────────────────────────
router.post('/ai', optionalAuth, async (req, res) => {
    const question = req.body.message?.trim();
    const userId = req.user?._id || null;
    const sessionId = req.sessionID || req.ip;

    if (!question) {
        return res.status(400).json({
            reply: 'Please enter a question.'
        });
    }

    try {
        await saveChatHistory(sessionId, 'user', question, userId);

        const products = await Product.find({});
        const vi = isVietnamese(question);

        // Add-to-cart intent
        if (detectAddToCartIntent(question, products)) {
            const intent = await extractCartIntent(question, products);

            if (intent.items && intent.items.length > 0) {
                const {
                    results,
                    cartTotal,
                    cartCount
                } = await addItemsToCart(req, intent.items);

                const reply = buildCartReply(results, cartTotal, cartCount, vi);
                const hasAddedItem = results.some(result => result.success);

                await saveChatHistory(sessionId, 'bot', reply, userId);

                return res.json({
                    reply,
                    cartUpdated: hasAddedItem,
                    cartCount
                });
            }

            const noMatch = vi
                ? `Tôi chưa tìm thấy sản phẩm đó.\n\nBạn có thể thử: **"Thêm [tên bánh] vào giỏ hàng"**`
                : `I couldn't find that product.\n\nTry: **"Add [cake name] to cart"**`;

            const polishedNoMatch = polishReply(noMatch);

            await saveChatHistory(sessionId, 'bot', polishedNoMatch, userId);

            return res.json({
                reply: polishedNoMatch,
                cartUpdated: false
            });
        }

        // Checkout intent
        if (detectCheckoutIntent(question)) {
            const cartQuery = getCartQuery(req);
            const cart = await Cart.findOne(cartQuery);

            const {
                reply,
                redirect,
                redirectLabel
            } = buildCheckoutReply(cart, req.user, vi);

            await saveChatHistory(sessionId, 'bot', reply, userId);

            return res.json({
                reply,
                cartUpdated: false,
                redirect,
                redirectLabel
            });
        }

        // FAQ check
        const msgNorm = normalizeText(question);
        const faqKeys = Object.keys(faqData).map(key => normalizeText(key));
        const bestMatch = stringSimilarity.findBestMatch(msgNorm, faqKeys);

        if (bestMatch.bestMatch.rating > 0.6) {
            const idx = faqKeys.indexOf(bestMatch.bestMatch.target);
            const reply = polishReply(faqData[Object.keys(faqData)[idx]]);

            await saveChatHistory(sessionId, 'bot', reply, userId);

            return res.json({
                reply,
                cartUpdated: false
            });
        }

        // Local-only answers for structured store info
        const localOnlyPatterns =
            /menu|danh sách|price list|bảng giá|giá|price|how much|bao nhiêu|còn hàng|in stock|out of stock|hết hàng|show|list|delivery|giao hàng|ship|opening|hours|mở cửa|đóng cửa|address|địa chỉ|hotline|contact|liên hệ|payment|thanh toán|discount|khuyến mãi|promo/i;

        if (localOnlyPatterns.test(question)) {
            const localReply = polishReply(buildLocalReply(question, products));

            await saveChatHistory(sessionId, 'bot', localReply, userId);

            return res.json({
                reply: localReply,
                cartUpdated: false
            });
        }

        // Gemini with local fallback
        const productList = products
            .map(product => {
                return `${product.name} ($${product.price}, stock: ${product.stock}, flavor: ${product.flavor || 'N/A'})`;
            })
            .join('; ');

        const prompt = `You are Mochi Concierge, a calm and helpful store assistant for Mochi Cake Store.

STORE INFO:
- Products: ${productList}
- Opening hours: Mon-Fri 7AM-9PM, Sat-Sun 7AM-10PM
- Address: 123 Banh Ngot Street, District 1, Ho Chi Minh City
- Hotline: 0398-621-402
- Shipping: Free over $50, 2-4 hour delivery
- Payment: COD with 50% upfront or Stripe
- First-order discount: 10% off with email verification

VOICE:
- Natural, concise, and boutique.
- No excessive excitement.
- No decorative emoji.
- Do not sound like an AI assistant.
- Do not say "as an AI".
- Avoid generic phrases like "I'm happy to help" unless it feels natural.
- Prefer short paragraphs.
- Product names in **bold**.
- Prices in **bold** with $.
- Max 120 words.
- If the user wants to order, say: type "Add [cake name] to cart".
- ${vi ? 'The user wrote in Vietnamese. Reply in Vietnamese.' : 'The user wrote in English. Reply in English.'}

USER: "${question}"`;

        const finalReply = polishReply(
            await askGeminiSafe(prompt, () => buildLocalReply(question, products))
        );

        await saveChatHistory(sessionId, 'bot', finalReply, userId);

        return res.json({
            reply: finalReply,
            cartUpdated: false
        });

    } catch (err) {
        console.error('Chatbot error:', err);

        return res.status(500).json({
            reply: 'System error, please try again later.'
        });
    }
});

// ─── Chat history by session ─────────────────────────────────────────────────
router.get('/history/:sessionId', async (req, res) => {
    try {
        const chat = await ChatHistory.findOne({
            sessionId: req.params.sessionId
        });

        return res.json({
            messages: chat?.messages || []
        });

    } catch (err) {
        return res.status(500).json({
            error: 'Failed to fetch history'
        });
    }
});

// ─── All chat histories ──────────────────────────────────────────────────────
router.get('/history', async (req, res) => {
    try {
        const chats = await ChatHistory.find({});

        return res.json({
            chats
        });

    } catch (err) {
        return res.status(500).json({
            error: 'Failed to fetch histories'
        });
    }
});

module.exports = router;