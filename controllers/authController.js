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
  res.status(200).json({ message: 'Đăng xuất thành công' });
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu không đúng.' });
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
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng nhập.' });
  }
};
