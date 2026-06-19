// Protects routes that should only be visible to Durgesh / Pakhi.
// The request must send a header:  x-admin-token: <ADMIN_TOKEN from .env>
function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return res.status(500).json({
      success: false,
      message: "Server is missing ADMIN_TOKEN configuration.",
    });
  }

  if (!token || token !== expected) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Provide a valid x-admin-token header.",
    });
  }

  next();
}

module.exports = { requireAdmin };
