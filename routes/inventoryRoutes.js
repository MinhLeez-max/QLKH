const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Hiển thị form nhập kho
router.get('/import', inventoryController.showImportForm);

// Hiển thị form xuất kho
router.get('/export', inventoryController.showExportForm);

// Xử lý nhập/xuất kho
router.post('/action', inventoryController.handleInventoryAction);

// Xem lịch sử kho
router.get('/history', inventoryController.getInventoryHistory);
router.get('/inventory-history', inventoryController.getInventoryHistory);

module.exports = router;
