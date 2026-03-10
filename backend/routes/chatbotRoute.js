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

function normalizeText(text) {
    let str = text.toLowerCase();
    str = str.replace(/[^a-zA-Z0-9\s]/g, '');
    str = str.replace(/\s+/g, ' ').trim();
    return str;
}

const faqData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/faq.json'), 'utf8'));

// Cache Gemini status 60s
let geminiStatus = { available: null, checkedAt: 0 };
async function checkGemini() {
    const now = Date.now();
    if (now - geminiStatus.checkedAt < 60000 && geminiStatus.available !== null) return geminiStatus.available;
    const ok = await isGeminiAvailable();
    geminiStatus = { available: ok, checkedAt: now };
    return ok;
}

// ─── Optional Auth ────────────────────────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) { req.user = null; return next(); }
    try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('name email role');
        req.user = user ? { _id: user._id, name: user.name, email: user.email, role: user.role } : null;
    } catch (err) { req.user = null; }
    next();
};

function getCartQuery(req) {
    if (req.user?._id) return { userId: req.user._id };
    return { sessionId: req.sessionID || req.ip };
}

// ─── Detect add-to-cart intent (Vietnamese + English) ────────────────────────
function detectAddToCartIntent(message, products = []) {
    const msg = message.toLowerCase();

    // ── Explicit cart keywords (luôn tin tưởng) ──────────────────────────────
    const explicitKeywords = [
        'add to cart', 'add to my cart', 'put in cart',
        'thêm vào giỏ', 'thêm giúp tôi', 'thêm cho tôi',
        'cho tôi thêm', 'thêm vào giỏ hàng', 'lấy cho tôi',
        'order giúp tôi', 'đặt hàng giúp', 'mua giúp tôi'
    ];
    if (explicitKeywords.some(kw => msg.includes(kw))) return true;

    // ── Ambiguous keywords — chỉ tin khi kèm tên sản phẩm ───────────────────
    const ambiguousKeywords = [
        'i want to buy', 'i want to order', 'i want', 'get me',
        'buy', 'order', 'add',
        'tôi muốn mua', 'cho tôi mua', 'mua', 'đặt', 'thêm'
    ];
    const hasAmbiguous = ambiguousKeywords.some(kw => msg.includes(kw));
    if (!hasAmbiguous) return false;

    // Chỉ trigger nếu message có chứa tên sản phẩm (exact hoặc fuzzy)
    if (products.length > 0) {
        const hasProductName = products.some(p => msg.includes(p.name.toLowerCase()));
        if (hasProductName) return true;

        // Fuzzy check: nếu similarity > 0.4 với bất kỳ product nào
        const names = products.map(p => p.name.toLowerCase());
        const best = stringSimilarity.findBestMatch(msg, names);
        if (best.bestMatch.rating > 0.4) return true;
    }

    return false;
}

// ─── Detect checkout intent ───────────────────────────────────────────────────
function detectCheckoutIntent(message) {
    const msg = message.toLowerCase();
    const keywords = [
        // English
        'checkout', 'check out', 'proceed to checkout', 'place order', 'pay now',
        'i want to pay', 'ready to pay', 'ready to order', 'i want to checkout',
        'complete order', 'finalize order', 'go to checkout',
        // Vietnamese
        'thanh toán', 'tiến hành thanh toán', 'đặt hàng ngay', 'thanh toán ngay',
        'muốn thanh toán', 'tôi muốn thanh toán', 'xác nhận đơn', 'hoàn tất đơn',
        'tôi muốn đặt hàng', 'đi đến thanh toán', 'tiến hành đặt hàng'
    ];
    return keywords.some(kw => msg.includes(kw));
}

