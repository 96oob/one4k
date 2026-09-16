const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });
      console.log(`📧 Nodemailer configured with SMTP host: ${host} (${user})`);
    } else {
      console.log('ℹ️  Nodemailer: No SMTP credentials in .env. Verification links will be logged to console in dev mode.');
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.initTransporter();
    }
    const from = process.env.EMAIL_FROM || '"one4k Official IPTV" <4oolmoo@gmail.com>';

    if (!this.transporter) {
      console.log('\n================== [DEV EMAIL PREVIEW] ==================');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text || 'HTML Email Sent'}`);
      console.log('=========================================================\n');
      return { preview: true, to, subject };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text: text || '',
        html
      });
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Error sending email to ${to}:`, error.message);
      // Fallback log to console so development is never blocked
      console.log(`[Dev Fallback Log] Email to: ${to} | Subject: ${subject}`);
      return { error: error.message };
    }
  }

  /**
   * 1. Send Email Verification Link
   */
  async sendVerificationEmail(user, rawToken, req) {
    const host = req ? `${req.protocol}://${req.get('host')}` : (process.env.SITE_URL || 'http://localhost:3000');
    const verifyUrl = `${host}/verify-email/${rawToken}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background-color:#060813; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#e2e8f0; }
    .wrapper { width:100%; max-width:580px; margin:30px auto; background:#0e1128; border:1px solid #1e2640; border-radius:18px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.5); }
    .header { background:linear-gradient(135deg, #1d1b4b, #0f172a); padding:32px 28px; text-align:center; border-bottom:1px solid #1e2640; }
    .logo { font-size:26px; font-weight:900; letter-spacing:1px; color:#fff; text-transform:uppercase; margin:0; }
    .logo span { color:#40cfff; }
    .content { padding:32px 28px; line-height:1.6; font-size:15px; }
    .title { font-size:22px; font-weight:700; color:#ffffff; margin:0 0 16px; text-align:center; }
    .btn-wrap { text-align:center; margin:30px 0; }
    .btn { display:inline-block; padding:15px 36px; background:linear-gradient(135deg,#7b5cff,#f040c8); color:#ffffff !important; text-decoration:none; font-weight:700; font-size:15px; border-radius:12px; box-shadow:0 8px 24px rgba(123,92,255,0.35); text-transform:uppercase; letter-spacing:0.05em; }
    .notice { background:rgba(64,207,255,0.06); border:1px solid rgba(64,207,255,0.18); border-radius:10px; padding:14px; font-size:13px; color:#94a3b8; margin:24px 0 0; }
    .footer { background:#070914; padding:20px; text-align:center; font-size:12px; color:#64748b; border-top:1px solid #131b2e; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">ONE<span>4K</span> OFFICIAL IPTV</div>
      <div style="font-size:12px; color:#94a3b8; margin-top:4px; text-transform:uppercase; letter-spacing:1px;">Account Verification</div>
    </div>
    <div class="content">
      <div class="title">Confirm Your Email Address</div>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Thank you for signing up with <strong>one4k Official IPTV</strong>. Please click the button below to verify your email address and activate your account access.</p>
      
      <div class="btn-wrap">
        <a href="${verifyUrl}" class="btn" target="_blank">Confirm Email Address</a>
      </div>

      <p style="font-size:13px; color:#94a3b8; text-align:center;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verifyUrl}" style="color:#40cfff; word-break:break-all;">${verifyUrl}</a>
      </p>

      <div class="notice">
        ⏱️ This verification link is valid for <strong>24 hours</strong>. If you did not create this account, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} one4k Official IPTV. All rights reserved.<br>
      WhatsApp Support: +44 7311 129243 | Email: TVBillingTeam@gmail.com
    </div>
  </div>
</body>
</html>`;

    const text = `Hello ${user.name},\n\nPlease verify your email address by visiting this URL:\n${verifyUrl}\n\nThis link is valid for 24 hours.\n\none4k Official Team`;

    return await this.sendEmail({
      to: user.email,
      subject: '🔐 Confirm Your Email — one4k Official IPTV',
      html,
      text
    });
  }

  /**
   * 2. Send Welcome & Login Credentials Email (Triggered upon email confirmation)
   */
  async sendWelcomeCredentialsEmail(user, rawPassword, req) {
    const host = req ? `${req.protocol}://${req.get('host')}` : (process.env.SITE_URL || 'http://localhost:3000');
    const loginUrl = `${host}/login`;
    const userSubdomain = user.iptvCredentials?.subdomain || 'client.one4k.com';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background-color:#060813; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#e2e8f0; }
    .wrapper { width:100%; max-width:580px; margin:30px auto; background:#0e1128; border:1px solid #1e2640; border-radius:18px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.5); }
    .header { background:linear-gradient(135deg, #102a45, #0f172a); padding:32px 28px; text-align:center; border-bottom:1px solid #1e2640; }
    .logo { font-size:26px; font-weight:900; letter-spacing:1px; color:#fff; text-transform:uppercase; margin:0; }
    .logo span { color:#40cfff; }
    .content { padding:32px 28px; line-height:1.6; font-size:15px; }
    .title { font-size:22px; font-weight:700; color:#34d399; margin:0 0 16px; text-align:center; }
    .card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:20px; margin:20px 0; }
    .card-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:14px; }
    .card-row:last-child { border-bottom:none; }
    .card-label { color:#94a3b8; }
    .card-val { color:#ffffff; font-weight:600; }
    .btn-wrap { text-align:center; margin:26px 0; }
    .btn { display:inline-block; padding:14px 34px; background:linear-gradient(135deg,#34d399,#059669); color:#ffffff !important; text-decoration:none; font-weight:700; font-size:15px; border-radius:12px; box-shadow:0 8px 24px rgba(52,211,153,0.30); text-transform:uppercase; letter-spacing:0.05em; }
    .footer { background:#070914; padding:20px; text-align:center; font-size:12px; color:#64748b; border-top:1px solid #131b2e; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">ONE<span>4K</span> OFFICIAL IPTV</div>
      <div style="font-size:12px; color:#34d399; margin-top:4px; text-transform:uppercase; letter-spacing:1px;">Account Activated</div>
    </div>
    <div class="content">
      <div class="title">🎉 Your Account is Active!</div>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your email has been verified successfully. Below are your official account details and access credentials:</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">User Portal:</span>
          <span class="card-val">${userSubdomain}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Login Email:</span>
          <span class="card-val">${user.email}</span>
        </div>
        ${rawPassword ? `
        <div class="card-row">
          <span class="card-label">Account Password:</span>
          <span class="card-val" style="color:#fbbf24">${rawPassword}</span>
        </div>` : ''}
        <div class="card-row">
          <span class="card-label">Status:</span>
          <span class="card-val" style="color:#34d399">Verified &amp; Active</span>
        </div>
      </div>

      <div class="btn-wrap">
        <a href="${loginUrl}" class="btn" target="_blank">Login to Dashboard</a>
      </div>

      <p style="font-size:13px; color:#94a3b8; text-align:center;">
        Need help setting up your TV or Device? Contact our 24/7 team on WhatsApp: <strong>+44 7311 129243</strong>
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} one4k Official IPTV. All rights reserved.<br>
      WhatsApp Support: +44 7311 129243 | Email: TVBillingTeam@gmail.com
    </div>
  </div>
</body>
</html>`;

    const text = `Hello ${user.name},\n\nYour account has been verified successfully!\n\nLogin URL: ${loginUrl}\nEmail: ${user.email}\n${rawPassword ? `Password: ${rawPassword}\n` : ''}\nPortal: ${userSubdomain}\n\none4k Official Team`;

    return await this.sendEmail({
      to: user.email,
      subject: '✅ Account Activated — Your one4k IPTV Access Details',
      html,
      text
    });
  }
}

module.exports = new EmailService();
