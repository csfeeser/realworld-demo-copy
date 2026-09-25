const rateLimit = require("express-rate-limit");

// Shared limiter for authenticated/authorization-performing read/write
// routes: 100 requests per IP per 15-minute window.
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
