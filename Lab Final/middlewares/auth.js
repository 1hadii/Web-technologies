const jwt = require("jsonwebtoken");

// Session-based: Check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash("error_msg", "Please log in to view this resource.");
  res.redirect("/login");
};

// Session-based: Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  req.flash("error_msg", "Access Denied: Admins Only.");
  res.redirect("/");
};

// JWT-based: Verify token for API routes
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, role, ... }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
  }
};

module.exports = { isLoggedIn, isAdmin, verifyToken };
