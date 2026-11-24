require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { PROVIDER_CATEGORIES, EVENT_TYPES } = require('../utils/constants');

const password = 'Password123';

async function upsertUser(data) {
  const existing = await User.findOne({ email: data.email }).select('+password');
  if (existing) {
    existing.set({
      name: data.name,
      phone: data.phone,
      role: data.role,
      isApproved: data.isApproved,
      isActive: true,
    });
    await existing.save();
    return existing;
  }

  return User.create({
    ...data,
    password: await bcrypt.hash(password, 10),
  });
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const reset = process.argv.includes('--reset');
  if (reset) {
    const seedUsers = await User.find({
      email: {
        $in: [
          'admin@eventhub.demo',
          'client@eventhub.demo',
          'photographer@eventhub.demo',
          'decorator@eventhub.demo',
        ],
      },
    }).select('_id');
    const seedUserIds = seedUsers.map((user) => user._id);
    const seedProfiles = await ProviderProfile.find({
      email: /@eventhub\.demo$/i,
    }).select('_id');
    const seedProfileIds = seedProfiles.map((profile) => profile._id);

    await Review.deleteMany({ clientId: { $in: seedUserIds } });
    await Booking.deleteMany({ clientId: { $in: seedUserIds } });
    await Service.deleteMany({ providerId: { $in: seedProfileIds } });
    await Blog.deleteMany({ author: { $in: seedUserIds } });
    await ProviderProfile.deleteMany({ _id: { $in: seedProfileIds } });
    await User.deleteMany({ _id: { $in: seedUserIds } });
  }

  for (const category of PROVIDER_CATEGORIES) {
    await Category.updateOne(
      { name: category, type: 'provider' },
      { $set: { name: category, type: 'provider', description: `${category} services`, isActive: true } },
      { upsert: true }
    );
  }

  for (const eventType of EVENT_TYPES) {
    const existing = await Category.findOne({ name: eventType });
    if (!existing) {
      await Category.create({
        name: eventType,
        type: 'event',
        description: `${eventType} events`,
        isActive: true,
      });
    }
  }

  const admin = await upsertUser({
    name: 'EventHub Admin',
    email: 'admin@eventhub.demo',
    phone: '9000000001',
    role: 'admin',
    isApproved: true,
  });

  const client = await upsertUser({
    name: 'Demo Client',
    email: 'client@eventhub.demo',
    phone: '9000000002',
    role: 'client',
    isApproved: true,
  });

  const providerData = [
    {
      email: 'photographer@eventhub.demo',
      name: 'Rahul Sharma',
      phone: '9000000003',
      businessName: 'Sharma Wedding Stories',
      categories: ['Wedding Photographer'],
      city: 'Jaipur',
      state: 'Rajasthan',
      experience: 8,
    },
    {
      email: 'decorator@eventhub.demo',
      name: 'Priya Mehta',
      phone: '9000000004',
      businessName: 'Royal Decor Studio',
      categories: ['Decorator', 'Wedding Planner'],
      city: 'Mumbai',
      state: 'Maharashtra',
      experience: 6,
    },
  ];

  const profiles = [];
  for (const data of providerData) {
    const user = await upsertUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'provider',
      isApproved: true,
    });

    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          businessName: data.businessName,
          ownerName: data.name,
          email: data.email,
          phone: data.phone,
          fullAddress: '12 Demo Residency',
          city: data.city,
          state: data.state,
          pincode: data.city === 'Jaipur' ? '302001' : '400001',
          experience: data.experience,
          categories: data.categories,
          about: `Professional ${data.categories.join(' and ')} services with years of experience creating memorable events.`,
          rating: 4.8,
          numReviews: 12,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
    profiles.push(profile);
  }

  const serviceData = [
    {
      provider: profiles[0],
      title: 'Premium Wedding Photography',
      description: 'Full-day wedding photography, candid portraits, edited highlights, and a premium digital album.',
      category: 'Wedding Photographer',
      price: 45000,
      pricingType: 'per event',
    },
    {
      provider: profiles[0],
      title: 'Engagement Shoot',
      description: 'A two-hour outdoor engagement shoot with creative poses and 50 professionally edited photographs.',
      category: 'Wedding Photographer',
      price: 15000,
      pricingType: 'per event',
    },
    {
      provider: profiles[1],
      title: 'Luxury Wedding Decor',
      description: 'Complete venue styling including floral arrangements, stage decor, lighting, entrance, and table setup.',
      category: 'Decorator',
      price: 85000,
      pricingType: 'starting from',
    },
    {
      provider: profiles[1],
      title: 'Wedding Planning Package',
      description: 'End-to-end planning support with vendor coordination, timeline management, and on-day supervision.',
      category: 'Wedding Planner',
      price: 60000,
      pricingType: 'per event',
    },
  ];

  const services = [];
  for (const data of serviceData) {
    const service = await Service.findOneAndUpdate(
      { providerId: data.provider._id, title: data.title },
      {
        $set: {
          description: data.description,
          category: data.category,
          price: data.price,
          pricingType: data.pricingType,
          availability: true,
          images: [],
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
    services.push(service);
  }

  const blogs = [
    {
      title: 'How to Plan a Stress-Free Wedding',
      category: 'Wedding Planning',
      tags: ['wedding', 'planning', 'checklist'],
      content: 'Start with your priorities, set a realistic budget, and build a month-by-month checklist. Confirm the venue and key vendors early, then leave enough time for fittings, invitations, and final details.',
    },
    {
      title: 'Choosing the Right Event Photographer',
      category: 'Photography',
      tags: ['photography', 'wedding', 'tips'],
      content: 'Review full galleries rather than only highlights, ask about delivery timelines, and discuss your preferred style. A clear shot list helps the photographer capture family groups and important moments.',
    },
  ];

  for (const data of blogs) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await Blog.updateOne(
      { title: data.title },
      { $set: { ...data, slug, author: admin._id } },
      { upsert: true, runValidators: true }
    );
  }

  const existingBooking = await Booking.findOne({
    clientId: client._id,
    serviceId: services[0]._id,
  });

  if (!existingBooking) {
    const eventDate = new Date();
    eventDate.setUTCDate(eventDate.getUTCDate() + 45);
    const booking = await Booking.create({
      clientId: client._id,
      providerId: profiles[0]._id,
      serviceId: services[0]._id,
      eventType: 'Wedding',
      eventDate,
      eventTime: '10:00 AM',
      eventLocation: 'Jaipur, Rajasthan',
      clientMessage: 'Please share availability and the complete photography package.',
      totalPrice: services[0].price,
      status: 'accepted',
    });

    await Review.updateOne(
      { bookingId: booking._id },
      {
        $set: {
          clientId: client._id,
          providerId: profiles[0]._id,
          rating: 5,
          comment: 'Excellent communication and beautiful photographs.',
        },
      },
      { upsert: true, runValidators: true }
    );
  }

  console.log('Dummy data seeded successfully.');
  console.log(`Admin: admin@eventhub.demo / ${password}`);
  console.log(`Client: client@eventhub.demo / ${password}`);
  console.log(`Providers: photographer@eventhub.demo, decorator@eventhub.demo / ${password}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
