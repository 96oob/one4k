require('dotenv').config();

module.exports = {
  appName: 'one4k Official IPTV',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
  contact: {
    whatsappNumber: process.env.WHATSAPP_NUMBER || '+44 7311 129243',
    whatsappLink: process.env.WHATSAPP_LINK || 'https://wa.me/447311129243',
    telegramUsername: process.env.TELEGRAM_USERNAME || '@IPTVsupport2026',
    telegramLink: process.env.TELEGRAM_LINK || 'https://t.me/IPTVsupport2026',
    email: process.env.CONTACT_EMAIL || 'TVBillingTeam@gmail.com'
  },
  integrations: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || ''
  },
  navigation: [
    { title: 'HOME', url: '/', activeKey: 'home' },
    { title: 'APPS', url: '/apps-one4k', activeKey: 'apps' },
    { title: 'CHANNELS', url: '/channel', activeKey: 'channel' },
    { title: 'RESELLER', url: '/reseller', activeKey: 'reseller' },
    { title: 'CONTACT US', url: '/contact-us', activeKey: 'contact' }
  ]
};
