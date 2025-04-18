const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');

// Validation rules
const productValidationRules = [
  body('name').notEmpty().withMessage('Tên sản phẩm là bắt buộc'),
  body('sku').notEmpty().withMessage('Mã SKU là bắt buộc'),
  body('quantity').isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên dương'),
  body('importPrice').isFloat({ min: 0 }).withMessage('Giá nhập phải là số dương'),
];

// Các route cho sản phẩm (protected)
router.get('/add', authenticate, checkRole(['admin', 'manager']), productController.getAddProductPage);
router.get('/list', authenticate, checkRole(['admin', 'manager', 'user']), (req, res) => res.redirect('/products'));
router.get('/product/list', authenticate, checkRole(['admin', 'manager', 'user']), (req, res) => res.redirect('/products'));
router.get('/', authenticate, checkRole(['admin', 'manager', 'user']), productController.getProductList);
router.get('/update/:id', authenticate, checkRole(['admin', 'manager']), productController.getUpdateProductPage);
router.post('/update', authenticate, checkRole(['admin', 'manager']), productController.updateProduct);
router.post('/add', authenticate, checkRole(['admin', 'manager']), productController.addProduct);
router.post('/delete', authenticate, checkRole(['admin']), productController.deleteProduct);

// Route cho dashboard (protected)
router.get('/dashboard', authenticate, checkRole(['admin', 'manager', 'user']), dashboardController.getDashboard);

module.exports = router;
