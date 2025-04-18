const mongoose = require('mongoose');
const User = require('../models/User.model');
const connectDB = require('../config/connectDB');

const createAdminUser = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin@123', // You should change this password after first login
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully with email: admin@example.com and password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
