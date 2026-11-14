const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/app/uploads';

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Serve public static assets
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
}));

// Serve shared uploads
app.use('/uploads', express.static(UPLOAD_ROOT, {
  maxAge: '7d',
  immutable: true,
}));

// Routes
app.use('/health', healthRouter);
app.use('/', authRouter);
app.use('/', dashboardRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Admin Server Error:', err);
  res.status(500).send('Internal Server Error');
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ADMIN] Running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[ADMIN] API URL: ${process.env.API_BASE_URL || 'http://api-service:4000'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing ADMIN server');
  server.close(() => process.exit(0));
});

module.exports = app;
