const apiClient = require('../services/apiClient');

async function requireAdminAuth(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    if (req.xhr || req.path.startsWith('/api') || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    return res.redirect('/login');
  }

  const isValid = await apiClient.verifyToken(token);
  if (!isValid) {
    res.clearCookie('auth_token');
    if (req.xhr || req.path.startsWith('/api') || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    return res.redirect('/login');
  }

  req.token = token;
  next();
}

module.exports = requireAdminAuth;
