require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const appConfig = require('./config/app.config');
const indexRoutes = require('./routes/index.routes');
const apiRoutes = require('./routes/api.routes');
const pageController = require('./controllers/page.controller');

const app = express();
const PORT = appConfig.port || 3000;

// Security Middleware (configured to permit all necessary CDNs, fonts, styles, and scripts)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow external CDN fonts/scripts and inline styles without breaking visual parity
    crossOriginEmbedderPolicy: false
  })
);

// Performance Compression (Gzip / Brotli)
app.use(compression());

// CORS & Request Logging
app.use(cors());
if (appConfig.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Template Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Assets
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: appConfig.nodeEnv === 'production' ? '7d' : '0',
    etag: true
  })
);

// Map /img and desktop img paths directly if needed
app.use('/img', express.static('/Users/ayoub/Desktop/img'));
app.use('/Users/ayoub/Desktop/img', express.static('/Users/ayoub/Desktop/img'));

// Global Template Variables
app.use((req, res, next) => {
  res.locals.config = appConfig;
  res.locals.currentPath = req.path;
  next();
});

// App Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);

// 404 Catch-All Handler
app.use(pageController.getNotFound);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Application Error]:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).render('pages/404', {
    pageTitle: 'Server Error — one4k Official IPTV',
    activeKey: '',
    config: appConfig,
    error: appConfig.nodeEnv === 'development' ? err.message : 'An unexpected error occurred.'
  });
});

// Server Initialization
const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 one4k Node.js Server running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`⚙️  Environment: ${appConfig.nodeEnv}`);
  console.log('====================================================');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received: closing server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
