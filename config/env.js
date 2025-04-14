require('dotenv').config(); // Đảm bảo dotenv được gọi ở đầu để có thể sử dụng biến môi trường từ .env

const envConfig = {
  DB_URL: process.env.DB_URL,
  PORT: process.env.PORT || 5555
};

module.exports = envConfig;
