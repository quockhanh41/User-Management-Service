const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');

// Import routes
const userRoutes = require('./userRoutes');
const userProfileRoutes = require('./userProfileRoutes');

// Middleware xử lý validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'error',
      message: 'Dữ liệu không hợp lệ',
      code: 'VALIDATION_ERROR',
      errors: errors.array()
    });
  }
  next();
};

// Middleware xử lý lỗi chung
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Xử lý các loại lỗi cụ thể
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      status: 'error',
      message: 'Dữ liệu không hợp lệ',
      code: 'VALIDATION_ERROR',
      errors: Object.values(err.errors).map(error => ({
        msg: error.message,
        param: error.path,
        location: 'body'
      }))
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ',
      code: 'INVALID_TOKEN'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token đã hết hạn',
      code: 'TOKEN_EXPIRED'
    });
  }
  
  // Lỗi mặc định
  res.status(500).json({
    status: 'error',
    message: 'Lỗi server',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API version prefix
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';

// Mount routes
router.use(`${apiPrefix}/${apiVersion}/auth`, userRoutes);
router.use(`${apiPrefix}/${apiVersion}/user`, userProfileRoutes);

// Apply middleware
router.use(handleValidationErrors);
router.use(errorHandler);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route không tồn tại',
    code: 'NOT_FOUND'
  });
});

module.exports = router;
