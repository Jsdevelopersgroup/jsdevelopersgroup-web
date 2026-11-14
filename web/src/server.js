const express = require('express');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const healthRouter = require('./routes/health');
const indexRouter = require('./routes/index');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/app/uploads';

// EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Routes
app.use('/health', healthRouter);
app.use('/', indexRouter);

// Serve public static assets
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
  redirect: false,
}));

// Serve shared uploads
app.use('/uploads', express.static(UPLOAD_ROOT, {
  maxAge: '7d',
  immutable: true,
}));

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found | JS Developers Group',
    description: 'The requested page was not found.',
    activePage: '',
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Web App Error:', err);
  res.status(500).render('404', {
    title: '500 - Server Error | JS Developers Group',
    description: 'An internal error occurred.',
    activePage: '',
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WEB] Running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[WEB] API URL: ${process.env.API_BASE_URL || 'http://api-service:4000'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing WEB server');
  server.close(() => process.exit(0));
});

module.exports = app;
