const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/authMiddleware');

// Route hiển thị trang hồ sơ người dùng
router.get('/profile', authenticate, profileController.showProfile);

// Route cập nhật avatar người dùng
router.post('/profile/avatar', authenticate, profileController.updateAvatar);

// Route cập nhật giới thiệu người dùng
router.post('/profile/introduction', authenticate, profileController.updateIntroduction);

module.exports = router;
