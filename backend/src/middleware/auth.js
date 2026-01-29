const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const header = 
    req.headers.authorization ||
    (req.query.token ? `Bearer ${req.query.token}` : null);
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Invalid token user" });

    req.user = {
      id: user._id,
      role: user.role,
      tenantId: user.tenantId
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

module.exports = { auth, requireRole };