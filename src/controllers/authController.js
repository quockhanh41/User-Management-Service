const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        status: 'error',
        message: 'Email đã được sử dụng',
        code: 'EMAIL_EXISTS'
      });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const user = new User({
      email,
      password: hashedPassword,
      name
    });

    await user.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký thành công',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Email hoặc mật khẩu không chính xác',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Email hoặc mật khẩu không chính xác',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Đăng xuất
exports.logout = async (req, res) => {
  try {
    const token = req.token;
    const decoded = jwt.decode(token);
    
    // Thêm token vào blacklist
    const blacklistedToken = new TokenBlacklist({
      token,
      userId: decoded.userId,
      expiresAt: new Date(decoded.exp * 1000) // Chuyển đổi từ Unix timestamp sang Date
    });
    
    await blacklistedToken.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Mật khẩu hiện tại không chính xác',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 