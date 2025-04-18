const express = require('express');
const router = express.Router();
const adminRoleController = require('../controllers/adminRoleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// List roles
router.get('/roles', authenticate, authorize(['admin']), adminRoleController.listRoles);

// Show add role form
router.get('/roles/add', authenticate, authorize(['admin']), adminRoleController.showAddRoleForm);

// Handle add role
router.post('/roles/add', authenticate, authorize(['admin']), adminRoleController.addRole);

// Show edit role form
router.get('/roles/:role/edit', authenticate, authorize(['admin']), adminRoleController.showEditRoleForm);

// Handle edit role
router.post('/roles/:role/edit', authenticate, authorize(['admin']), adminRoleController.editRole);

// Handle delete role
router.post('/roles/:role/delete', authenticate, authorize(['admin']), adminRoleController.deleteRole);

module.exports = router;
