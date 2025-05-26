# FiFai_QLKH

This is the FiFai_QLKH project.

* This commit is to test CI/CD pipeline on GitHub Actions.
## Công nghệ sử dụng
- Node.js
- Express
- MongoDB với Mongoose
- EJS template engine
- JWT cho xác thực và phân quyền

## Cấu trúc dự án
- `app.js`: Khởi tạo ứng dụng Express, cấu hình middleware, kết nối database, đăng ký route.
- `controllers/`: Xử lý logic nghiệp vụ cho các chức năng như auth, sản phẩm, kho hàng, admin, dashboard.
- `models/`: Định nghĩa schema MongoDB (User, Product, History).
- `routes/`: Định nghĩa các endpoint API và trang web.
- `middlewares/`: Middleware xác thực JWT và phân quyền theo vai trò.
- `views/`: Template EJS cho giao diện người dùng.
- `public/`: Tài nguyên tĩnh như CSS, hình ảnh.
- `data/`: File dữ liệu mẫu JSON.

## Các tính năng chính
- Đăng ký, đăng nhập, đăng xuất người dùng với JWT.
- Quản lý sản phẩm: thêm, sửa, xóa, xem danh sách.
- Quản lý kho hàng: nhập kho, xuất kho, xem lịch sử nhập xuất.
- Quản lý người dùng và vai trò với phân quyền chi tiết.
- Dashboard và biểu đồ thống kê.
- Giao diện responsive, thân thiện với người dùng.

## Cài đặt và chạy dự án
1. Clone repository:
   ```
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Cài đặt dependencies:
   ```
   npm install
   ```
3. Tạo file `.env` với các biến môi trường:
   ```
   DB_URL=mongodb://localhost:27017/your-db-name
   PORT=5555
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
4. Khởi động server:
   ```
   npm start
   ```
5. Truy cập ứng dụng tại `http://localhost:5555`

## Hướng phát triển
- Quản lý quyền trong database thay vì bộ nhớ.
- Thêm tính năng upload avatar người dùng.
- Tối ưu hóa hiệu năng và bảo mật.
- Viết unit test cho các module.

## Liên hệ
Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ nhóm phát triển.

---
