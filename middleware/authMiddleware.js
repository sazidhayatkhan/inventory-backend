const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Attach user data to request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Role based access control middleware
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  if (!allowedRoles.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden: Insufficient permissions" });

  next();
};

module.exports = { authenticate, authorize };
