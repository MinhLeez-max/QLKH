const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

// Đăng ký người dùng
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.redirect('/auth/login?success=Đăng ký thành công!');
  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng ký.' });
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Server-side validation
  if (!email || !password) {
    return res.redirect('/auth/login?error=Vui lòng nhập đầy đủ email và mật khẩu.');
  }

  // Simple email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.redirect('/auth/login?error=Email không hợp lệ.');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.redirect('/auth/login?error=Người dùng không tồn tại.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.redirect('/auth/login?error=Mật khẩu không đúng.');
    }

    // Tạo token và set cookie
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.redirect('/');
  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    res.redirect('/auth/login?error=Đã xảy ra lỗi khi đăng nhập.');
  }
};
