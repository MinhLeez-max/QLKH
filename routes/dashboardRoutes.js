const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Dashboard routes
router.get('/', authenticate, authorize(['admin', 'manager', 'user']), dashboardController.getDashboard);
router.get('/dashboard', authenticate, authorize(['admin', 'manager', 'user']), dashboardController.getDashboard);

module.exports = router;
