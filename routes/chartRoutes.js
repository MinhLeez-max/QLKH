const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');

router.get('/stats', chartController.getStats); // Thống kê tổng quan
router.get('/inventory', chartController.getInventoryChart); // Biểu đồ kho
router.get('/sales', chartController.getSalesChart); // Biểu đồ bán hàng
router.get('/products', chartController.getProductsChart); // Biểu đồ sản phẩm

module.exports = router;
