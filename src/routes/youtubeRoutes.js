const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const auth = require('../middlewares/auth');
const multer = require('multer');

// Cấu hình multer để xử lý upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // Giới hạn 100MB
  }
});

// Lấy URL xác thực YouTube
router.get('/auth/url', auth, youtubeController.getAuthUrl);

// Xử lý callback sau khi xác thực
router.get('/auth/callback', youtubeController.handleCallback);

// Upload video lên YouTube
router.post(
  '/upload',
  auth,
  upload.single('video'),
  youtubeController.uploadVideo
);

module.exports = router; 