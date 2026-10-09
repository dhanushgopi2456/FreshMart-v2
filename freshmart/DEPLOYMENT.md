# 🚀 FreshMart — Production Deployment Guide

A complete guide to building, configuring, deploying, and verifying **FreshMart**, a full-stack grocery shopping application powered by React, TypeScript, Node.js, Express, and MongoDB.

This guide covers production deployment, database configuration, environment variables, authentication cookies, payment integration, and post-deployment verification.

---

## 📑 Table of Contents

- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [1. MongoDB Atlas Setup](#1-mongodb-atlas-setup)
- [2. Configure Environment Variables](#2-configure-environment-variables)
- [3. Build the Client](#3-build-the-client)
- [4. Build the Server](#4-build-the-server)
- [5. Deployment Options](#5-deployment-options)
- [6. CORS and Cookie Configuration](#6-cors-and-cookie-configuration)
- [7. Security Best Practices](#7-security-best-practices)
- [8. Post-Deployment Verification](#8-post-deployment-verification)
- [9. Troubleshooting](#9-troubleshooting)

---

## 🏗️ Architecture

FreshMart separates the customer-facing application from the backend API while using MongoDB Atlas for persistent data storage.

```text
                    ┌──────────────────────┐
                    │       Customer       │
                    │   Browser / Mobile   │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite SPA   │
                    │    Static Assets     │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Express REST API   │
                    │   Node.js + TS       │
                    └──────────┬───────────┘
                               │
                  ┌────────────┼─────────────┐
                  ▼            ▼             ▼
          ┌────────────┐ ┌────────────┐ ┌────────────┐
          │  MongoDB   │ │  Razorpay  │ │ OpenRouter │
          │   Atlas    │ │  Payments  │ │  FreshAI   │
          └────────────┘ └────────────┘ └────────────┘
                               │
                               ▼
                       Email Notifications
                       (Optional SMTP)
```

### Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas |
| Authentication | JWT, HTTP-only cookies |
| Payments | Razorpay (optional) |
| AI Assistant | OpenRouter (optional) |
| Email | SMTP (optional) |
| Static Hosting | CDN or static web host |
| API Hosting | Render, Railway, Fly.io, or VPS |

**Deployment model:** The frontend is a static single-page application (SPA), while the backend runs as a Node.js service.

---

## ✅ Prerequisites

Before deployment, make sure you have:

- [Node.js](https://nodejs.org/) 20 or a compatible version supported by the project
- npm and Git installed
- A [MongoDB Atlas](https://www.mongodb.com/atlas) database
- The FreshMart repository cloned locally
- Access to your deployment platform
- Production environment variables prepared

Optional services:

- [Razorpay](https://razorpay.com/) for payment processing
- [OpenRouter](https://openrouter.ai/) for FreshAI
- An SMTP provider for email notifications

Verify your local environment:

```bash
node --version
npm --version
git --version
```

Use the Node.js version supported by your dependencies and hosting platform.

---

## 1. MongoDB Atlas Setup

FreshMart uses MongoDB to store application data, including products, categories, users, carts, and orders.

### Step 1: Create a database

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a project for FreshMart.
3. Create a cluster using an available free or paid tier.
4. Open **Database Access** and create a database user.
5. Open **Network Access** and configure access for your deployment environment.

### Step 2: Get the connection string

Navigate to **Connect → Drivers** and copy the MongoDB connection string.

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/freshmart
```

Replace the placeholders with your actual database credentials and cluster hostname.

If your password contains special characters, URL-encode them in the connection string.

### Step 3: Configure network access

- Allow the deployment platform's outbound IP addresses when they are stable and documented.
- If the platform uses dynamic outbound IPs, follow its recommended secure networking configuration.
- Avoid unrestricted access such as `0.0.0.0/0` unless necessary and understood.

### Step 4: Verify the connection

After configuring the backend environment, start the server and check the logs for a successful MongoDB connection.

> **Important:** Never commit database credentials or connection strings to GitHub.

---

## 2. Configure Environment Variables

Environment variables keep deployment-specific configuration separate from application code.

### Backend configuration

Create the environment configuration using the server's example file:

```bash
cd server
```

On Windows Command Prompt:

```bat
copy .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Configure the variables supported by your application.

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Platform-dependent | API listening port |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh-token signing secret |
| `CLIENT_URL` | Yes | Public frontend origin |
| `ADMIN_EMAIL` | For admin seeding | Initial admin email |
| `ADMIN_PASSWORD` | For admin seeding | Initial admin password |
| `ADMIN_NAME` | As supported | Initial admin display name |
| `OPENROUTER_API_KEY` | Optional | FreshAI integration |
| `RAZORPAY_KEY_ID` | Optional | Payment gateway identifier |
| `RAZORPAY_KEY_SECRET` | Optional | Payment gateway secret |
| `EMAIL_HOST` | Optional | SMTP server hostname |
| `EMAIL_PORT` | Optional | SMTP server port |
| `EMAIL_USER` | Optional | SMTP username |
| `EMAIL_PASSWORD` | Optional | SMTP password or app password |

Use the exact variable names expected by your code and `.env.example`. Some integrations may require additional variables.

### Generate secure JWT secrets

On macOS or Linux:

```bash
openssl rand -hex 32
```

Generate separate values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

On Windows, you can generate secure random values with Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Run the command separately for each secret.

### Frontend configuration

```bash
cd ../client
```

Copy the example configuration:

```bat
copy .env.example .env
```

Configure public frontend variables as required:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Only include variables the frontend actually uses.

**Security note:** Vite embeds `VITE_*` values into the generated client bundle. Never place private API keys, JWT secrets, database credentials, or payment secrets in frontend environment variables.

Changes to frontend variables require a fresh production build.

---

## 3. Build the Client

The client is compiled into static assets that can be hosted on a CDN or static hosting provider.

### Step 1: Install dependencies

```bash
cd client
npm ci
```

### Step 2: Build the application

```bash
npm run build
```

The generated production files should be available in:

```text
client/
└── dist/
    ├── index.html
    └── assets/
```

### Step 3: Test the production build

If the project provides a preview script, run:

```bash
npm run preview
```

Open the local preview URL printed by Vite and verify that the application loads correctly.

### Deployment notes

- Configure SPA fallback routing so application routes resolve to `index.html`.
- Ensure API requests target the deployed backend.
- Confirm that assets and fonts load correctly.
- Rebuild the client after changing frontend environment variables.
- Do not expect server-side environment changes to modify an already-built frontend bundle.

---

## 4. Build the Server

The backend is a Node.js application written in TypeScript and compiled into JavaScript.

### Step 1: Install dependencies

```bash
cd ../server
npm ci
```

### Step 2: Compile TypeScript

```bash
npm run build
```

Confirm that the expected entry point exists:

```text
server/
└── dist/
    └── server.js
```

### Step 3: Seed application data

Populate the database with the initial catalog:

```bash
npm run seed
```

According to the current project configuration, the seed script creates:

- 9 product categories
- 41 products
- 4 coupons

Run the script against the intended database only after verifying `MONGODB_URI`.

### Step 4: Create the administrator

Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and any other variables required by the seed script.

Then run:

```bash
npm run seed:admin
```

Use a unique, strong password. Avoid running seed scripts repeatedly unless they are designed to be idempotent.

### Step 5: Start the server

```bash
npm start
```

The production start command should execute:

```bash
node dist/server.js
```

Check the terminal logs for startup errors and database connection failures.

---

## 5. Deployment Options

### Option A — Render (Recommended API Hosting Option)

Render can host the Express API as a web service.

#### Deployment steps

1. Push the latest code to GitHub.
2. Sign in to [Render](https://render.com/).
3. Create a new **Web Service** connected to your repository.
4. Configure the service root directory as `server` if the platform supports a monorepo root directory.
5. Set the build command:

```bash
npm ci && npm run build
```

6. Set the start command:

```bash
npm start
```

7. Add the backend environment variables from the previous section.
8. Set `NODE_ENV=production`.
9. Configure the service's health-check path to `/api/health` if that endpoint is implemented.
10. Deploy the service and copy its public URL.

Example:

```text
https://freshmart-api.example.com
```

Replace this example with the URL assigned to your service.

**Free-tier consideration:** Availability, sleep behavior, resource limits, and pricing depend on the current hosting plan. Check the provider's current plan details before deployment.

### Option B — Railway

Railway can also run the backend service.

1. Create a project in [Railway](https://railway.com/).
2. Deploy the GitHub repository.
3. Configure the service root directory as `server`.
4. Set the build and start commands:

```bash
npm ci && npm run build
```

```bash
npm start
```

5. Add the required environment variables.
6. Configure a public domain and verify the health endpoint.

If the project is deployed as a monorepo, make sure the platform installs dependencies from the correct directory.

### Option C — Fly.io

[Fly.io](https://fly.io/) can host a Node.js backend using an appropriate deployment configuration.

Before deploying:

- Configure the application to listen on the platform-provided port.
- Bind the server to `0.0.0.0`.
- Set production secrets using the platform's secret-management mechanism.
- Configure health checks and restart behavior.
- Confirm that the runtime version meets the application's requirements.

A Dockerfile or compatible build configuration may be needed, depending on the deployment method.

### Option D — Ubuntu VPS with Nginx

A VPS provides more control over the frontend, API, networking, and process management.

#### Step 1: Prepare the server

Install a supported Node.js version, Nginx, Git, and the tools needed to build the application.

#### Step 2: Build the application

From the project root:

```bash
cd server
npm ci
npm run build
```

Build the frontend:

```bash
cd ../client
npm ci
npm run build
```

#### Step 3: Run the API with PM2

Install PM2:

```bash
npm install -g pm2
```

Start the application:

```bash
cd ../server
pm2 start dist/server.js --name freshmart-api
pm2 save
```

Configure PM2 startup persistence according to its official instructions.

#### Step 4: Serve the frontend and proxy the API

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name freshmart.example.com;

    root /var/www/freshmart/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Update the paths, hostname, and API port to match your actual server configuration. Ensure the API listens on the port Nginx forwards to.

#### Step 5: Enable HTTPS

Configure your domain's DNS records to point to the VPS, then enable TLS with a certificate from Let's Encrypt using Certbot.

Test the Nginx configuration before reloading it:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Once HTTPS is active, verify that API requests and authentication cookies work through the public domain.

---

## 6. CORS and Cookie Configuration

FreshMart uses HTTP-only cookies for authentication. Correct cookie and CORS settings are essential for production login and refresh-token flows.

### Backend settings

Configure:

- `CLIENT_URL` to match the frontend's actual origin.
- CORS to allow that origin.
- `credentials: true` for requests that use cookies.
- Secure cookies over HTTPS in production.
- The correct cookie paths for access and refresh tokens.

The current configuration uses:

| Cookie | Path |
|---|---|
| Access token | `/api` |
| Refresh token | `/api/auth` |

The refresh-token path must match the authentication endpoints used by the application.

### Frontend requests

For cross-origin API requests, ensure the HTTP client sends credentials. For example, with Axios:

```typescript
axios.defaults.withCredentials = true;
```

Alternatively, set `withCredentials: true` on the relevant Axios instance or requests.

### Same-origin versus cross-origin deployment

**Same origin:** Hosting the frontend and API behind the same domain simplifies cookie and CORS configuration.

**Different origins:** The backend must allow the exact frontend origin and credentialed requests. Cross-site cookies generally require `SameSite=None; Secure` and HTTPS.

Remember that different subdomains and different registrable domains can have different cookie behaviors. Test the actual deployment topology rather than relying on local development behavior.

---

## 7. Security Best Practices

Before making FreshMart publicly accessible, verify the following:

- **Secrets:** Keep `.env` files out of version control. Store production secrets in the hosting platform's environment or secret manager.
- **Authentication:** Use separate, high-entropy JWT signing secrets and an appropriate token expiry policy.
- **Cookies:** Enable `HttpOnly`, `Secure` in production, and appropriate `SameSite` settings.
- **CORS:** Allow only trusted origins. Do not use a wildcard origin with credentialed requests.
- **Database:** Use a dedicated database account with the minimum permissions required.
- **Admin access:** Use a unique password and never expose administrator credentials in frontend code.
- **Payments:** Verify payment signatures and order amounts on the server. Never trust payment status supplied only by the browser.
- **Input validation:** Validate and sanitize incoming data where appropriate, and enforce authorization on protected endpoints.
- **Rate limiting:** Apply suitable limits to authentication, checkout, and other sensitive endpoints.
- **HTTPS:** Serve production traffic exclusively over HTTPS.
- **Logs:** Avoid logging passwords, access tokens, refresh tokens, payment secrets, or complete sensitive customer records.
- **Dependencies:** Review dependency vulnerabilities and update packages carefully.
- **Backups:** Configure appropriate database backups and test recovery procedures.

### Environment file hygiene

Check that local environment files are ignored by Git:

```gitignore
.env
.env.*
!.env.example
```

Review this pattern against the repository's existing `.gitignore` rules and any environment-specific filenames. Never commit real credentials.

---

## 8. Post-Deployment Verification

Run through this checklist after deployment.

### Application availability

- [ ] The frontend loads over HTTPS.
- [ ] The API responds at the deployed base URL.
- [ ] `GET /api/health` returns HTTP 200, if implemented.
- [ ] Browser routes work after a refresh.
- [ ] No critical errors appear in the browser console or server logs.

### Authentication and authorization

- [ ] A customer can register and log in.
- [ ] Protected pages reject unauthenticated requests.
- [ ] Access-token expiry triggers the intended refresh flow.
- [ ] Logout clears the appropriate authentication cookies.
- [ ] Regular users cannot access administrator-only endpoints.
- [ ] Cookies have the expected `HttpOnly`, `Secure`, and `SameSite` attributes.

### Shopping and orders

- [ ] Categories and products load from MongoDB.
- [ ] Product details display correctly.
- [ ] Add-to-cart and cart-update operations work.
- [ ] A COD order can be placed and reviewed.
- [ ] Order totals and stock validation are performed by the backend.
- [ ] Coupon validation works as expected.

### Payments, email, and AI

- [ ] Razorpay test-mode checkout works when configured.
- [ ] Payment verification happens on the backend.
- [ ] Email notifications work when SMTP is configured.
- [ ] FreshAI responds correctly when the OpenRouter key is configured.
- [ ] The documented fallback behavior works when optional services are unavailable.

### Administrator dashboard

- [ ] The administrator can log in.
- [ ] Product and category management work.
- [ ] Order management works.
- [ ] Dashboard analytics load without errors.
- [ ] Unauthorized users cannot perform administrator actions.

---

## 9. Troubleshooting

| Problem | Possible cause | Recommended action |
|---|---|---|
| Build fails | Incorrect Node version or missing dependencies | Check runtime compatibility, install dependencies, and inspect build logs |
| API returns 500 | Missing variables or backend exception | Inspect server logs and validate environment variables |
| MongoDB connection fails | Invalid URI, credentials, or network rules | Verify the URI, database user, and Atlas network configuration |
| Frontend displays a blank page | Incorrect build or asset paths | Inspect browser console and confirm the deployed build output |
| Refreshing a route returns 404 | SPA fallback is missing | Configure the static host or Nginx to serve `index.html` |
| Login works locally but not in production | Cookie, CORS, HTTPS, or domain mismatch | Verify frontend origin, credentialed requests, cookie attributes, and TLS |
| API requests return 401 | Expired token or refresh flow failure | Inspect authentication middleware, cookie paths, and refresh endpoint behavior |
| Razorpay checkout fails | Incorrect keys or backend verification issue | Confirm the key pair, test/live mode, and server-side verification |
| Emails are not delivered | Incorrect SMTP settings or provider restrictions | Verify host, port, credentials, TLS, and provider logs |
| FreshAI returns fallback responses | Missing key or upstream service failure | Verify the API key, provider availability, and server logs |
| Admin login fails | Admin seed not run or incorrect credentials | Verify seed output and administrator environment variables |

---

## 🎉 Deployment Complete

FreshMart is ready for production use once the frontend, API, database, authentication, and any enabled integrations have been configured and verified.

**Production readiness is more than a successful build.** Confirm secure access, reliable database connectivity, correct payment verification, and working authentication flows before sharing the application publicly.

### Useful Resources

- [Node.js](https://nodejs.org/)
- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Express](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Render](https://render.com/)
- [Railway](https://railway.com/)
- [Fly.io](https://fly.io/)
- [Nginx](https://nginx.org/)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [OpenRouter Documentation](https://openrouter.ai/docs)

---

<div align="center">

**🛒 FreshMart — Fresh Choices. Seamless Shopping.**

Built with ❤️ using React, TypeScript, Node.js, Express.js, and MongoDB.

</div>
