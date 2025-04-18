const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// List users
router.get('/users', authenticate, authorize(['admin']), adminController.listUsers);

// Show add user form
router.get('/users/add', authenticate, authorize(['admin']), adminController.showAddUserForm);

// Handle add user
router.post('/users/add', authenticate, authorize(['admin']), adminController.addUser);

// Show edit user form
router.get('/users/:id/edit', authenticate, authorize(['admin']), adminController.showEditUserForm);

// Handle edit user
router.post('/users/:id/edit', authenticate, authorize(['admin']), adminController.editUser);

// Handle delete user
router.post('/users/:id/delete', authenticate, authorize(['admin']), adminController.deleteUser);

module.exports = router;
