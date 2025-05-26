const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User.model'); // Fixed path with extension

describe('Kiểm thử chức năng Đăng nhập và Đăng ký', () => {
  let server;
  let testUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'Test@1234'
  };

  beforeAll(async () => {
    server = app.listen(4002);
    // Xóa user test nếu đã tồn tại để tránh lỗi duplicate key
    await User.deleteOne({ email: testUser.email });
    await User.deleteOne({ username: testUser.username });
  });

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
    await User.deleteOne({ username: testUser.username });
    server.close();
    await mongoose.connection.close();
  });

  test('POST /auth/register - đăng ký người dùng mới thành công', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(302); // Chuyển hướng sau khi đăng ký thành công
  });

  test('POST /auth/register - đăng ký với email đã tồn tại', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(400); // Lỗi do email trùng
    expect(res.text).toContain('Email đã tồn tại');
  });

  test('POST /auth/register - đăng ký với email không hợp lệ', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send({
        username: 'newuser',
        email: 'invalidemail',
        password: 'Test@1234'
      });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Email không hợp lệ');
  });

  test('POST /auth/register - đăng ký với mật khẩu yếu', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: '123'
      });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Mật khẩu không đủ mạnh');
  });

  test('POST /auth/login - đăng nhập thành công', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    expect(res.statusCode).toBe(302); // Chuyển hướng sau khi đăng nhập thành công
  });

  test('POST /auth/login - đăng nhập thất bại với mật khẩu sai', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword'
      });
    expect(res.statusCode).toBe(401); // Lỗi xác thực
    expect(res.text).toContain('Sai tên đăng nhập hoặc mật khẩu');
  });

  test('POST /auth/login - đăng nhập thất bại với email không tồn tại', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: 'notexist@example.com',
        password: 'Test@1234'
      });
    expect(res.statusCode).toBe(401);
    expect(res.text).toContain('Người dùng không tồn tại');
  });

  test('POST /auth/login - đăng nhập thất bại với email không hợp lệ', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: 'invalidemail',
        password: 'Test@1234'
      });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Email không hợp lệ');
  });

  test('POST /auth/login - đăng nhập thất bại với thiếu thông tin', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: '',
        password: ''
      });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Vui lòng nhập đầy đủ email và mật khẩu');
  });
});
