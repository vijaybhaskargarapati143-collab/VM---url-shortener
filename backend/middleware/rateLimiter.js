const rateLimit = require("express-rate-limit");

// General limit for all /api routes: 100 requests per 15 minutes per IP.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a few minutes." },
});

// Stricter limit for creating links: 20 per 15 minutes per IP.
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You're creating links too quickly. Please wait a few minutes." },
});

// Limit for redirects so the redirect route can't be hammered: 300 per minute per IP.
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please slow down.",
});

module.exports = { apiLimiter, createLimiter, redirectLimiter };
