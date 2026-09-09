# Good News Shopping — Full Stack

This is a real server-backed starter, not a localStorage-only storefront.

Features: customer accounts, hashed passwords, server-side products, real order API, order history, stock reduction, admin dashboard, order status updates, and optional WhatsApp Cloud API notifications.

## Run
1. Install Node.js 20+.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Set a strong `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
6. Run `npm start`.
7. Open `http://localhost:3000`.
8. Admin dashboard: `http://localhost:3000/admin`.

## WhatsApp
The website's chat button opens a WhatsApp chat. Automatic owner notifications require a properly configured WhatsApp Business/Cloud API sender. Put its access token, phone-number ID, and destination number in `.env`. A normal personal WhatsApp number alone cannot make a server send automatic order notifications.

## Production
For a public store, use HTTPS, PostgreSQL/MySQL instead of the JSON file, a real payment gateway with verified webhooks, proper WhatsApp Business API configuration, backups, monitoring, and stronger security/rate limiting. Never publish `.env` or API secrets.
