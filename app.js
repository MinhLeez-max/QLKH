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
const adminRoutes = require('./routes/adminRoutes');
const adminRoleRoutes = require('./routes/adminRoleRoutes');
const profileRoutes = require('./routes/profileRoutes');

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

const dashboardRoutes = require('./routes/dashboardRoutes');

// Route dashboard
app.use('/', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

// Middleware redirect cho các URL cũ
app.use((req, res, next) => {
  if (req.originalUrl === '/login') {
    return res.redirect('/auth/login');
  }
  if (req.originalUrl.startsWith('/product/list') || req.originalUrl.startsWith('/products/list')) {
    return res.redirect('/products');
  }
  if (req.originalUrl.startsWith('/inventory-history')) {
    return res.redirect('/inventory/history');
  }
  if (req.originalUrl.startsWith('/dashboard-old')) {
    return res.redirect('/dashboard');
  }
  if (req.originalUrl.startsWith('/old-inventory-history')) {
    return res.redirect('/inventory/history');
  }
  next();
});

// Thêm route riêng cho /login để tránh lỗi 404
app.get('/login', (req, res) => {
  res.render('login');
});

app.use('/auth', authRoutes); // Thêm route cho xác thực người dùng
app.use('/api/charts', chartRoutes);
app.use('/charts', chartRoutes); // Thêm route cho trang biểu đồ
app.use('/inventory', inventoryRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', adminRoleRoutes);
app.use('/', profileRoutes);

// Thêm route /inventory-history trực tiếp để tránh lỗi 404
const inventoryController = require('./controllers/inventoryController');
const { authenticate, authorize } = require('./middlewares/authMiddleware');
// Removed direct route for inventory-history, will move to inventoryRoutes
// app.get('/inventory-history', authenticate, authorize(['admin', 'manager', 'user']), inventoryController.getInventoryHistory);

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
const port = process.env.PORT || 8080;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please try a different port.`);
    process.exit(1);
  } else {
    console.error('Error starting server:', err);
    process.exit(1);
  }
});

// Xử lý tắt server gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
