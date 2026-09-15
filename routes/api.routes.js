const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const apiController = require('../controllers/api.controller');

// Rate limiter for contact form to prevent spam (max 10 submissions per 15 minutes per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many contact requests from this IP. Please try again later or reach out directly on WhatsApp.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Routes
router.post('/order', contactLimiter, apiController.handleOrderSubmission);
router.post('/contact', contactLimiter, apiController.handleContact);
router.get('/health', apiController.getHealth);

module.exports = router;
