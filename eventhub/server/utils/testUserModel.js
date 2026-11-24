// One-off script to verify the User model + MongoDB connection work correctly.
// Run with: node utils/testUserModel.js
// Delete or ignore this file once Phase 3 (real register/login routes) is in place.

require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  try {
    // Clean up any old test user from a previous run
    await User.deleteOne({ email: 'testuser@example.com' });

    // Create a new user — password will be hashed automatically by the pre-save hook
    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '9876543210',
      role: 'client',
    });

    console.log('User created:', user.toSafeObject());

    // Fetch the user again, explicitly including the password field
    const fetchedUser = await User.findOne({ email: 'testuser@example.com' }).select('+password');
    console.log('Stored password hash:', fetchedUser.password);

    // Confirm the plain password matches the hash
    const isMatch = await fetchedUser.matchPassword('password123');
    console.log('Password match check (should be true):', isMatch);

    const isWrongMatch = await fetchedUser.matchPassword('wrongpassword');
    console.log('Wrong password check (should be false):', isWrongMatch);
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    process.exit(0);
  }
};

run();
