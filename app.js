const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDB = require('./config/connectDB');
const envConfig = require('./config/env');

// Routes 
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const authRoutes = require('./routes/authRoutes'); 
const chartRoutes = require('./routes/chartRoutes');

const app = express();

// Prevent caching of forms
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware xác thực JWT
const jwt = require('jsonwebtoken');
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded; // Lưu vào request
        res.locals.user = decoded; // Lưu vào locals để view truy cập
      }
      next();
    });
  } else {
    res.locals.user = null; // Đảm bảo user là null khi chưa đăng nhập
    next();
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Kết nối database
connectDB();

// Import dashboard controller
const dashboardController = require('./controllers/dashboardController');

// Route dashboard
app.get('/', dashboardController.getDashboard);

// Middleware redirect cho các URL cũ
app.use((req, res, next) => {
  if (req.path === '/product/list' || req.path === '/products/list') {
    return res.redirect('/products');
  }
  next();
});

app.use('/auth', authRoutes); // Thêm route cho xác thực người dùng
app.use('/api/charts', chartRoutes);
app.use('/charts', chartRoutes); // Thêm route cho trang biểu đồ
app.use('/inventory', inventoryRoutes);
app.use('/products', productRoutes);

// Xử lý lỗi
app.use((req, res, next) => {
  const error = new Error('Không tìm thấy trang!');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    status: err.status || 500,
    stack: err.stack
  });
});

// Khởi động server
const port = envConfig.PORT || 5555;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
