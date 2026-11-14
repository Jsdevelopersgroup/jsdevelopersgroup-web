const express = require('express');
const router = express.Router();
const apiClient = require('../services/apiClient');

router.get('/login', (req, res) => {
  if (req.cookies.auth_token) {
    return res.redirect('/admin/projects');
  }
  res.render('login', {
    title: 'Admin Login | JS Developers Group',
    error: null,
  });
});

// Legacy path alias matching original Next.js route: /admin/auth
router.get('/admin/auth', (req, res) => {
  res.redirect('/login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await apiClient.login(email, password);
    if (data.success && data.token) {
      res.cookie('auth_token', data.token, {
        httpOnly: true,
        secure: false, // allow standard HTTP in docker network / local proxy
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ success: true, redirect: '/admin/projects' });
      }
      return res.redirect('/admin/projects');
    }

    const message = data.message || 'Login failed';
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ success: false, message });
    }
    return res.render('login', { title: 'Admin Login', error: message });
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Server error';
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ success: false, message });
    }
    return res.render('login', { title: 'Admin Login', error: message });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.redirect('/login');
});

module.exports = router;
