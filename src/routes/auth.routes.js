const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, controller.signup);
router.post('/login', authLimiter, controller.login);

module.exports = router;
