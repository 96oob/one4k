# one4k Official IPTV — Node.js & Express Web Application

A high-performance, production-ready **Node.js + Express + EJS** application for the **one4k** IPTV platform. This implementation preserves 100% of the original visual design, layouts, animations, typography, interactive pricing calculators, order modals, device setup guides, and responsive behavior.

---

## ⚡ Technology Stack

- **Runtime**: Node.js (v18.x or higher recommended)
- **Web Framework**: Express 4.x
- **Template Engine**: EJS (Modular layouts, reusable components, and partials)
- **Security & Headers**: Helmet (custom CSP), CORS, Rate Limiting (`express-rate-limit`)
- **Performance**: Compression (Gzip/Brotli)
- **Logging & Config**: Morgan, Dotenv

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the sample environment file and configure your settings:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000` with live reload (nodemon).

### 5. Production Start
```bash
npm start
```

---

## 📁 Project Architecture

```
TVone.V1/
├── config/
│   └── app.config.js          # Central application configuration & navigation
├── controllers/
│   ├── api.controller.js      # Contact form submission & health check APIs
│   └── page.controller.js     # Route handlers for all views
├── public/                    # Static assets
│   ├── js/
│   │   └── site-interactions.js # Interactive modals, calculators, FAQ accordions
│   ├── wp-content/            # Extracted stylesheets, fonts, icons, plugins
│   ├── wp-includes/           # Core WordPress/Elementor runtime scripts
│   └── wp-json/               # Mock REST API responses
├── routes/
│   ├── api.routes.js          # Express rate-limited API routes
│   └── index.routes.js        # Web page routes
├── views/
│   ├── layouts/
│   │   └── head.ejs           # HTML head, meta tags, fonts, stylesheets
│   ├── pages/
│   │   ├── 404.ejs            # Error 404 page
│   │   ├── apps.ejs           # IPTV app setup guides & download links
│   │   ├── cart.ejs           # Cart & checkout page
│   │   ├── channel.ejs        # 79,000+ channel & VOD lineup directory
│   │   ├── contact.ejs        # 24/7 Support contact page & WhatsApp form
│   │   ├── home.ejs           # Main homepage with pricing, FAQs, testimonials
│   │   ├── reseller.ejs       # Reseller pricing tiers & credit calculator
│   │   └── shop.ejs           # Products archive page
│   └── partials/
│       ├── footer.ejs         # Global footer
│       ├── header.ejs         # Global header navigation
│       ├── mobile-menu.ejs    # Mobile slide-out drawer menu
│       └── scripts.ejs        # Deferred JavaScript bundles & libraries
├── .env                       # Environment variables
├── package.json               # Node.js project manifest
├── server.js                  # Express server entry point & middleware stack
└── README.md
```

---

## ⚙️ Environment Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port the Express server listens on |
| `NODE_ENV` | `development` | Application mode (`development` or `production`) |
| `SITE_URL` | `http://localhost:3000` | Canonical site base URL |
| `WHATSAPP_NUMBER` | `+44 7311 129243` | Support WhatsApp contact display number |
| `WHATSAPP_LINK` | `https://wa.me/447311129243` | Direct WhatsApp click-to-chat URL |
| `TELEGRAM_USERNAME` | `@IPTVsupport2026` | Telegram handle |
| `TELEGRAM_LINK` | `https://t.me/IPTVsupport2026` | Direct Telegram link |
| `CONTACT_EMAIL` | `TVBillingTeam@gmail.com` | Official contact email address |

---

## 🌐 Routes & Endpoints

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/contact` | `POST` | Asynchronously processes contact form submissions (Rate-limited: max 10/15min) |
| `/api/health` | `GET` | System health check (returns status, uptime, environment) |

---

## 🚢 Production Deployment

### Option A: PM2 on VPS (Ubuntu/Debian)
```bash
npm install -g pm2
pm2 start server.js --name "one4k-app"
pm2 save
pm2 startup
```

### Option B: Docker
Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t one4k-app .
docker run -d -p 3000:3000 --name one4k one4k-app
```

### Option C: Platform as a Service (Render / Railway / Heroku)
1. Push the `newversion` directory to your GitHub repository.
2. Link the repository to your PaaS dashboard.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Configure environment variables (`PORT`, `NODE_ENV=production`, `WHATSAPP_NUMBER`, etc.).

---

## 🛡️ Security & Performance Highlights

1. **Helmet Protection**: Modern HTTP security headers configured to allow required Google Fonts, CDN stylesheets, and media.
2. **Gzip / Brotli Compression**: All HTML, CSS, JavaScript, and SVG assets are automatically compressed over the wire.
3. **Static File Caching**: Static assets served with caching headers in production (`maxAge: 7d`).
4. **Brute Force & Spam Prevention**: Express Rate Limiting applied to `/api/contact`.
5. **No Secret Exposure**: All sensitive business settings are loaded securely from environment variables.
