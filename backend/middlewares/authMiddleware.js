const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = async (req, res, next) => {
  let token = null;

  // Ưu tiên Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Nếu không có thì fallback sang cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("name email role");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: decoded.userId,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