// ─── Build checkout reply ─────────────────────────────────────────────────────
function buildCheckoutReply(cart, user, vi) {
    if (!cart || cart.items.length === 0) {
        return {
            reply: vi
                ? `🛒 Giỏ hàng của bạn đang **trống**!\n\nHãy thêm sản phẩm trước nhé. Gõ **"menu"** để xem các loại bánh. 🍰`
                : `🛒 Your cart is **empty**!\n\nAdd some items first. Type **"menu"** to browse our cakes. 🍰`,
            redirect: null
        };
    }

    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    let itemList = '';
    cart.items.forEach(i => {
        itemList += `• **${i.name}** × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}\n\n`;
    });

    if (!user) {
        // Chưa đăng nhập
        return {
            reply: vi
                ? `🛒 **Giỏ hàng của bạn:**\n\n${itemList}💰 **Tổng: $${total.toFixed(2)}** (${count} sản phẩm)\n\n---\n\n⚠️ Bạn cần **đăng nhập** để tiến hành thanh toán!\n\nNhấn nút bên dưới để đăng nhập và checkout nhé.`
                : `🛒 **Your cart:**\n\n${itemList}💰 **Total: $${total.toFixed(2)}** (${count} items)\n\n---\n\n⚠️ You need to **log in** to proceed to checkout!\n\nClick the button below to login and checkout.`,
            redirect: '/login?redirect=/checkout',
            redirectLabel: vi ? 'Đăng nhập để thanh toán' : 'Login to Checkout'
        };
    }

    // Đã đăng nhập
    return {
        reply: vi
            ? `🛒 **Giỏ hàng của bạn:**\n\n${itemList}💰 **Tổng: $${total.toFixed(2)}** (${count} sản phẩm)\n\n✅ Nhấn nút bên dưới để tiến hành thanh toán!`
            : `🛒 **Your cart:**\n\n${itemList}💰 **Total: $${total.toFixed(2)}** (${count} items)\n\n✅ Click the button below to proceed to checkout!`,
        redirect: '/checkout',
        redirectLabel: vi ? 'Tiến hành thanh toán →' : 'Proceed to Checkout →'
    };
}

// ─── Fallback cart extraction ─────────────────────────────────────────────────
function extractCartIntentFallback(message, products) {
    const msg = message.toLowerCase();
    const items = [];

    const numberWords = {
        // Vietnamese
        'một': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'năm': 5,
        'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10,
        // English
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };

    let quantity = 1;
    const numMatch = msg.match(/(\d+)/);
    if (numMatch) { quantity = parseInt(numMatch[1]); }
    else { for (const [w, n] of Object.entries(numberWords)) { if (msg.includes(w)) { quantity = n; break; } } }

    for (const product of products) {
        if (msg.includes(product.name.toLowerCase())) {
            items.push({ productId: product._id.toString(), productName: product.name, quantity });
        }
    }
    if (items.length === 0) {
        const names = products.map(p => p.name.toLowerCase());
        const best = stringSimilarity.findBestMatch(msg, names);
        if (best.bestMatch.rating > 0.25) {
            const matched = products[names.indexOf(best.bestMatch.target)];
            items.push({ productId: matched._id.toString(), productName: matched.name, quantity });
        }
    }
    return { items };
}

async function extractCartIntent(message, products) {
    return extractCartIntentFallback(message, products);
}

// ─── Add to cart ──────────────────────────────────────────────────────────────
async function addItemsToCart(req, items, products) {
    const query = getCartQuery(req);
    let cart = await Cart.findOne(query);
    if (!cart) cart = new Cart({ ...query, items: [] });

    const results = [];
    for (const item of items) {
        // Lấy product mới nhất từ DB để có stock chính xác
        const Product = require('../models/Product');
        const product = await Product.findById(item.productId);
        if (!product) { results.push({ success: false, name: item.productName, reason: 'Product not found' }); continue; }

        const existing = cart.items.find(i => i.productId.toString() === item.productId);
        const currentQty = existing ? existing.quantity : 0;
        const totalQty = currentQty + item.quantity;

        // ✅ Check tổng số lượng (đang có trong giỏ + mới thêm) không vượt stock
        if (totalQty > product.stock) {
            const canAdd = product.stock - currentQty;
            if (canAdd <= 0) {
                results.push({
                    success: false,
                    name: product.name,
                    reason: `Already at max stock (${product.stock} items in cart)`
                });
            } else {
                results.push({
                    success: false,
                    name: product.name,
                    reason: `Can only add ${canAdd} more (stock: ${product.stock}, in cart: ${currentQty})`
                });
            }
            continue;
        }

        if (existing) { existing.quantity += item.quantity; }
        else { cart.items.push({ productId: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: item.quantity }); }
        results.push({ success: true, name: product.name, quantity: item.quantity, price: product.price });
    }
    await cart.save();
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    return { results, cartTotal: total, cartCount };
}

function buildCartReply(results, cartTotal, cartCount) {
    const added = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    let reply = '';
    if (added.length > 0) {
        reply += `🛒 **Added to cart:**\n\n`;
        added.forEach(r => { reply += `✅ **${r.name}** × ${r.quantity} — $${(r.price * r.quantity).toFixed(2)}\n\n`; });
        reply += `💰 **Cart total: $${cartTotal.toFixed(2)}** (${cartCount} items)\n\nReady to **checkout**? 🎉`;
    }
    if (failed.length > 0) {
        if (reply) reply += '\n\n---\n\n';
        failed.forEach(r => { reply += `❌ **${r.name}**: ${r.reason}\n\n`; });
    }
    if (added.length === 0 && failed.length === 0) {
        reply = "Sorry, I couldn't find that product. 🍰\n\nTry typing: **\"Add 2 Chocolate Cake to cart\"**";
    }
    return reply;
}

