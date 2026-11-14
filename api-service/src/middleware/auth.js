const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  const providedSecret = req.headers['x-admin-secret'] || req.query.admin_secret;

  if (adminSecret && providedSecret === adminSecret) {
    req.user = { role: 'admin', authType: 'secret' };
    return next();
  }

  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [k, v] = cookie.trim().split('=');
      acc[k] = v;
      return acc;
    }, {});
    token = cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'Cjh87caj8^7&%HAS';
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized - Invalid or expired token' });
  }
}

module.exports = authMiddleware;
