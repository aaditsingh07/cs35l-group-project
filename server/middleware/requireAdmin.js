const jwt = require("jsonwebtoken");

const JWT_SECRET = "cs35l-secret-key";

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not authenticated." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Forbidden." });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = requireAdmin;
