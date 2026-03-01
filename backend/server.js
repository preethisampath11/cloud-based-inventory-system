require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const { connectDB } = require('./src/config/database');
const { errorHandler } = require('./src/middleware/errorHandler');
const { requestLogger } = require('./src/middleware/logger');
const { authenticate, authorize } = require('./src/middleware/auth');
const logger = require('./src/utils/logger');

const app = express();

// Connect to MongoDB (non-blocking)
connectDB().catch((err) => {
  logger.warn('Database connection failed, continuing without database');
});

// ============================================
// Global Middleware
// ============================================

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Request logging middleware
app.use(requestLogger);

// ============================================
// Routes
// ============================================

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Pharmacy Inventory System API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/v1/auth',
      medicines: '/api/v1/medicines',
      suppliers: '/api/v1/suppliers',
      batches: '/api/v1/batches',
      purchases: '/api/v1/purchases',
      sales: '/api/v1/sales',
      reports: '/api/v1/reports',
      ai: '/api/v1/ai',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use('/api/v1/auth', require('./src/routes/authRoutes'));

// Medicine routes
app.use('/api/v1/medicines', require('./src/routes/medicineRoutes'));

// Supplier routes
app.use('/api/v1/suppliers', require('./src/routes/supplierRoutes'));

// Batch routes
app.use('/api/v1/batches', require('./src/routes/batchRoutes'));

// Purchase routes
app.use('/api/v1/purchases', require('./src/routes/purchaseRoutes'));

// Sale routes
app.use('/api/v1/sales', require('./src/routes/saleRoutes'));

// Reports routes
app.use('/api/v1/reports', require('./src/routes/reportsRoutes'));

// AI Assistant routes
app.use('/api/v1/ai', require('./src/routes/aiRoutes'));

// ============================================
// 404 Handler
// ============================================

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// ============================================
// Error Handler Middleware (Must be last)
// ============================================

app.use(errorHandler);

// ============================================
// Server Start
// ============================================

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
