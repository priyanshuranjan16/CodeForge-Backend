const rateLimit = require('express-rate-limit');

// Rate limiter for API endpoints (e.g. Chat Generation)
// Limit: 20 requests per minute
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after a minute'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for Auth endpoints (Login/Signup)
// Limit: 10 requests per minute
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    message: {
        success: false,
        message: 'Too many login/signup attempts, please try again after a minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter
};
