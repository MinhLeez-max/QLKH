const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');

// Hiển thị form nhập kho
router.get('/import', authenticate, checkRole(['admin', 'manager', 'user']), inventoryController.showImportForm);

// Hiển thị form xuất kho
router.get('/export', authenticate, checkRole(['admin', 'manager', 'user']), inventoryController.showExportForm);

// Xử lý nhập/xuất kho (tạo yêu cầu)
router.post('/action', authenticate, checkRole(['admin', 'manager', 'user']), inventoryController.handleInventoryAction);

// Xem lịch sử kho
router.get('/history', authenticate, checkRole(['admin', 'manager', 'user']), inventoryController.getInventoryHistory);

// Xem danh sách yêu cầu pending (cho tất cả user đã đăng nhập, không phân quyền)
router.get('/pending', authenticate, inventoryController.getPendingRequests);

// Phê duyệt yêu cầu (admin, warehouse_manager)
router.post('/pending/:id/approve', authenticate, checkRole(['admin', 'warehouse_manager']), inventoryController.approveRequest);

// Từ chối yêu cầu (admin, warehouse_manager)
router.post('/pending/:id/reject', authenticate, checkRole(['admin', 'warehouse_manager']), inventoryController.rejectRequest);

module.exports = router;
