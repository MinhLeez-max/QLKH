const User = require('../models/User.model');

// Show user profile
exports.showProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).render('error', { message: 'Người dùng không tồn tại' });
    }
    res.render('profile', { user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).render('error', { message: 'Lỗi khi tải hồ sơ người dùng' });
  }
};

// Update user avatar
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar không được để trống' });
    }
    const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    res.json({ message: 'Cập nhật avatar thành công', avatar: user.avatar });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật avatar' });
  }
};

// Update user introduction
exports.updateIntroduction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { introduction } = req.body;
    const user = await User.findByIdAndUpdate(userId, { introduction }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    res.json({ message: 'Cập nhật giới thiệu thành công', introduction: user.introduction });
  } catch (error) {
    console.error('Error updating introduction:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật giới thiệu' });
  }
};
