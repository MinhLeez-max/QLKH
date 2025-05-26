const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Product = require('../models/Product.modal');

describe('Product Routes', () => {
  let server;
  let tokenAdmin;
  let productId;

  beforeAll(async () => {
    server = app.listen(4003);

    // Mock login to get token for admin user
    // Adjust this part based on your auth implementation
    const res = await request(server)
      .post('/auth/login')
      .send({ username: 'admin', password: 'adminpassword' });
    tokenAdmin = res.headers['set-cookie'] ? extractTokenFromCookie(res.headers['set-cookie']) : res.body.token;

    // Create a product for testing update and delete
    const product = new Product({
      name: 'Test Product',
      sku: 'TESTSKU123',
      quantity: 10,
      unit: 'cái',
      importPrice: 100,
      salePrice: 150,
      supplier: 'Test Supplier',
      importDate: new Date(),
      note: 'Test note'
    });
    await product.save();
    productId = product._id.toString();
  });

  afterAll(async () => {
    await Product.deleteMany({ sku: 'TESTSKU123' });
    await Product.deleteMany({ sku: 'NEWSKU123' });
    await Product.deleteMany({ sku: 'DELETESKU123' });
    await mongoose.connection.close();
    server.close();
  });

  test('GET /products/update/:id - should return 200 for admin', async () => {
    const res = await request(server)
      .get(`/products/update/${productId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });

  test('POST /products/update - should update product for admin', async () => {
    const res = await request(server)
      .post('/products/update')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id: productId,
        name: 'Updated Test Product',
        sku: 'TESTSKU123',
        quantity: 20,
        unit: 'cái',
        importPrice: 110,
        salePrice: 160,
        supplier: 'Updated Supplier',
        importDate: new Date(),
        note: 'Updated note'
      });
    expect(res.statusCode).toBe(302); // Redirect after update
  });

  test('POST /products/add - should add product for admin', async () => {
    const res = await request(server)
      .post('/products/add')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        name: 'New Test Product',
        sku: 'NEWSKU123',
        quantity: 5,
        unit: 'cái',
        importPrice: 50,
        salePrice: 70,
        supplier: 'New Supplier',
        importDate: new Date(),
        note: 'New product note'
      });
    expect(res.statusCode).toBe(302); // Redirect after add
  });

  test('POST /products/delete - should delete product for admin', async () => {
    // Create a product to delete
    const product = new Product({
      name: 'Delete Test Product',
      sku: 'DELETESKU123',
      quantity: 1,
      unit: 'cái',
      importPrice: 10,
      salePrice: 15,
      supplier: 'Delete Supplier',
      importDate: new Date(),
      note: 'Delete note'
    });
    await product.save();

    const res = await request(server)
      .post('/products/delete')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ id: product._id.toString() });
    expect(res.statusCode).toBe(302); // Redirect after delete
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
