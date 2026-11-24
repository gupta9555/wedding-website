const rateLimit = require('express-rate-limit');

// Applied to every /api/* request. Generous enough not to bother real users,
// tight enough to blunt basic scraping/abuse.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Applied only to register/login/forgotpassword — the endpoints most attractive
// to credential-stuffing or brute-force attacks. Much stricter than the general limit.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again in a few minutes.' },
});

module.exports = { generalLimiter, authLimiter };
