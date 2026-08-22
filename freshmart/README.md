# FreshMart - 3D Organic Marketplace

A premium 3D animated full-stack grocery e-commerce platform built with the MERN stack.

## 🚀 Features

- **3D Interactive Experience** - React Three Fiber powered 3D hero, background particles, and product views
- **Full E-Commerce** - Product catalog, cart, wishlist, checkout, orders, reviews
- **AI Shopping Assistant** - OpenRouter powered chat with real product grounding
- **Secure Authentication** - JWT with refresh tokens, HTTP-only cookies, RBAC
- **Admin Dashboard** - Analytics, product/inventory/order/user management
- **Premium UI/UX** - Framer Motion, GSAP animations, Tailwind CSS, dark theme
- **Responsive Design** - Mobile-first, 360px to 1440px+ breakpoints
- **Accessibility** - WCAG AA, keyboard navigation, prefers-reduced-motion

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- React Router v6
- Tailwind CSS
- React Three Fiber + Drei + Three.js
- Framer Motion + GSAP + Lenis
- Zustand + React Hook Form + Zod
- Axios + Lucide React + Recharts

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT (access + refresh tokens)
- bcryptjs + Helmet + CORS + Rate Limiting
- Zod validation + OpenRouter AI
- Nodemailer for emails

## 📦 Project Structure

```
freshmart/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities
│   │   ├── animations/     # Animation helpers
│   │   ├── three/          # Three.js components
│   │   └── styles/         # Global styles
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   ├── validators/     # Zod schemas
│   │   └── seed/           # Database seeding
│   └── ...
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (`node -v`)
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key (for AI features)
- Razorpay account (for payments)

> **No MongoDB?** You can run the app with zero external accounts. All optional
> features (AI, email, payments) gracefully fall back to offline/test mode — the
> shop, cart, checkout (Cash on Delivery), orders and admin all work with just a
> local MongoDB or the Docker one-liner below.

### ▶️ How to run in VS Code

This project ships two apps (`client` + `server`) that must run together. The
easiest way is VS Code's built-in **Run Multiple** feature.

1. **Install the "Run Multiple" extension**
   - Open the Extensions panel (`Ctrl+Shift+X`)
   - Search **"Run Multiple"** (by drcnz) and click **Install**

2. **Tasks & launch configs are already included** — the project ships a
   pre-configured `.vscode/tasks.json` (server + client dev tasks) and a
   `.vscode/launch.json` ("Run Full Stack"). No setup needed.

   > Simpler alternative (no extension): open **two integrated terminals**
   > (`Ctrl+Shift+5` to split), then run `npm run dev` in `server/` in the first
   > and `npm run dev` in `client/` in the second.

4. **Install dependencies** (one time, in the integrated terminal):
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

5. **Create the environment files** (first run only):
   ```bash
   cd server && cp .env.example .env
   cd ../client && cp .env.example .env
   ```

6. **Run the servers** via Run Multiple (or the two terminals), then visit
   **http://localhost:5173**.

### Installation (manual)

1. **Clone and install dependencies**
```bash
cd freshmart
# Install client dependencies
cd client && npm install
# Install server dependencies
cd ../server && npm install
```

2. **Configure environment variables**
```bash
# Server
cd server
cp .env.example .env
# Edit .env with your values

# Client
cd ../client
cp .env.example .env
# Edit .env with your values
```

3. **Seed the database**
```bash
cd server
npm run seed
npm run seed:admin
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

5. **Open http://localhost:5173**

> **Startup tip:** the API serves the frontend proxy at `/api`, so if you only
> want to see the UI you can start just the server — but running both in dev is
> the intended flow.

## 🔐 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret
CLIENT_URL=http://localhost:5173
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@freshmart.com
ADMIN_PASSWORD=secure-password
ADMIN_NAME=FreshMart Admin
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=FreshMart
VITE_APP_TAGLINE=3D ORGANIC MARKETPLACE
VITE_RAZORPAY_KEY_ID=your-razorpay-key
```

## 📝 Available Scripts

### Client
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Server
```bash
npm run dev       # Start dev server with tsx watch
npm run build     # Compile TypeScript
npm run start     # Run compiled JS
npm run seed      # Seed database with sample data
npm run seed:admin # Create admin user
npm run lint      # Run ESLint
```

## 🎨 Brand Guidelines

- **Primary Background**: `#0a0f0d` (Deep midnight navy)
- **Primary Accent**: `#00d46a` (Fresh emerald green)
- **Secondary Accent**: `#00f5a0` (Soft mint)
- **Typography**: Inter + Plus Jakarta Sans
- **Theme**: Dark, premium, organic, fresh

## 🧪 Testing

```bash
# Client
cd client && npm run test

# Server
cd server && npm run test
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters, search, pagination)
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured` - Featured products
- `GET /api/products/bestsellers` - Best selling products

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:itemId` - Update item quantity
- `DELETE /api/cart/items/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/:productId` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

### AI Assistant
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/recommendations` - Get recommendations
- `POST /api/ai/product-search` - Search products via AI

### Admin (requires ADMIN role)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/inventory` - Inventory management
- `PUT /api/admin/inventory/:id` - Update stock
- `GET /api/admin/coupons` - All coupons
- `GET /api/admin/reviews` - All reviews
- `PUT /api/admin/reviews/:id/moderate` - Moderate review

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT with short-lived access tokens (15min) + refresh tokens (7d)
- HTTP-only secure cookies for refresh tokens
- Helmet.js security headers
- CORS allowlist
- Rate limiting (general, auth, AI)
- Input validation with Zod
- Role-based access control
- No client-side secrets

## ♿ Accessibility

- Semantic HTML5
- ARIA labels and roles
- Keyboard navigation
- Focus indicators
- Color contrast (WCAG AA)
- `prefers-reduced-motion` support
- Screen reader compatible

## 📱 Responsive Breakpoints

- 360px - Small mobile
- 390px - Standard mobile
- 430px - Large mobile
- 768px - Tablet
- 1024px - Desktop
- 1280px - Large desktop
- 1440px+ - Extra large

## 🚀 Deployment

A full step-by-step guide covering the production build, MongoDB Atlas, Render /
Railway / VPS + nginx hosting, HTTPS/cookie considerations, and a post-deploy
checklist lives in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

Quick summary:

### Frontend (Vercel/Netlify)
1. Connect repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Backend (Render/Railway/Fly.io)
1. Connect repository
2. Set build command: `npm run build`
3. Set start command: `npm run start`
4. Add environment variables
5. Ensure MongoDB Atlas allows your deployment IP

## ✅ Verification

The project is verified with:

```bash
# Type checking
cd server && npm run typecheck
cd client && npm run typecheck

# Linting
cd server && npm run lint       # 0 errors
cd client && npm run lint       # 0 errors

# Unit tests
cd server && npm test           # payment service (mock vs real keys)
cd client && npm test           # formatting + INR utilities

# Production build
cd client && npm run build      # code-split SPA (three/motion chunks)
```

## 📄 License

MIT License - feel free to use for learning or commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

Built with ❤️ for the FreshMart 2026 portfolio project.