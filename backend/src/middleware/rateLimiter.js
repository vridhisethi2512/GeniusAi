const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const buildLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(new ApiError(429, message));
    },
  });
};

const globalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP. Please try again later.',
});

const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

const aiLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 10),
  message: 'AI request limit reached. Please wait a moment before trying again.',
});

module.exports = { globalLimiter, authLimiter, aiLimiter };
