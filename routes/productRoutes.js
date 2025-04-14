const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const productController = require('../controllers/productController');
const dashboardController = require('../controllers/dashboardController');

// Validation rules
const productValidationRules = [
  body('name').notEmpty().withMessage('Tên sản phẩm là bắt buộc'),
  body('sku').notEmpty().withMessage('Mã SKU là bắt buộc'),
  body('quantity').isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên dương'),
  body('importPrice').isFloat({ min: 0 }).withMessage('Giá nhập phải là số dương'),
  body('salePrice').isFloat({ min: 0 }).withMessage('Giá bán phải là số dương')
];

// Các route cho sản phẩm
router.get('/add', productController.getAddProductPage); // Trang thêm sản phẩm
// Redirect các URL cũ để tương thích ngược
router.get('/list', (req, res) => res.redirect('/products')); // /products/list
router.get('/product/list', (req, res) => res.redirect('/products')); // /product/list
router.get('/', productController.getProductList); // Route chính cho danh sách sản phẩm
router.get('/update/:id', productController.getUpdateProductPage); // Trang cập nhật sản phẩm
router.post('/update', productController.updateProduct); // Cập nhật sản phẩm
router.post('/add', productController.addProduct); // Thêm sản phẩm mới
router.post('/delete', productController.deleteProduct); // Xóa sản phẩm

// Route cho dashboard
router.get('/dashboard', dashboardController.getDashboard); // Trang dashboard

module.exports = router;
