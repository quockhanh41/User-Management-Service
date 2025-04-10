const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");

// Middleware xử lý validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  next();
};

// Validation middleware
const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    .trim(),
  body("name")
    .notEmpty()
    .withMessage("Tên không được để trống")
    .trim()
    .escape(),
  validate
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Mật khẩu không được để trống")
    .trim(),
  validate
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Mật khẩu hiện tại không được để trống")
    .trim(),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu mới phải có ít nhất 6 ký tự")
    .trim(),
  validate
];

// Auth routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/logout", auth, authController.logout);
router.post(
  "/change-password",
  auth,
  changePasswordValidation,
  authController.changePassword
);

module.exports = router;
