const appConfig = require('../config/app.config');
const notificationService = require('../services/notification.service');

/**
 * Handle Order / Lead Submission from Modal
 */
exports.handleOrderSubmission = async (req, res) => {
  try {
    const {
      plan,
      amount,
      name,
      email,
      phone,
      country,
      paymentMethod,
      channel,
      type,
      username,
      password
    } = req.body;

    const orderData = {
      plan: (plan || '').trim(),
      amount: (amount || '').trim(),
      name: (name || '').trim(),
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      country: (country || '').trim(),
      paymentMethod: (paymentMethod || '').trim(),
      channel: (channel || 'whatsapp').trim(),
      type: (type || 'subscription').trim(),
      username: (username || '').trim(),
      password: (password || '').trim()
    };

    console.log('[Order Submission Received]', orderData.plan, '—', orderData.name, '—', orderData.email);

    // Process Telegram & Google Sheets in background without blocking
    notificationService.processOrderNotifications(orderData);

    return res.status(200).json({
      success: true,
      message: 'Order received and logged successfully.'
    });
  } catch (error) {
    console.error('Order submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing order.'
    });
  }
};

/**
 * Handle Contact Form Submission
 */
exports.handleContact = async (req, res) => {
  try {
    const {
      'your-name': yourName,
      'your-email': yourEmail,
      'your-subject': yourSubject,
      'your-message': yourMessage,
      name,
      email,
      subject,
      message,
      phone
    } = req.body;

    const senderName = (yourName || name || '').trim();
    const senderEmail = (yourEmail || email || '').trim();
    const senderMessage = (yourMessage || message || '').trim();
    const senderSubject = (yourSubject || subject || 'New Website Contact Form Submission').trim();
    const senderPhone = (phone || '').trim();

    // Validation
    if (!senderEmail || !senderMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email address and message.'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    console.log('[Contact Form Submission Received]');
    console.log(`Name: ${senderName || 'Anonymous'}`);
    console.log(`Email: ${senderEmail}`);
    console.log(`Phone: ${senderPhone || 'N/A'}`);
    console.log(`Subject: ${senderSubject}`);
    console.log(`Message: ${senderMessage}`);

    // Also forward contact form submission to Telegram in background
    notificationService.sendTelegramNotification({
      type: 'contact',
      plan: `Contact Form: ${senderSubject}`,
      amount: 'N/A',
      name: senderName,
      email: senderEmail,
      phone: senderPhone,
      country: 'N/A',
      paymentMethod: 'Contact Form',
      channel: 'contact_form'
    }).catch(() => {});

    // Return success response to user
    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Our support team will reply shortly.'
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing your request. Please try contacting us on WhatsApp.'
    });
  }
};

/**
 * System Health Check Endpoint
 */
exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv
  });
};
