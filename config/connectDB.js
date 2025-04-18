// config/connectDB.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Đọc các biến môi trường từ file .env
dotenv.config();

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const dbUrl = process.env.DB_URL || 'mongodb://localhost/FiFai_QLKH'; // Sử dụng database FiFai_QLKH
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false
    });
    console.log('✅ Kết nối MongoDB thành công!');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1); // Dừng ứng dụng nếu không thể kết nối
  }
};

module.exports = connectDB;
