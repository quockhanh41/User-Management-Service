const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");
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

// Đăng ký
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .normalizeEmail()
      .trim(),
    body("password")
      .isLength({ min: 6, max: 20 })
      .withMessage("Mật khẩu phải có độ dài từ 6 đến 20 ký tự")
      .trim(),
    body("name")
      .isLength({ min: 2, max: 50 })
      .withMessage("Tên phải có độ dài từ 2 đến 50 ký tự")
      .trim()
      .escape(),
    validate
  ],
  authController.register
);

// Đăng nhập
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .normalizeEmail()
      .trim(),
    body("password")
      .notEmpty()
      .withMessage("Mật khẩu không được để trống")
      .trim(),
    validate
  ],
  authController.login
);

// Đăng xuất
router.post("/logout", auth, authController.logout);

// Đổi mật khẩu
router.post(
  "/change-password",
  [
    auth,
    body("currentPassword")
      .notEmpty()
      .withMessage("Mật khẩu hiện tại không được để trống")
      .trim(),
    body("newPassword")
      .isLength({ min: 6, max: 20 })
      .withMessage("Mật khẩu mới phải có độ dài từ 6 đến 20 ký tự")
      .trim(),
    validate
  ],
  authController.changePassword
);

module.exports = router;
