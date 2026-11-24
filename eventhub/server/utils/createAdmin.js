// One-off script to create an admin account directly in the database.
// Admins can never self-register through POST /api/auth/register (see authController.js),
// so this is the intended way to create the first admin user.
//
// Run with: node utils/createAdmin.js
// You can edit the details below, or pass them as env vars / CLI args if you prefer.

require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const ADMIN_DETAILS = {
  name: 'EventHub Admin',
  email: 'admin@eventhub.com',
  password: 'AdminPassword123', // change this after first login in a real deployment
  phone: '9999999999',
  role: 'admin',
};

const run = async () => {
  await connectDB();

  try {
    const existing = await User.findOne({ email: ADMIN_DETAILS.email });
    if (existing) {
      console.log(`An account with email ${ADMIN_DETAILS.email} already exists (role: ${existing.role}).`);
      return;
    }

    const admin = await User.create(ADMIN_DETAILS);
    console.log('Admin user created successfully:');
    console.log(admin.toSafeObject());
    console.log('\nYou can now log in with:');
    console.log(`  email: ${ADMIN_DETAILS.email}`);
    console.log(`  password: ${ADMIN_DETAILS.password}`);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
  } finally {
    process.exit(0);
  }
};

run();
