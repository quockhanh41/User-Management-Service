const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

// Middleware xử lý validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: "error",
      message: "Dữ liệu không hợp lệ",
      code: "VALIDATION_ERROR",
      errors: errors.array()
    });
  }
  next();
};

// Lấy thông tin người dùng
router.get("/profile", auth, userController.getUserProfile);

// Thêm/chỉnh sửa tài khoản liên kết
router.post(
  "/social",
  [
    auth,
    body("platform")
      .isIn(["facebook", "youtube", "tiktok"])
      .withMessage("Nền tảng không hợp lệ"),
    body("socialId")
      .notEmpty()
      .withMessage("ID mạng xã hội không được để trống"),
    body("profileUrl")
      .isURL()
      .withMessage("URL hồ sơ không hợp lệ"),
    body("accessToken")
      .notEmpty()
      .withMessage("Access token không được để trống"),
    validate
  ],
  userController.updateSocialAccount
);

// Xóa tài khoản liên kết
router.delete("/social/:platform", auth, userController.deleteSocialAccount);

// Lấy thông tin tài khoản liên kết
router.get(
  "/social/:platform",
  auth,
  param("platform")
    .isIn(["facebook", "youtube", "tiktok"])
    .withMessage("Nền tảng không hợp lệ"),
  validate,
  userController.getSocialAccount
);

module.exports = router; 