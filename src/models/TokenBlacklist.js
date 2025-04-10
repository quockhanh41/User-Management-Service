const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 0 // Không tự động xóa
  }
}, {
  timestamps: true
});

// Indexes
tokenBlacklistSchema.index({ token: 1 }, { unique: true });
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Tự động xóa sau khi hết hạn

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist; 