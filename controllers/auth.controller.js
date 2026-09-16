const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const emailService = require('../services/email.service');
const appConfig = require('../config/app.config');

/**
 * Render Register Page
 */
exports.getRegisterPage = (req, res) => {
  res.render('pages/auth/register', {
    pageTitle: 'Create Account — one4k Official IPTV',
    activeKey: 'register',
    config: appConfig,
    query: req.query
  });
};

/**
 * Render Login Page
 */
exports.getLoginPage = (req, res) => {
  res.render('pages/auth/login', {
    pageTitle: 'Customer Login — one4k Official IPTV',
    activeKey: 'login',
    config: appConfig,
    query: req.query
  });
};

/**
 * Render Verify Notice Page
 */
exports.getVerifyNoticePage = (req, res) => {
  res.render('pages/auth/verify-notice', {
    pageTitle: 'Verify Your Email — one4k Official IPTV',
    activeKey: '',
    config: appConfig,
    email: req.query.email || '',
    error: req.query.error || null,
    message: req.query.msg || null
  });
};

/**
 * Render Verify Success Page
 */
exports.getVerifySuccessPage = (req, res) => {
  res.render('pages/auth/verify-success', {
    pageTitle: 'Email Verified Successfully — one4k Official IPTV',
    activeKey: '',
    config: appConfig,
    email: req.query.email || ''
  });
};

/**
 * API: Register User & Send Verification Email
 */
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, plan, amount, paymentMethod, channel, type } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail }).select('+password');

    let rawToken = '';

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists and is verified. Please log in.'
        });
      }
      // User exists but unverified: update details & generate fresh token
      user.name = name.trim();
      user.phone = phone.trim();
      user.password = password; // pre-save will re-hash
      rawToken = user.generateVerificationToken();
      await user.save();
    } else {
      // Create new unverified user
      user = new User({
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password,
        role: type === 'reseller' ? 'reseller' : 'user',
        isVerified: false
      });
      rawToken = user.generateVerificationToken();
      await user.save();
    }

    // Optionally create an Order record if plan was chosen
    if (plan) {
      try {
        await Order.create({
          user: user._id,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone,
          plan: plan || 'Standard Order',
          amount: amount || '€0',
          paymentMethod: paymentMethod || 'Not Selected',
          channel: channel || 'web',
          type: type === 'reseller' ? 'reseller' : 'subscription',
          status: 'pending'
        });
      } catch (err) {
        console.warn('Order log creation note:', err.message);
      }
    }

    // Send Verification Email via Nodemailer
    await emailService.sendVerificationEmail(user, rawToken, req);

    return res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your address.',
      email: user.email,
      redirectUrl: `/verify-notice?email=${encodeURIComponent(user.email)}`
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during registration. Please try again.'
    });
  }
};

/**
 * Handle Email Verification Link (GET /verify-email/:token)
 */
exports.verifyEmail = async (req, res) => {
  try {
    const rawToken = req.params.token || req.query.token;

    if (!rawToken) {
      return res.redirect('/verify-notice?error=' + encodeURIComponent('Invalid or missing verification token.'));
    }

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('pages/auth/verify-notice', {
        pageTitle: 'Verification Failed — one4k Official IPTV',
        activeKey: '',
        config: appConfig,
        email: '',
        error: 'The verification link is invalid or has expired. Please request a new verification link below.',
        message: null
      });
    }

    // Mark as verified & clear token
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    if (user.iptvCredentials) {
      user.iptvCredentials.status = 'active';
    }
    await user.save();

    // Send 2nd Email with Credentials / Login info
    try {
      await emailService.sendWelcomeCredentialsEmail(user, '', req);
    } catch (mailErr) {
      console.warn('Welcome credentials email send warning:', mailErr.message);
    }

    return res.render('pages/auth/verify-success', {
      pageTitle: 'Email Verified Successfully — one4k Official IPTV',
      activeKey: '',
      config: appConfig,
      email: user.email
    });
  } catch (error) {
    console.error('Verify Email Error:', error);
    return res.status(500).render('pages/auth/verify-notice', {
      pageTitle: 'Verification Error — one4k Official IPTV',
      activeKey: '',
      config: appConfig,
      email: '',
      error: 'An unexpected error occurred while verifying your email.',
      message: null
    });
  }
};

/**
 * API: Resend Verification Email
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This email is already verified. Please log in.' });
    }

    const rawToken = user.generateVerificationToken();
    await user.save();

    await emailService.sendVerificationEmail(user, rawToken, req);

    return res.json({
      success: true,
      message: 'A new verification link has been sent to your email address.'
    });
  } catch (error) {
    console.error('Resend Verification Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while resending verification email.' });
  }
};

/**
 * API: Login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        message: 'Your email address is not verified yet. Please check your inbox or resend the verification link.',
        email: user.email
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};
