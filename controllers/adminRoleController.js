
let roles = [
  {
    name: 'user',
    permissions: ['view_products', 'view_inventory']
  },
  {
    name: 'warehouse_manager',
    permissions: ['view_products', 'view_inventory', 'approve_requests']
  },
  {
    name: 'admin',
    permissions: ['view_products', 'view_inventory', 'approve_requests', 'manage_users', 'manage_roles']
  }
];

// List all roles
exports.listRoles = (req, res) => {
  res.render('admin/role-list', { roles });
};

// Show add role form
exports.showAddRoleForm = (req, res) => {
  res.render('admin/add-role');
};

// Handle add role
exports.addRole = (req, res) => {
  const { role } = req.body;
  if (!role || roles.find(r => r.name === role)) {
    return res.render('admin/add-role', { error: 'Vai trò không hợp lệ hoặc đã tồn tại' });
  }
  roles.push({ name: role, permissions: [] });
  res.redirect('/admin/roles');
};

// Show edit role form
exports.showEditRoleForm = (req, res) => {
  const roleName = req.params.role;
  const role = roles.find(r => r.name === roleName);
  if (!role) {
    return res.status(404).render('error', { message: 'Vai trò không tồn tại' });
  }
  const currentUserPermissions = req.user?.permissions || [];
  res.render('admin/edit-role', { role, currentUserPermissions });
};

// Handle edit role
exports.editRole = (req, res) => {
  const oldRoleName = req.params.role;
  const { newRole, permissions } = req.body;
  const roleIndex = roles.findIndex(r => r.name === oldRoleName);
  if (roleIndex === -1) {
    return res.status(404).render('error', { message: 'Vai trò không tồn tại' });
  }
  if (!newRole || (newRole !== oldRoleName && roles.find(r => r.name === newRole))) {
    return res.render('admin/edit-role', { role: roles[roleIndex], error: 'Vai trò mới không hợp lệ hoặc đã tồn tại' });
  }
  roles[roleIndex].name = newRole;
  // permissions can be a string or array depending on form submission
  if (!permissions) {
    roles[roleIndex].permissions = [];
  } else if (typeof permissions === 'string') {
    roles[roleIndex].permissions = [permissions];
  } else {
    roles[roleIndex].permissions = permissions;
  }
  res.redirect('/admin/roles');
};

// Handle delete role
exports.deleteRole = (req, res) => {
  const roleName = req.params.role;
  const roleIndex = roles.findIndex(r => r.name === roleName);
  if (roleIndex === -1) {
    return res.status(404).render('error', { message: 'Vai trò không tồn tại' });
  }
  roles.splice(roleIndex, 1);
  res.redirect('/admin/roles');
};
