const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Page Views
router.get('/login', authController.getLoginPage);
router.get('/register', authController.getRegisterPage);
router.get('/verify-notice', authController.getVerifyNoticePage);
router.get('/verify-email', authController.getVerifyNoticePage);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/verify-success', authController.getVerifySuccessPage);

// API Endpoints
router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.post('/api/auth/resend-verification', authController.resendVerification);

module.exports = router;
