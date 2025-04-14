const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký người dùng
router.post('/register', authController.register);

// Đăng nhập người dùng 
router.post('/login', authController.login);

// Route GET cho trang đăng nhập
router.get('/login', (req, res) => res.render('login'));

// Route GET cho trang đăng ký 
router.get('/register', (req, res) => res.render('register'));

// Đăng xuất người dùng
router.post('/logout', authController.logout);

module.exports = router;
