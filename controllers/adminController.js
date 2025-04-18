const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

// List all users
exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 7;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const filterRole = req.query.role || '';

    // Build query object
    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (filterRole) {
      query.role = filterRole;
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    res.render('admin/user-list', { 
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      search,
      filterRole
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).render('error', { message: 'Lỗi khi tải danh sách người dùng' });
  }
};

// Show add user form
exports.showAddUserForm = (req, res) => {
  res.render('admin/add-user', { formData: {} });
};

// Handle add user
exports.addUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.render('admin/add-user', { error: 'Tên đăng nhập hoặc email đã tồn tại', formData: req.body });
    }
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).render('error', { message: 'Lỗi khi thêm người dùng' });
  }
};

// Show edit user form
exports.showEditUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('error', { message: 'Người dùng không tồn tại' });
    }
    res.render('admin/edit-user', { user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).render('error', { message: 'Lỗi khi tải thông tin người dùng' });
  }
};

// Handle edit user
exports.editUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('error', { message: 'Người dùng không tồn tại' });
    }
    user.username = username;
    user.email = email;
    user.role = role;
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('error', { message: 'Lỗi khi cập nhật người dùng' });
  }
};

// Handle delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).render('error', { message: 'Lỗi khi xóa người dùng' });
  }
};
