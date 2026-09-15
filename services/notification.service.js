const appConfig = require('../config/app.config');

/**
 * Send rich notification to Telegram Bot
 */
async function sendTelegramNotification(order) {
  const token = appConfig.integrations?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = appConfig.integrations?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram Notification] Skipped — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured');
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

  try {
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const data = await res.json();
    console.log(`[Telegram Notification] Status: ${res.status}, ok: ${data.ok}`);
    return { success: data.ok, res: data };
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
    console.log('[Google Sheet] Skipped — GOOGLE_SHEET_WEBHOOK_URL not configured');
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
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log(`[Google Sheet] Status: ${res.status}, body: ${text}`);
    return { success: res.ok, body: text };
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
