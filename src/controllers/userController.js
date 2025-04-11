const User = require("../models/User");

// Lấy thông tin người dùng
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
  
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
        code: "USER_NOT_FOUND"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Lấy thông tin người dùng thành công",
      data: user
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    res.status(500).json({
      status: "error",
      message: "Lỗi server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Thêm/chỉnh sửa tài khoản liên kết
exports.updateSocialAccount = async (req, res) => {
  try {
    const { platform, socialId, profileUrl, accessToken, refreshToken } = req.body;
    
    // Kiểm tra người dùng tồn tại
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
        code: "USER_NOT_FOUND"
      });
    }
    
    // Kiểm tra xem tài khoản liên kết đã tồn tại chưa
    const existingAccountIndex = user.socialAccounts.findIndex(
      account => account.platform === platform
    );
    
    const socialAccount = {
      platform,
      socialId,
      profileUrl,
      accessToken,
      refreshToken
    };
    
    if (existingAccountIndex !== -1) {
      // Cập nhật tài khoản liên kết hiện có
      user.socialAccounts[existingAccountIndex] = socialAccount;
    } else {
      // Thêm tài khoản liên kết mới
      user.socialAccounts.push(socialAccount);
    }
    
    // Lưu thay đổi
    await user.save();
    
    res.status(200).json({
      status: "success",
      message: existingAccountIndex !== -1 
        ? "Cập nhật tài khoản liên kết thành công" 
        : "Thêm tài khoản liên kết thành công",
      data: {
        socialAccount
      }
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật tài khoản liên kết:", error);
    
    // Xử lý lỗi validation
    if (error.name === 'ValidationError') {
      return res.status(422).json({
        status: "error",
        message: "Dữ liệu không hợp lệ",
        code: "VALIDATION_ERROR",
        errors: Object.values(error.errors).map(err => ({
          msg: err.message,
          param: err.path,
          location: "body"
        }))
      });
    }
    
    res.status(500).json({
      status: "error",
      message: "Lỗi server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Xóa tài khoản liên kết
exports.deleteSocialAccount = async (req, res) => {
  try {
    const { platform } = req.params;
    
    // Kiểm tra người dùng tồn tại
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
        code: "USER_NOT_FOUND"
      });
    }
    
    // Kiểm tra xem tài khoản liên kết có tồn tại không
    const existingAccountIndex = user.socialAccounts.findIndex(
      account => account.platform === platform
    );
    
    if (existingAccountIndex === -1) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy tài khoản liên kết",
        code: "SOCIAL_ACCOUNT_NOT_FOUND"
      });
    }
    
    // Xóa tài khoản liên kết
    user.socialAccounts.splice(existingAccountIndex, 1);
    
    // Lưu thay đổi
    await user.save();
    
    res.status(200).json({
      status: "success",
      message: "Xóa tài khoản liên kết thành công",
      data: {
        platform
      }
    });
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản liên kết:", error);
    res.status(500).json({
      status: "error",
      message: "Lỗi server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Lấy thông tin tài khoản liên kết mạng xã hội
exports.getSocialAccount = async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user.userId;

    // Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
        code: "USER_NOT_FOUND"
      });
    }

    // Tìm tài khoản liên kết
    const socialAccount = user.socialAccounts.find(
      account => account.platform.toLowerCase() === platform.toLowerCase()
    );

    if (!socialAccount) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy tài khoản liên kết",
        code: "SOCIAL_ACCOUNT_NOT_FOUND"
      });
    }

    // Trả về thông tin tài khoản liên kết
    return res.status(200).json({
      status: "success",
      message: "Lấy thông tin tài khoản liên kết thành công",
      data: {
        socialAccount: {
          platform: socialAccount.platform,
          socialId: socialAccount.socialId,
          profileUrl: socialAccount.profileUrl,
          accessToken: socialAccount.accessToken,
          refreshToken: socialAccount.refreshToken,
          expiresIn: socialAccount.expiresIn
        }
      }
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tài khoản liên kết:", error);
    return res.status(500).json({
      status: "error",
      message: "Lỗi server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
}; 