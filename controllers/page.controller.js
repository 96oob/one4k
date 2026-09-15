const appConfig = require('../config/app.config');

exports.getHome = (req, res) => {
  res.render('pages/home', {
    pageTitle: 'one4k Official IPTV — 79,000+ Live Channels | 4K & 8K',
    activeKey: 'home',
    config: appConfig
  });
};

exports.getApps = (req, res) => {
  res.render('pages/apps', {
    pageTitle: 'one4k IPTV Apps — 6 Best Free Players for one4k in 2026',
    activeKey: 'apps',
    config: appConfig
  });
};

exports.getChannel = (req, res) => {
  res.render('pages/channel', {
    pageTitle: 'Channels & VOD Lineup — one4k Official IPTV',
    activeKey: 'channel',
    config: appConfig
  });
};

exports.getReseller = (req, res) => {
  res.render('pages/reseller', {
    pageTitle: 'IPTV Reseller Program & Credits — one4k Official IPTV',
    activeKey: 'reseller',
    config: appConfig
  });
};

exports.getContact = (req, res) => {
  res.render('pages/contact', {
    pageTitle: 'Contact one4k IPTV — Support 24/7 WhatsApp & Email',
    activeKey: 'contact',
    config: appConfig
  });
};

exports.getCart = (req, res) => {
  res.render('pages/cart', {
    pageTitle: 'Cart & Checkout — one4k Official IPTV',
    activeKey: 'cart',
    config: appConfig
  });
};

exports.getShop = (req, res) => {
  res.render('pages/shop', {
    pageTitle: 'Shop - Products Archive — one4k Official IPTV',
    activeKey: 'shop',
    config: appConfig
  });
};

exports.getNotFound = (req, res) => {
  res.status(404).render('pages/404', {
    pageTitle: 'Page Not Found — one4k Official IPTV',
    activeKey: '',
    config: appConfig
  });
};
