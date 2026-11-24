// Populates the Category collection with the existing PROVIDER_CATEGORIES and
// EVENT_TYPES constants, so the admin-manageable category list starts out in
// sync with what ProviderProfile/Service/Booking already validate against.
//
// Run with: node utils/seedCategories.js

require('dotenv').config();
const connectDB = require('../config/db');
const Category = require('../models/Category');
const { PROVIDER_CATEGORIES, EVENT_TYPES } = require('../utils/constants');

const run = async () => {
  await connectDB();

  try {
    const providerDocs = PROVIDER_CATEGORIES.map((name) => ({ name, type: 'provider' }));
    const eventDocs = EVENT_TYPES.map((name) => ({ name, type: 'event' }));
    const allDocs = [...providerDocs, ...eventDocs];

    let created = 0;
    let skipped = 0;

    for (const doc of allDocs) {
      const existing = await Category.findOne({ name: doc.name, type: doc.type });
      if (existing) {
        skipped += 1;
        continue;
      }
      await Category.create(doc);
      created += 1;
    }

    console.log(`Category seeding complete: ${created} created, ${skipped} already existed.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    process.exit(0);
  }
};

run();
