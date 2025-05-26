const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User.model'); // Adjust path as needed

describe('Kiểm thử các route Profile và Dashboard', () => {
  let server;
  let tokenNguoiDung;
  let tokenQuanTri;

  beforeAll(async () => {
    server = app.listen(4004);

    // Tạo hoặc đăng nhập người dùng thường
    const resUser = await request(server)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'userpassword' });
    tokenNguoiDung = resUser.headers['set-cookie'] ? extractTokenFromCookie(resUser.headers['set-cookie']) : resUser.body.token;
    if (!tokenNguoiDung) {
      // fallback lấy token từ cookie string
      tokenNguoiDung = extractTokenFromCookieString(resUser.headers['set-cookie']);
    }

    // Tạo hoặc đăng nhập quản trị viên
    const resAdmin = await request(server)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });
    tokenQuanTri = resAdmin.headers['set-cookie'] ? extractTokenFromCookie(resAdmin.headers['set-cookie']) : resAdmin.body.token;
    if (!tokenQuanTri) {
      tokenQuanTri = extractTokenFromCookieString(resAdmin.headers['set-cookie']);
    }
  });

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  test('GET /profile - trả về 200 và thông tin người dùng khi đã xác thực', async () => {
    const res = await request(server)
      .get('/profile')
      .set('Authorization', `Bearer ${tokenNguoiDung}`);
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Profile');
  });

  test('GET /dashboard - trả về 200 cho quản trị viên', async () => {
    const res = await request(server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${tokenQuanTri}`);
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Dashboard');
  });

  test('GET /dashboard - từ chối truy cập cho người dùng thường', async () => {
    const res = await request(server)
      .get('/dashboard')
      .set('Authorization', `Bearer ${tokenNguoiDung}`);
    expect(res.statusCode).toBe(403); // Bị cấm hoặc chuyển hướng tùy theo triển khai
  });

  test('GET /profile - từ chối truy cập cho người dùng chưa xác thực', async () => {
    const res = await request(server)
      .get('/profile');
    expect(res.statusCode).toBe(401);
  });
});

// Helper function to extract token from cookie if needed
function extractTokenFromCookie(cookies) {
  for (const cookie of cookies) {
    const match = cookie.match(/token=([^;]+);/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// Fallback helper to extract token from cookie string array
function extractTokenFromCookieString(cookieArray) {
  if (!cookieArray || cookieArray.length === 0) return null;
  for (const cookieStr of cookieArray) {
    const match = cookieStr.match(/token=([^;]+);/);
    if (match) {
      return match[1];
    }
  }
  return null;
}
