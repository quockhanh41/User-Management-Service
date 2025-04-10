const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const TokenBlacklist = require('../models/TokenBlacklist');

const auth = async (req, res, next) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Lấy token từ header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Không tìm thấy token xác thực',
        code: 'TOKEN_MISSING'
      });
    }

    // Kiểm tra token có trong blacklist không
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Token đã bị vô hiệu hóa',
        code: 'TOKEN_BLACKLISTED'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Thêm thông tin user vào request
    req.user = decoded;
    req.token = token; // Lưu token để sử dụng trong controller
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Token đã hết hạn',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(401).json({ 
      status: 'error',
      message: 'Token không hợp lệ',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = auth; 