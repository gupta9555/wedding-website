require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const roleTestRoutes = require('./routes/roleTest.routes');
const providerRoutes = require('./routes/provider.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');
const blogRoutes = require('./routes/blog.routes');
const reviewRoutes = require('./routes/review.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const categoryRoutes = require('./routes/category.routes');
const reportRoutes = require('./routes/report.routes');
const advancedRoutes = require('./routes/advanced.routes');

// Connect to MongoDB
connectDB();

const app = express();

// Trust the first proxy hop. Render, Railway, Heroku, and most other hosts put
// the app behind a reverse proxy — without this, req.ip (and therefore
// express-rate-limit) sees the proxy's IP for every single request, which
// would either make rate limiting useless or lock out every real user at
// once behind a shared IP. Safe to leave on even when running locally.
app.set('trust proxy', 1);

// Core middleware
app.use(helmet()); // sets a standard set of protective HTTP headers
app.use(compression()); // gzip responses
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // concise request logging during local development
}

app.use('/api', generalLimiter);

// A friendly root response — useful for platforms (Render, UptimeRobot, etc.)
// that ping "/" by default rather than a specific health-check path.
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'EventHub API', health: '/api/health' });
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roletest', roleTestRoutes); // temporary — see routes/roleTest.routes.js
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/advanced', advancedRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`EventHub server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
