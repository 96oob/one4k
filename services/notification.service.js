const https = require('https');
const http = require('http');
const { URL } = require('url');
const appConfig = require('../config/app.config');

/**
 * Helper to make HTTP/HTTPS POST request
 */
function postJson(targetUrl, payload) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const data = JSON.stringify(payload);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'one4k-Notification-Service/1.0'
        },
        timeout: 10000
      };

      const req = client.request(options, (res) => {
        // Follow redirects (common for Google Apps Script Webhooks: 302 -> 200)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return postJson(res.headers.location, payload).then(resolve).catch(reject);
        }

        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body });
        });
      });

      req.on('error', (err) => { reject(err); });
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Send rich notification to Telegram Bot
 */
async function sendTelegramNotification(order) {
  const token = appConfig.integrations?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = appConfig.integrations?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram Notification] Skipped — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env');
    return { skipped: true };
  }

  const emoji = order.type === 'reseller' ? '💼' : '🚀';
  const title = order.type === 'reseller' ? 'NEW RESELLER APPLICATION' : 'NEW ONE4K IPTV ORDER';

  const message = [
    `${emoji} <b>${title}</b>`,
    `━━━━━━━━━━━━━━━━━━━`,
    `📦 <b>Plan / Package:</b> ${order.plan || 'N/A'}`,
    `💰 <b>Amount:</b> ${order.amount || 'N/A'}`,
    `💳 <b>Payment Method:</b> ${order.paymentMethod || 'N/A'}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>Customer Name:</b> ${order.name || 'Not provided'}`,
    `📧 <b>Email Address:</b> ${order.email || 'N/A'}`,
    `📱 <b>WhatsApp / Tel:</b> ${order.phone || 'N/A'}`,
    `🌍 <b>Country:</b> ${order.country || 'N/A'}`,
    order.username ? `🔑 <b>Username Pref:</b> ${order.username}` : '',
    order.password ? `🔒 <b>Password Pref:</b> ${order.password}` : '',
    `━━━━━━━━━━━━━━━━━━━`,
    `📲 <b>Sent via:</b> ${(order.channel || 'whatsapp').toUpperCase()}`,
    `⏱️ <b>Date:</b> ${new Date().toLocaleString('en-GB', { timeZone: 'UTC' })} UTC`
  ].filter(Boolean).join('\n');

  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  try {
    const res = await postJson(telegramUrl, payload);
    console.log(`[Telegram Notification] Status: ${res.statusCode}`);
    return { success: true, res };
  } catch (err) {
    console.error('[Telegram Notification] Error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Append row to Google Sheet via Google Apps Script Webhook
 */
async function sendGoogleSheetRow(order) {
  const webhookUrl = appConfig.integrations?.googleSheetWebhookUrl || process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[Google Sheet] Skipped — GOOGLE_SHEET_WEBHOOK_URL not configured in .env');
    return { skipped: true };
  }

  const payload = {
    plan: order.plan || 'N/A',
    amount: order.amount || 'N/A',
    name: order.name || 'Not provided',
    email: order.email || 'N/A',
    phone: order.phone || 'N/A',
    country: order.country || 'N/A',
    paymentMethod: order.paymentMethod || 'N/A',
    channel: order.channel || 'whatsapp',
    type: order.type || 'subscription',
    timestamp: new Date().toISOString()
  };

  try {
    const res = await postJson(webhookUrl, payload);
    console.log(`[Google Sheet] Status: ${res.statusCode}`);
    return { success: true, res };
  } catch (err) {
    console.error('[Google Sheet] Error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Process all notifications asynchronously without blocking
 */
function processOrderNotifications(order) {
  Promise.allSettled([
    sendTelegramNotification(order),
    sendGoogleSheetRow(order)
  ]).catch(err => {
    console.error('[Notification Dispatch Error]:', err);
  });
}

module.exports = {
  sendTelegramNotification,
  sendGoogleSheetRow,
  processOrderNotifications
};
