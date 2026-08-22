# FreshMart Deployment Guide

This guide covers deploying the FreshMart stack for production. It assumes you
have a MongoDB database (Atlas free tier works great) and optional paid services
for email + payments + AI.

## Architecture

```
Browser ──► Vite/React (static bundle, CDN) ──► /api ──► Express API (Node 20)
                                                        └─► MongoDB Atlas
```

The React app is a fully static SPA. The API is a single Node process. You can
host them anywhere that runs Node 20+ and static files.

---

## 1. Build the client

```bash
cd client
cp .env.example .env    # set VITE_RAZORPAY_KEY_ID (optional in dev)
npm ci
npm run build           # outputs to client/dist
```

`client/dist` is pure static assets (HTML/CSS/JS/fonts). It does **not** need a
Node server. `VITE_*` variables are baked in at build time — rebuild after
changing them.

---

## 2. Configure the server

```bash
cd server
cp .env.example .env
npm ci
npm run build           # compiles TS → dist/
npm run seed            # 9 categories, 41 products, 4 coupons
npm run seed:admin      # creates the admin user from ADMIN_EMAIL/ADMIN_PASSWORD
```

`npm start` runs `node dist/server.js`.

### Required variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | 5000 (or the platform's injected port) |
| `MONGODB_URI` | Atlas or any MongoDB 6+ connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | 32+ char random strings (`openssl rand -hex 32`) |
| `CLIENT_URL` | e.g. `https://freshmart.example.com` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seed admin credentials |

### Optional (feature flags)

| Variable | If missing... |
| --- | --- |
| `OPENROUTER_API_KEY` | FreshAI falls back to a grounded product answer (no LLM) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Checkout falls back to mock payment (dev only) |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASSWORD` | Order/notification emails skipped |

### Secrets / cookies

- Cookies are `httpOnly`; `Secure` is enabled automatically when
  `NODE_ENV === 'production'`. Serve the API over HTTPS.
- Set `trust proxy` is already configured for reverse proxies.

---

## 3. Hosting options

### Option A — Render (recommended for the API)

1. New **Web Service** from the `server/` directory.
2. Build command: `npm ci && npm run build`
3. Start command: `npm run start`
4. Add all environment variables from `.env.example`.
5. Set `PORT` to the value Render injects.
6. A free instance sleeps after inactivity — enable a health check on
   `/api/health` to keep it warm, or use a paid instance.

### Option B — Railway / Fly.io

- **Railway**: same as Render; `npm run start`.
- **Fly.io**: `fly launch` from `server/` with `CMD ["node", "dist/server.js"]`.

### Option C — a single VPS (Ubuntu)

```bash
# 1. Install Node 20 + nginx
# 2. Build server + client on the machine
cd server && npm ci && npm run build && npm run seed
cd ../client && npm ci && npm run build

# 3. Run the API with a process manager
npm i -g pm2
cd server && pm2 start dist/server.js --name freshmart-api

# 4. Serve the static bundle + proxy /api with nginx
```

nginx config:

```nginx
server {
  listen 80;
  server_name freshmart.example.com;

  # SPA
  root /var/www/freshmart/client/dist;
  location / {
    try_files $uri /index.html;
  }

  # API + cookies
  location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
  }

  # Long-lived refresh cookie rides on /api/auth — same origin, no extra work
}
```

Then enable HTTPS with **certbot** (`certbot --nginx`). This keeps the refresh
cookie same-origin, so no CORS complications at all.

---

## 4. MongoDB Atlas setup

1. Create a free **M0** cluster.
2. **Network Access** → allow your deployment IP (or `0.0.0.0/0` for dev).
3. **Database Access** → create a user with a strong password.
4. Connection string:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/freshmart`
5. Run `npm run seed` and `npm run seed:admin` once against the cluster.

---

## 5. CORS & cookies in production

The API is configured with:

- `CLIENT_URL` as the allowed origin.
- `credentials: true` on CORS.
- Cookies scoped to `path=/api` (access) and `path=/api/auth` (refresh).
- `sameSite: none` + `secure: true` when `NODE_ENV === 'production'`.

**If the SPA and API are on different domains**, cookies work only over HTTPS
with `SameSite=None; Secure`, which is exactly what the app sets. If you serve
both from the same domain (Option C), cookies are even simpler.

---

## 6. Post-deploy checklist

- [ ] `GET /api/health` returns 200.
- [ ] Register a customer, log in, add to cart, place a **COD** order.
- [ ] Place a **Razorpay** order with real keys and complete a test payment.
- [ ] Log in as admin (`/admin`) and check the dashboard/analytics.
- [ ] Send `/api/ai/chat` with a question — verify grounded product replies.
- [ ] Verify the refresh-token flow survives a 401 (auto refresh on navigation).
- [ ] Confirm cookies are `Secure` and `HttpOnly` in the browser devtools.