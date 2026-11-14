const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const adminProjectsRouter = require('./routes/adminProjects');

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);
const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/app/uploads';

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Serve uploads statically with caching
app.use('/uploads', express.static(UPLOAD_ROOT, {
  maxAge: '7d',
  immutable: true,
}));

// Mount Routes
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/admin/projects', adminProjectsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API-SERVICE] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[API-SERVICE] Uploads directory: ${UPLOAD_ROOT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
