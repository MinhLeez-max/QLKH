const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const connectDB = require('../config/connectDB');

const usersData = [
  { username: 'admin1', email: 'admin1@example.com', password: 'password123', role: 'admin' },
  { username: 'warehouse_manager1', email: 'wm1@example.com', password: 'password123', role: 'warehouse_manager' },
  { username: 'user1', email: 'user1@example.com', password: 'password123', role: 'user' },
  { username: 'user2', email: 'user2@example.com', password: 'password123', role: 'user' },
  { username: 'warehouse_manager2', email: 'wm2@example.com', password: 'password123', role: 'warehouse_manager' },
  { username: 'admin2', email: 'admin2@example.com', password: 'password123', role: 'admin' },
  { username: 'user3', email: 'user3@example.com', password: 'password123', role: 'user' },
  { username: 'user4', email: 'user4@example.com', password: 'password123', role: 'user' },
  { username: 'warehouse_manager3', email: 'wm3@example.com', password: 'password123', role: 'warehouse_manager' },
  { username: 'admin3', email: 'admin3@example.com', password: 'password123', role: 'admin' }
];

async function seedUsers() {
  try {
    await connectDB();
    console.log('Connected to DB');

    for (const userData of usersData) {
      const existingUser = await User.findOne({ $or: [{ username: userData.username }, { email: userData.email }] });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = new User({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        });
        await user.save();
        console.log(`User ${user.username} created`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }

    console.log('User seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
