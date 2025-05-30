const jwt = require('jsonwebtoken');

const rolesPermissions = {
  user: ['view_products', 'view_inventory'],
  warehouse_manager: ['view_products', 'view_inventory', 'approve_requests'],
  admin: ['view_products', 'view_inventory', 'approve_requests', 'manage_users', 'manage_roles']
};

// Middleware xác thực JWT
exports.authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // Thêm permissions dựa trên role
    req.user.permissions = rolesPermissions[decoded.role] || [];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Middleware kiểm tra role
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }
    next();
  };
};