// ─── Detect language ──────────────────────────────────────────────────────────
function isVietnamese(text) {
    return /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(text);
}

// ─── Smart local reply ────────────────────────────────────────────────────────
function buildLocalReply(question, products) {
    const msg = question.toLowerCase();
    const vi = isVietnamese(question); // true = reply in Vietnamese, false = English

    // ── Greeting ──
    if (/^(hi|hello|hey|xin chào|chào|alo|ơi|hế lô|good morning|good afternoon|good evening|chào buổi|buổi sáng|buổi chiều|buổi tối)/.test(msg)) {
        const greetings = vi ? [
            'Xin chào! 🧁 Tôi là **Mochi**, trợ lý của **Mochi Cake Store**.\n\nTôi có thể giúp bạn:\n\n🍰 Xem **menu** & **giá bánh**\n\n🛒 **Đặt hàng** qua chat\n\n⏰ Thông tin **giờ mở cửa**\n\nBạn cần gì hôm nay?',
            'Chào bạn! 😊 Hôm nay bạn muốn thưởng thức bánh gì? Gõ **"menu"** để xem nhé!',
        ] : [
            'Hello! 🧁 I\'m **Mochi**, your assistant at **Mochi Cake Store**!\n\nI can help you with:\n\n🍰 Browse our **menu & prices**\n\n🛒 **Order** directly via chat\n\n⏰ **Opening hours** & delivery info\n\nWhat can I do for you today?',
            'Hey there! 😊 Welcome to **Mochi Cake Store**! Type **"menu"** to see what\'s available!',
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // ── Opening hours ──
    if (/giờ|mở cửa|đóng cửa|opening|closing|hours|hoạt động|làm việc|open|close/.test(msg)) {
        return vi
            ? `⏰ **Giờ mở cửa Mochi Cake Store:**\n\n🗓 **Thứ 2 – Thứ 6:** 7:00 AM – 9:00 PM\n\n🗓 **Thứ 7 – Chủ nhật:** 7:00 AM – 10:00 PM\n\n📍 Mở cửa tất cả các ngày trong tuần, kể cả ngày lễ!\n\nBạn muốn đặt bánh trước không? 🎂`
            : `⏰ **Mochi Cake Store Opening Hours:**\n\n🗓 **Monday – Friday:** 7:00 AM – 9:00 PM\n\n🗓 **Saturday – Sunday:** 7:00 AM – 10:00 PM\n\n📍 Open every day including public holidays!\n\nWant to pre-order a cake? 🎂`;
    }

    // ── Happy mood ──
    if (/vui|hạnh phúc|happy|excited|phấn khích|tuyệt vời|tốt lắm|great|wonderful|amazing/.test(msg)) {
        const picks = products.filter(p => p.stock > 0).slice(0, 2);
        const intro = vi
            ? `Ồ, nghe tuyệt quá! 🎉 Ngày vui thì phải có bánh ngon để ăn mừng chứ!\n\nMochi gợi ý:\n\n`
            : `That's awesome! 🎉 A happy day deserves a delicious cake!\n\nMochi recommends:\n\n`;
        const cta = vi ? `Gõ **"Thêm [tên bánh] vào giỏ hàng"** để đặt nhé! 🛒` : `Type **"Add [cake name] to cart"** to order! 🛒`;
        let reply = intro;
        picks.forEach(p => { reply += `🎂 **${p.name}** — $${p.price}\n\n`; });
        return reply + cta;
    }

    // ── Sad mood ──
    if (/buồn|sad|mệt|stress|chán|tệ|bad|unhappy|không vui|thất vọng|khó chịu|down|upset/.test(msg)) {
        const picks = products.filter(p => p.stock > 0).slice(0, 2);
        const intro = vi
            ? `Ôi, nghe có vẻ bạn đang không vui... 🥺 Một chiếc bánh ngọt sẽ làm mọi thứ tốt hơn!\n\nMochi đề xuất:\n\n`
            : `Aww, sounds like you need a pick-me-up! 🥺 A sweet cake always helps!\n\nMochi suggests:\n\n`;
        const cta = vi ? `Để Mochi chăm sóc bạn nhé! Gõ **"Thêm [tên bánh] vào giỏ"** 🛒` : `Let Mochi brighten your day! Type **"Add [cake name] to cart"** 🛒`;
        let reply = intro;
        picks.forEach(p => { reply += `🍰 **${p.name}** — $${p.price} ❤️\n\n`; });
        return reply + cta;
    }

    // ── Romantic / love ──
    if (/yêu|love|romantic|lãng mạn|valentine|hẹn hò|date|anniversary|kỷ niệm/.test(msg)) {
        const pick = products.find(p => p.stock > 0);
        return vi
            ? `Lãng mạn quá! 💕 Không gì tuyệt hơn chia sẻ bánh ngọt với người thương!\n\n💝 **${pick?.name || 'Special Cake'}** — $${pick?.price || '??'}\n\nLà lựa chọn hoàn hảo cho khoảnh khắc đặc biệt!\n\nGõ **"Thêm ${pick?.name} vào giỏ hàng"** để đặt! 🛒`
            : `How romantic! 💕 Nothing says love like sharing a sweet cake!\n\n💝 **${pick?.name || 'Special Cake'}** — $${pick?.price || '??'}\n\nThe perfect choice for a special moment!\n\nType **"Add ${pick?.name} to cart"** to order! 🛒`;
    }

    // ── Birthday ──
    if (/sinh nhật|birthday|happy birthday|mừng sinh nhật/.test(msg)) {
        const picks = products.filter(p => p.stock > 0).slice(0, 3);
        const intro = vi
            ? `🎂 **Mừng sinh nhật!** 🎉\n\nMochi Cake Store có những chiếc bánh sinh nhật tuyệt đẹp!\n\n`
            : `🎂 **Happy Birthday!** 🎉\n\nWe have the most amazing birthday cakes for your special day!\n\n`;
        const cta = vi ? `Đặt ngay để giao đúng hẹn! 🛒` : `Order now to get it delivered on time! 🛒`;
        let reply = intro;
        picks.forEach(p => { reply += `🎂 **${p.name}** — $${p.price}\n\n`; });
        return reply + cta;
    }

    // ── Hot weather ──
    if (/nóng|hot|summer|mùa hè|oi bức|hầm|sweat|nhiệt độ/.test(msg)) {
        const coolPicks = products.filter(p => p.stock > 0 && /matcha|fruit|trái|dâu|fresh|lemon|chanh/i.test(p.name + ' ' + (p.flavor || '')));
        const picks = coolPicks.length > 0 ? coolPicks.slice(0, 2) : products.filter(p => p.stock > 0).slice(0, 2);
        const intro = vi
            ? `Trời nóng quá đúng không! 🥵 Mochi gợi ý những loại bánh nhẹ nhàng, mát lạnh:\n\n`
            : `It's too hot out there! 🥵 Mochi recommends these refreshing cakes:\n\n`;
        const cta = vi ? `Thưởng thức bánh ngon giải nhiệt nhé! 😋` : `Stay cool and enjoy some cake! 😋`;
        let reply = intro;
        picks.forEach(p => { reply += `❄️ **${p.name}** — $${p.price}\n\n`; });
        return reply + cta;
    }

    // ── Flavor recommendations ──
    const flavorMap = [
        { patterns: /chocolate|socola|choco/, emoji: '🍫', label: 'chocolate' },
        { patterns: /matcha|trà xanh|green tea/, emoji: '🍵', label: 'matcha' },
        { patterns: /strawberry|dâu|berry/, emoji: '🍓', label: 'strawberry' },
        { patterns: /vanilla|vani/, emoji: '🍦', label: 'vanilla' },
        { patterns: /taro|khoai môn/, emoji: '💜', label: 'taro' },
        { patterns: /lemon|chanh/, emoji: '🍋', label: 'lemon' },
    ];
    for (const flavor of flavorMap) {
        if (flavor.patterns.test(msg)) {
            const found = products.find(p => flavor.patterns.test(p.name + ' ' + (p.flavor || '')) && p.stock > 0);
            if (found) {
                return vi
                    ? `${flavor.emoji} Bạn thích **${flavor.label}**? **${found.name}** chính là dành cho bạn!\n\n💰 Giá: **$${found.price}**\n\nGõ **"Thêm ${found.name} vào giỏ hàng"** để đặt! 🛒`
                    : `${flavor.emoji} A **${flavor.label}** lover! **${found.name}** is perfect for you!\n\n💰 Price: **$${found.price}**\n\nType **"Add ${found.name} to cart"** to order! 🛒`;
            }
            return vi
                ? `Hiện tại chúng tôi chưa có bánh ${flavor.label}. Gõ **"menu"** để xem các loại đang có nhé! 🍰`
                : `We don't have a ${flavor.label} cake right now. Type **"menu"** to see what's available! 🍰`;
        }
    }

    // ── Recommendation / don't know what to eat ──
    if (/gợi ý|recommend|suggest|không biết|nên ăn|ăn gì|chọn gì|tư vấn|muốn ăn|thèm|what should|which one|help me choose/.test(msg)) {
        const available = products.filter(p => p.stock > 0);
        if (available.length === 0) {
            return vi ? 'Rất tiếc, hiện tại chúng tôi đã hết hàng. Quay lại sau nhé! 🙏' : "Sorry, we're currently out of stock. Please check back later! 🙏";
        }
        const pick = available[Math.floor(Math.random() * available.length)];
        const others = available.filter(p => p._id.toString() !== pick._id.toString()).slice(0, 2);
        const intro = vi ? `🤔 Để Mochi gợi ý cho bạn nhé!\n\n` : `🤔 Let Mochi help you choose!\n\n`;
        const desc = pick.description || (vi ? 'Một trong những sản phẩm được yêu thích nhất!' : 'One of our most beloved cakes!');
        const otherLabel = vi ? `Hoặc bạn cũng có thể thử:\n\n` : `Or you might also like:\n\n`;
        const cta = vi ? `Gõ **"Thêm [tên bánh] vào giỏ hàng"** để đặt! 🛒` : `Type **"Add [cake name] to cart"** to order! 🛒`;
        let reply = `${intro}⭐ **${pick.name}** — $${pick.price}\n\n${desc}\n\n`;
        if (others.length > 0) {
            reply += otherLabel;
            others.forEach(p => { reply += `🍰 **${p.name}** — $${p.price}\n\n`; });
        }
        return reply + cta;
    }

    // ── Menu ──
    if (/menu|danh sách|có những|loại bánh|các loại|list|show|xem bánh|bánh nào|what do you have|what cakes/.test(msg)) {
        const available = products.filter(p => p.stock > 0);
        const outOfStock = products.filter(p => p.stock === 0);
        const title = vi ? `🍰 **Menu Mochi Cake Store:**\n\n` : `🍰 **Mochi Cake Store Menu:**\n\n`;
        const cta = vi ? `\nGõ **"Thêm [tên bánh] vào giỏ hàng"** để đặt! 🛒` : `\nType **"Add [cake name] to cart"** to order! 🛒`;
        let reply = title;
        available.forEach(p => { reply += `**${p.name}** — $${p.price} ✓\n\n`; });
        if (outOfStock.length > 0) {
            reply += `\n---\n\n`;
            outOfStock.forEach(p => { reply += `~~${p.name}~~ — ${vi ? 'Hết hàng' : 'Out of stock'} ✗\n\n`; });
        }
        return reply + cta;
    }

    // ── Price of specific product ──
    const foundByName = products.find(p => msg.includes(p.name.toLowerCase()));
    if ((/giá|price|bao nhiêu|how much|cost/.test(msg)) && foundByName) {
        const stockText = foundByName.stock > 0
            ? (vi ? `✓ Còn **${foundByName.stock}** sản phẩm` : `✓ **${foundByName.stock}** in stock`)
            : (vi ? '✗ Hết hàng' : '✗ Out of stock');
        const cta = vi ? `Gõ **"Thêm ${foundByName.name} vào giỏ hàng"** để đặt! 🛒` : `Type **"Add ${foundByName.name} to cart"** to order! 🛒`;
        return `💰 **${foundByName.name}**: **$${foundByName.price}**\n\n${stockText}\n\n${cta}`;
    }

    // ── General price list ──
    if (/giá|price|bao nhiêu|how much|price list/.test(msg)) {
        const title = vi ? `💰 **Bảng giá Mochi Cake Store:**\n\n` : `💰 **Mochi Cake Store Price List:**\n\n`;
        let reply = title;
        products.forEach(p => { reply += `**${p.name}**: $${p.price} ${p.stock > 0 ? '✓' : '✗'}\n\n`; });
        return reply;
    }

    // ── Stock check ──
    if ((/còn hàng|in stock|available|hết hàng|out of stock/.test(msg)) && foundByName) {
        return foundByName.stock > 0
            ? (vi
                ? `✓ **${foundByName.name}** còn **${foundByName.stock} sản phẩm**\n\nGõ **"Thêm ${foundByName.name} vào giỏ hàng"** để đặt! 🛒`
                : `✓ **${foundByName.name}** has **${foundByName.stock} items** in stock!\n\nType **"Add ${foundByName.name} to cart"** to order! 🛒`)
            : (vi
                ? `✗ **${foundByName.name}** hiện đã **hết hàng**\n\nGõ **"menu"** để xem các loại khác!`
                : `✗ **${foundByName.name}** is currently **out of stock**\n\nType **"menu"** to see other options!`);
    }

    // ── Address / location ──
    if (/địa chỉ|address|ở đâu|where|location|vị trí|cửa hàng|store|find you/.test(msg)) {
        return vi
            ? `📍 **Địa chỉ Mochi Cake Store:**\n\n🏪 123 Đường Bánh Ngọt, Quận 1, TP.HCM\n\n📞 Hotline: **0398-621-402**\n\n📧 Email: **mochicake@gmail.com**\n\n⏰ T2-T6: 7:00–21:00 | T7-CN: 7:00–22:00`
            : `📍 **Mochi Cake Store Location:**\n\n🏪 123 Banh Ngot Street, District 1, Ho Chi Minh City\n\n📞 Hotline: **0398-621-402**\n\n📧 Email: **mochicake@gmail.com**\n\n⏰ Mon-Fri: 7AM–9PM | Sat-Sun: 7AM–10PM`;
    }

    // ── Contact ──
    if (/hotline|số điện thoại|phone|liên hệ|contact|gọi|call|email/.test(msg)) {
        return vi
            ? `📞 **Liên hệ Mochi Cake Store:**\n\n🔢 Hotline: **0398-621-402**\n\n📧 Email: **mochicake@gmail.com**\n\n⏰ Hỗ trợ: **7:00 – 21:00** hàng ngày`
            : `📞 **Contact Mochi Cake Store:**\n\n🔢 Hotline: **0398-621-402**\n\n📧 Email: **mochicake@gmail.com**\n\n⏰ Support hours: **7:00 AM – 9:00 PM** daily`;
    }

    // ── Delivery ──
    if (/giao hàng|delivery|ship|vận chuyển|freeship|phí ship|shipping fee|deliver/.test(msg)) {
        return vi
            ? `🚚 **Chính sách giao hàng:**\n\n✅ **Freeship** cho đơn từ **$50** trở lên\n\n📦 Giao trong **2–4 giờ** nội thành\n\n🗺️ Hỗ trợ toàn TP.HCM\n\n💳 Thanh toán COD hoặc Stripe!`
            : `🚚 **Delivery Policy:**\n\n✅ **Free shipping** on orders over **$50**\n\n📦 Delivered within **2–4 hours** (city center)\n\n🗺️ Available across Ho Chi Minh City\n\n💳 Pay with COD or Stripe!`;
    }

    // ── Payment ──
    if (/thanh toán|payment|pay|trả tiền|cod|stripe|online|checkout/.test(msg)) {
        return vi
            ? `💳 **Phương thức thanh toán:**\n\n🚚 **COD** — Thanh toán khi nhận hàng (trả trước 50%)\n\n💳 **Stripe** — Thanh toán online an toàn 100%\n\nGõ **"Thêm [tên bánh] vào giỏ hàng"** để đặt ngay! 🛒`
            : `💳 **Payment Methods:**\n\n🚚 **COD** — Pay on delivery (50% upfront required)\n\n💳 **Stripe** — Secure 100% online payment\n\nType **"Add [cake name] to cart"** to start ordering! 🛒`;
    }

    // ── Discount / promotions ──
    if (/giảm giá|discount|khuyến mãi|promo|sale|coupon|voucher|ưu đãi|offer/.test(msg)) {
        return vi
            ? `🎉 **Ưu đãi tại Mochi Cake Store:**\n\n✨ **Giảm 10%** cho lần đặt hàng đầu tiên khi xác thực email!\n\n🎂 **Freeship** cho đơn từ $50\n\nXác thực email khi thanh toán để nhận ưu đãi nhé!`
            : `🎉 **Mochi Cake Store Offers:**\n\n✨ **10% off** your first order when you verify your email!\n\n🎂 **Free shipping** on orders over $50\n\nJust verify your email at checkout to unlock the discount!`;
    }

    // ── Thank you ──
    if (/cảm ơn|thank|thanks|tks|ty|appreciate/.test(msg)) {
        const replies = vi
            ? ['Không có gì! 😊 Mochi rất vui được phục vụ bạn. Chúc ngon miệng! 🍰', 'Dạ không có chi! 😄 Nếu cần gì cứ hỏi Mochi nhé!']
            : ['You\'re welcome! 😊 Mochi is happy to help. Enjoy your cake! 🍰', 'Anytime! 😄 Feel free to ask Mochi anything!'];
        return replies[Math.floor(Math.random() * replies.length)];
    }

    // ── Goodbye ──
    if (/bye|goodbye|tạm biệt|bai|hẹn gặp|see you|take care/.test(msg)) {
        return vi
            ? `Tạm biệt! 👋 Cảm ơn bạn đã ghé **Mochi Cake Store**! Hẹn gặp lại~ 🍰`
            : `Goodbye! 👋 Thanks for visiting **Mochi Cake Store**! See you next time~ 🍰`;
    }

    // ── About / who are you ──
    if (/mochi là gì|about|giới thiệu|introduce|bạn là ai|who are you|bạn tên gì|what is mochi/.test(msg)) {
        return vi
            ? `Xin chào! Tôi là **Mochi** 🧁 — trợ lý AI của **Mochi Cake Store**!\n\nChúng tôi chuyên cung cấp bánh ngọt thơm ngon từ nguyên liệu tươi chọn lọc.\n\nTôi có thể giúp bạn:\n\n🍰 Xem **menu & giá**\n\n🛒 **Đặt hàng** qua chat\n\n⏰ Thông tin **giờ mở cửa & giao hàng**`
            : `Hi there! I'm **Mochi** 🧁 — the AI assistant of **Mochi Cake Store**!\n\nWe specialize in freshly made cakes with carefully selected ingredients.\n\nI can help you:\n\n🍰 Browse **menu & prices**\n\n🛒 **Order** directly via chat\n\n⏰ Check **opening hours & delivery info**`;
    }

    // ── Events / parties ──
    if (/tiệc|party|sự kiện|event|khai trương|opening|wedding|đám cưới|corporate/.test(msg)) {
        return vi
            ? `🎊 **Đặt bánh cho sự kiện?**\n\nMochi Cake Store nhận đặt bánh theo yêu cầu:\n\n🎂 Sinh nhật\n\n💍 Đám cưới & Kỷ niệm\n\n🎉 Tiệc & Sự kiện công ty\n\n📞 Liên hệ **0398-621-402** để được tư vấn & báo giá!`
            : `🎊 **Ordering for a special event?**\n\nMochi Cake Store takes custom cake orders for:\n\n🎂 Birthdays\n\n💍 Weddings & Anniversaries\n\n🎉 Parties & Corporate events\n\n📞 Call **0398-621-402** for custom quotes!`;
    }

    // ── Default fallback ──
    const fallbacks = vi ? [
        `Xin lỗi, Mochi chưa hiểu câu hỏi của bạn 😅\n\nBạn có thể hỏi về:\n\n🍰 **"menu"** — Danh sách bánh\n\n💰 **"giá [tên bánh]"** — Hỏi giá\n\n⏰ **"giờ mở cửa"** — Giờ hoạt động\n\n🚚 **"giao hàng"** — Chính sách ship\n\n🛒 **"Thêm [tên bánh] vào giỏ"** — Đặt mua`,
        `Mochi chưa hiểu ý bạn lắm 🤔 Bạn có thể nói rõ hơn không?\n\nHoặc gõ **"menu"** để xem danh sách bánh nhé! 🍰`,
    ] : [
        `Hmm, Mochi didn't quite catch that 😅\n\nYou can ask about:\n\n🍰 **"menu"** — See our cakes\n\n💰 **"price list"** — View prices\n\n⏰ **"opening hours"** — When we're open\n\n🚚 **"delivery"** — Shipping info\n\n🛒 **"Add [cake] to cart"** — Order now`,
        `I'm not sure I understand 🤔 Could you rephrase that?\n\nOr type **"menu"** to browse our cakes! 🍰`,
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ─── Gemini safe wrapper ──────────────────────────────────────────────────────
async function askGeminiSafe(prompt, fallbackFn) {
    const available = await checkGemini();
    if (!available) return fallbackFn();
    try {
        const reply = await askGemini(prompt);
        if (!reply || reply.toLowerCase().startsWith('sorry, i could not')) return fallbackFn();
        return reply;
    } catch { return fallbackFn(); }
}

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get('/reply', async (req, res) => {
    const message = req.query.message?.toLowerCase().trim();
    if (!message) return res.status(400).json({ reply: 'Please enter a question.' });
    const messageNormalized = normalizeText(message);
    const faqKeys = Object.keys(faqData).map(k => normalizeText(k));
    const bestMatch = stringSimilarity.findBestMatch(messageNormalized, faqKeys);
    if (bestMatch.bestMatch.rating > 0.6) {
        const idx = faqKeys.indexOf(bestMatch.bestMatch.target);
        return res.json({ reply: faqData[Object.keys(faqData)[idx]] });
    }
    try {
        const products = await Product.find({});
        const found = products.find(p => messageNormalized.includes(normalizeText(p.name)));
        if (['price', 'how much', 'cost'].some(kw => messageNormalized.includes(kw)) && found)
            return res.json({ reply: `The price of **${found.name}** is **$${found.price}**.` });
        if (['available', 'in stock', 'do you have'].some(kw => messageNormalized.includes(kw)) && found)
            return found.stock > 0
                ? res.json({ reply: `**${found.name}** is in stock (${found.stock} items).` })
                : res.json({ reply: `**${found.name}** is currently out of stock.` });
        if (['thank you', 'thanks'].some(kw => messageNormalized.includes(kw)))
            return res.json({ reply: "You're welcome! 😊" });
        return res.json({ reply: 'Sorry, I don\'t have info on that. Call us: **0398-621-402**' });
    } catch (err) { return res.status(500).json({ reply: 'An error occurred.' }); }
});

router.post('/ai', optionalAuth, async (req, res) => {
    const question = req.body.message?.trim();
    const userId = req.user?._id || null;
    const sessionId = req.sessionID || req.ip;
    if (!question) return res.status(400).json({ reply: 'Please enter a question.' });

    try {
        await saveChatHistory(sessionId, 'user', question, userId);
        const products = await Product.find({});

        // ── Add-to-cart intent ───────────────────────────────────────────────
        if (detectAddToCartIntent(question, products)) {
            const intent = await extractCartIntent(question, products);
            if (intent.items && intent.items.length > 0) {
                const { results, cartTotal, cartCount } = await addItemsToCart(req, intent.items, products);
                const reply = buildCartReply(results, cartTotal, cartCount);
                await saveChatHistory(sessionId, 'bot', reply, userId);
                return res.json({ reply, cartUpdated: true, cartCount });
            }
            const vi = isVietnamese(question);
            const noMatch = vi
                ? 'Xin lỗi, tôi không tìm thấy sản phẩm đó. 🍰\n\nVui lòng gõ: **"Thêm [tên bánh] vào giỏ hàng"**'
                : "Sorry, I couldn't find that product. 🍰\n\nTry: **\"Add [cake name] to cart\"**";
            await saveChatHistory(sessionId, 'bot', noMatch, userId);
            return res.json({ reply: noMatch, cartUpdated: false });
        }

        // ── Checkout intent ──────────────────────────────────────────────────
        if (detectCheckoutIntent(question)) {
            const vi = isVietnamese(question);
            const cartQuery = getCartQuery(req);
            const cart = await Cart.findOne(cartQuery);
            const { reply, redirect, redirectLabel } = buildCheckoutReply(cart, req.user, vi);
            await saveChatHistory(sessionId, 'bot', reply, userId);
            return res.json({ reply, cartUpdated: false, redirect, redirectLabel });
        }

        // ── FAQ check ────────────────────────────────────────────────────────
        const msgNorm = normalizeText(question);
        const faqKeys = Object.keys(faqData).map(k => normalizeText(k));
        const bestMatch = stringSimilarity.findBestMatch(msgNorm, faqKeys);
        if (bestMatch.bestMatch.rating > 0.6) {
            const idx = faqKeys.indexOf(bestMatch.bestMatch.target);
            const reply = faqData[Object.keys(faqData)[idx]];
            await saveChatHistory(sessionId, 'bot', reply, userId);
            return res.json({ reply, cartUpdated: false });
        }

        // ── Gemini if online, local fallback if not ──────────────────────────
        const productList = products.map(p => `${p.name} ($${p.price}, stock: ${p.stock}, flavor: ${p.flavor || 'N/A'})`).join('; ');
        const vi = isVietnamese(question);

        const prompt = `You are Mochi 🧁, the friendly AI assistant of Mochi Cake Store.

STORE INFO:
- Products: ${productList}
- Opening hours: Mon-Fri 7AM-9PM, Sat-Sun 7AM-10PM
- Address: 123 Banh Ngot Street, District 1, Ho Chi Minh City
- Hotline: 0398-621-402
- Shipping: Free over $50, 2-4 hour delivery
- Payment: COD (50% upfront) or Stripe
- First-order discount: 10% off with email verification

PERSONALITY: Warm, enthusiastic, cake-loving. Use emojis naturally (not excessive).

RULES:
- Max 200 words
- Product names in **bold**, prices in **bold** with $
- Use ✓ for in-stock, ✗ for out-of-stock
- No bullet points — use line breaks between items
- For mood/feeling questions → recommend a suitable cake
- To order → tell user: type "Add [cake name] to cart"
- IMPORTANT: ${vi ? 'User wrote in Vietnamese → reply in Vietnamese' : 'User wrote in English → reply in English'}

USER: "${question}"`;

        const finalReply = await askGeminiSafe(prompt, () => buildLocalReply(question, products));
        await saveChatHistory(sessionId, 'bot', finalReply, userId);
        res.json({ reply: finalReply, cartUpdated: false });

    } catch (err) {
        console.error('Chatbot error:', err);
        res.status(500).json({ reply: 'System error, please try again later.' });
    }
});

router.get('/history/:sessionId', async (req, res) => {
    try {
        const chat = await ChatHistory.findOne({ sessionId: req.params.sessionId });
        res.json({ messages: chat?.messages || [] });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch history' }); }
});

router.get('/history', async (req, res) => {
    try {
        res.json({ chats: await ChatHistory.find({}) });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch histories' }); }
});

module.exports = router;