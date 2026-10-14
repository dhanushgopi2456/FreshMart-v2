# 🥬 FreshMart — 3D Organic Grocery Marketplace

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:061b12,25:064e3b,55:00a86b,80:00d46a,100:bbf7d0&height=280&section=header&text=FreshMart&fontSize=64&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Fresh%20Groceries%20%E2%80%A2%20Smart%20Shopping%20%E2%80%A2%203D%20Experience&descSize=16&descAlignY=58" width="100%" alt="FreshMart animated organic grocery banner"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=2800&pause=900&color=00D46A&center=true&vCenter=true&width=850&lines=Welcome+to+FreshMart+%F0%9F%A5%AC;A+3D+Organic+Shopping+Experience;AI-Powered+Grocery+Shopping+%F0%9F%A4%96;Built+with+React%2C+Node.js+%26+MongoDB;Designed+for+the+Modern+Web+%F0%9F%8C%90" alt="Animated FreshMart introduction"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/3D-Three.js-black?style=flat-square&logo=threedotjs"/>
  <img src="https://img.shields.io/badge/AI-OpenRouter-7C3AED?style=flat-square"/>
  <img src="https://img.shields.io/badge/Payments-Razorpay-3395FF?style=flat-square&logo=razorpay&logoColor=white"/>
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=flat-square&logo=jsonwebtokens"/>
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss"/>
</p>

<p align="center">
  <strong>🥑 A modern full-stack grocery marketplace combining immersive 3D visuals, AI-powered product discovery, secure e-commerce, and powerful administration tools.</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-3d-experience">3D Experience</a> •
  <a href="#-Full-Stack Architecture">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-Roadmap">Roadmap</a>
</p>

---

## 🌱 Overview

**FreshMart** reimagines the traditional grocery shopping experience through a premium organic-inspired interface, immersive 3D elements, AI-assisted product discovery, and a complete full-stack e-commerce workflow.

The application combines a React and TypeScript frontend with a Node.js and Express backend, MongoDB persistence, authentication, shopping workflows, payment integration, and an administrative dashboard.

### 🌟 The FreshMart Experience

<table>
<tr>
<td width="33%" align="center">

### 🥬 Discover

Explore grocery products through a modern, responsive marketplace.

</td>
<td width="33%" align="center">

### 🤖 Shop Smarter

Use AI-assisted search and product recommendations.

</td>
<td width="33%" align="center">

### 🛒 Shop Securely

Manage your cart, checkout, orders, and shopping account.

</td>
</tr>
</table>

### 🧭 Application Flow

```text
                 🥬 FRESHMART
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      🛍️ SHOPPING   🤖 AI      🌐 3D UX
          │        ASSISTANT       │
          ▼           ▼           ▼
       Products   Discovery    Animations
       Cart       Suggestions  Interactive UI
       Wishlist   AI Search    3D Scenes
          │           │           │
          └───────────┼───────────┘
                      ▼
                💳 CHECKOUT
                      │
                      ▼
                 📦 ORDERS
                      │
                      ▼
              📊 ADMIN CONTROL
```

---

## ✨ Features

### 🛍️ Modern Grocery Marketplace

- Product catalog with search and filtering
- Product details and featured products
- Shopping cart and quantity management
- Wishlist for saved products
- Customer reviews and ratings
- Responsive shopping interface

### 🤖 AI Shopping Assistant

FreshMart integrates OpenRouter-powered AI into the grocery discovery experience.

- Natural-language product search
- Product recommendations
- Conversational shopping assistance
- Product-aware responses
- AI-assisted product discovery

```text
             👤 CUSTOMER
                  │
                  ▼
          💬 AI SHOPPING CHAT
                  │
                  ▼
          🧠 AI PROCESSING
                  │
         ┌────────┼────────┐
         ▼        ▼        ▼
      🔎 Search 🎯 Suggest 🛍️ Discover
         │        │        │
         └────────┼────────┘
                  ▼
            🥬 PRODUCTS
```

AI output should be validated against actual product data before being used for availability, pricing, or checkout decisions.

### 🌐 Immersive 3D Experience

Built with Three.js, React Three Fiber, and Drei.

- Interactive 3D hero scenes
- Particle effects
- Immersive product-oriented visuals
- Smooth transitions and motion effects
- Responsive layouts
- Reduced-motion support

### 🛒 Complete Shopping Workflow

```text
🔎 Discover Products
        ↓
🛍️ Browse & Filter
        ↓
❤️ Save to Wishlist
        ↓
🛒 Manage Cart
        ↓
💳 Checkout
        ↓
📦 Track Orders
        ↓
⭐ Share Reviews
```

### 💳 Checkout and Payments

- Checkout workflow
- Razorpay payment integration
- Cash on Delivery support
- Order creation and management
- Payment status handling, where implemented

Actual payment processing requires valid provider credentials and server-side payment verification.

### 📊 Admin Dashboard

| Capability | Description |
|---|---|
| 📦 Products | Manage product information |
| 🏷️ Categories | Organize grocery categories |
| 📋 Orders | Review and manage orders |
| 👥 Users | Manage customer accounts |
| 📦 Inventory | Monitor product stock |
| 🎟️ Coupons | Manage promotional discounts |
| ⭐ Reviews | Moderate customer reviews |
| 📈 Analytics | View business activity and metrics |

### 🔐 Security

- JWT authentication
- Refresh-token rotation flow
- HTTP-only cookie support
- bcrypt password hashing
- Role-based access control
- Zod request validation
- Helmet security headers
- CORS allowlist
- API rate limiting

### ♿ Accessibility

- Semantic HTML
- Keyboard navigation
- Visible focus indicators
- ARIA labels and roles
- WCAG AA-oriented color contrast
- Screen-reader compatibility
- `prefers-reduced-motion` support

---

## 🎬 Animated Showcase

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=0:052e16,45:047857,100:00d46a&height=105&section=header&text=Fresh%20Food.%20Futuristic%20Shopping.&fontSize=25&fontColor=ffffff&animation=fadeIn" width="100%" alt="FreshMart product showcase banner"/>
</p>

<table>
<tr>
<td width="50%" align="center">

### 🥬 Product Discovery

Explore an organic-inspired grocery marketplace.

</td>
<td width="50%" align="center">

### 🌐 3D Interface

Experience immersive visuals and motion design.

</td>
</tr>
<tr>
<td width="50%" align="center">

### 🤖 AI Shopping

Discover products through conversational assistance.

</td>
<td width="50%" align="center">

### 📊 Admin Command Center

Manage products, orders, inventory, and reviews.

</td>
</tr>
</table>

> For the strongest portfolio presentation, add screenshots or a short GIF captured from your actual running application.

---

## 🌐 3D Experience

FreshMart uses a combination of 3D rendering and motion libraries to make the interface more engaging.

```mermaid
flowchart TD
    A["🌐 3D Experience"] --> B["Three.js"]
    A --> C["React Three Fiber"]
    A --> D["Drei"]
    A --> E["Animation System"]
    E --> F["Framer Motion"]
    E --> G["GSAP"]
    E --> H["Lenis"]
    B --> I["✨ Interactive Visual Interface"]
    C --> I
    D --> I
    F --> I
    G --> I
    H --> I
```

### Motion and Visual Design

- **Three.js:** 3D rendering foundation
- **React Three Fiber:** React-based 3D scene composition
- **Drei:** Supporting utilities for React Three Fiber
- **Framer Motion:** Component transitions and UI animation
- **GSAP:** Timeline-based animation
- **Lenis:** Smooth scrolling
- **Tailwind CSS:** Responsive styling and design consistency

The goal is to create an engaging interface while maintaining usable navigation, accessibility, and responsive performance.

---

## 🏗️ Full-Stack Architecture

```mermaid
flowchart TD
    USER["👤 Customer"] --> CLIENT["⚛️ React + TypeScript"]
    CLIENT --> API["📡 Axios API Client"]
    API --> SERVER["⚙️ Express + Node.js"]
    SERVER --> AUTH["🔐 Auth & RBAC"]
    AUTH --> PRODUCTS["🥬 Product Service"]
    AUTH --> CART["🛒 Cart & Wishlist"]
    AUTH --> ORDERS["📦 Order Service"]
    AUTH --> ADMIN["👑 Admin APIs"]
    SERVER --> AI["🤖 OpenRouter"]
    SERVER --> PAYMENT["💳 Razorpay"]
    PRODUCTS --> DB[("🍃 MongoDB")]
    CART --> DB
    ORDERS --> DB
    ADMIN --> DB
```

### Architecture Layers

| Layer | Responsibility |
|---|---|
| Frontend | Shopping UI, product discovery, 3D scenes, and dashboard |
| API client | HTTP communication with backend endpoints |
| Express server | Routing and application business logic |
| Authentication | Identity validation and protected access |
| Marketplace services | Products, cart, wishlist, and orders |
| AI integration | Product search and shopping assistance |
| Payment integration | Payment-provider communication |
| MongoDB | Persistent application data |

---

## 🔐 Security Architecture

```text
                🌐 CLIENT REQUEST
                       │
                       ▼
                🛡️ CORS POLICY
                       │
                       ▼
                🪖 HELMET HEADERS
                       │
                       ▼
                🚦 RATE LIMITING
                       │
                       ▼
                📝 ZOD VALIDATION
                       │
                       ▼
                🔑 JWT VALIDATION
                       │
                       ▼
                👑 RBAC CHECK
                       │
                       ▼
                🎯 CONTROLLER
                       │
                       ▼
                  🍃 MONGODB
```

### Security Practices

- Keep secrets and API keys on the server.
- Validate all incoming data.
- Enforce permissions on protected backend routes.
- Use secure password hashing.
- Configure cookie flags appropriately for production.
- Verify payment status on the server.
- Avoid trusting client-submitted prices or order totals.
- Configure CORS for trusted origins.
- Protect authentication and payment endpoints with appropriate rate limits.

---

## 👑 Admin Command Center

```mermaid
flowchart TD
    ADMIN["👑 Administrator"] --> DASH["📊 Dashboard"]
    ADMIN --> PRODUCTS["📦 Product Management"]
    ADMIN --> ORDERS["📋 Order Management"]
    ADMIN --> USERS["👥 User Management"]
    ADMIN --> INVENTORY["📦 Inventory Control"]
    ADMIN --> COUPONS["🎟️ Coupon Management"]
    ADMIN --> REVIEWS["⭐ Review Moderation"]
    DASH --> ANALYTICS["📈 Business Analytics"]
```

The administration experience brings core marketplace operations into one place, subject to the permissions implemented in the backend.

---

## 🧠 State Management and Forms

FreshMart uses lightweight state management and structured form validation.

```text
                  🧠 ZUSTAND
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       👤 Auth      🛒 Cart    ❤️ Wishlist
          │           │           │
          ▼           ▼           ▼
      User State  Cart State  Saved Products
```

- **Zustand:** Global application state
- **React Hook Form:** Form state and submission
- **Zod:** Data validation
- **Axios:** API communication
- **React Router:** Application navigation
- **Recharts:** Analytics visualizations

---

## 🧰 Technology Stack

### Frontend

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,html,css&perline=6" alt="FreshMart frontend technology icons"/>
</p>

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Three.js
- React Three Fiber
- Drei
- Framer Motion
- GSAP
- Lenis
- Zustand
- React Hook Form
- Zod
- Axios
- Lucide React
- Recharts

### Backend

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,ts&perline=6" alt="FreshMart backend technology icons"/>
</p>

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Helmet
- CORS
- Rate limiting
- Zod
- OpenRouter
- Nodemailer

### External Integrations

<p align="center">
  <img src="https://img.shields.io/badge/OpenRouter-AI%20Integration-7C3AED?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Razorpay-Payment%20Integration-3395FF?style=for-the-badge&logo=razorpay&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-Data%20Storage-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
</p>

---

## 🔌 API Highlights

The documented API groups include the following routes.

### 🔐 Authentication

```http
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### 🥬 Products

```http
GET    /api/products
GET    /api/products/:id
GET    /api/products/featured
GET    /api/products/bestsellers
```

### 🛒 Cart

```http
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
DELETE /api/cart
```

### 🤖 AI Shopping

```http
POST   /api/ai/chat
POST   /api/ai/recommendations
POST   /api/ai/product-search
```

### 👑 Administration

```http
GET    /api/admin/dashboard
GET    /api/admin/analytics
GET    /api/admin/orders
GET    /api/admin/users
GET    /api/admin/inventory
GET    /api/admin/coupons
GET    /api/admin/reviews
```

These routes are based on the project's documented API groups. Refer to the backend route definitions for request parameters, authorization requirements, and response schemas.

---

## 🎨 Design System

FreshMart follows a premium, dark organic visual identity.

| Design Element | Value |
|---|---|
| 🌑 Background | `#0a0f0d` |
| 🟢 Primary | `#00d46a` |
| 🌱 Secondary | `#00f5a0` |
| 🔤 Typography | Inter + Plus Jakarta Sans |
| 🌐 Visual style | Dark, premium, organic |
| ✨ Motion | Smooth and interactive |
| 📱 Layout | Responsive |

---

## 📱 Responsive by Design

```text
📱 360px Mobile
      ↓
📱 390px Mobile
      ↓
📱 430px Mobile
      ↓
📱 768px Tablet
      ↓
💻 1024px Laptop
      ↓
🖥️ 1280px Desktop
      ↓
🖥️ 1440px+ Large Displays
```

The project is designed for mobile, tablet, laptop, and large-screen browsing. Test 3D scenes on lower-powered devices and provide reduced-motion alternatives where appropriate.

---

## ♿ Accessibility

FreshMart's documented accessibility goals include:

- Semantic HTML
- Keyboard navigation
- Focus indicators
- ARIA labels and roles
- WCAG AA-oriented color contrast
- Screen-reader compatibility
- Reduced-motion support

---

## 📂 Project Structure

The project is organized into separate client and server applications.

```text
freshmart/
│
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       ├── types/
│       ├── utils/
│       ├── animations/
│       ├── three/
│       └── styles/
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── seed/
│
└── README.md
```

---

## 💻 Installation

### Prerequisites

- Node.js 20+
- npm
- MongoDB or MongoDB Atlas
- Git

### 1. Clone the Repository

```bash
git clone YOUR_EXISTING_REPOSITORY_URL
cd freshmart
```

Replace the placeholder with your existing repository URL.

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Configure Frontend Environment

Create the environment file expected by your Vite configuration. For example:

```env
VITE_API_URL=http://localhost:5000/api
```

Use the exact variable name and API prefix configured in your project.

### 4. Start the Frontend

```bash
npm run dev
```

### 5. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 6. Configure Backend Environment

Create a `.env` file based on the variables required by your server.

Example:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

Add Razorpay and email credentials only if the corresponding integrations are configured. Use the actual environment variable names from your code. **Never commit `.env` files or API secrets.**

### 7. Start the Backend

```bash
npm run dev
```

Check the `package.json` scripts in both applications if your development commands differ.

---

## 🧪 Testing and Quality

Recommended verification areas include:

- Registration, login, logout, and token refresh
- Role-based access control
- Product search and filtering
- Cart quantity and price calculations
- Wishlist operations
- Order creation and status management
- Server-side payment verification
- AI response validation
- Admin-only routes
- Responsive layout and accessibility
- Production build and environment configuration

Run the lint, test, and build commands configured in your repository.

---

## 📸 Screenshots and Demo


### 🏠 Homepage

<p align="center">
  <img src="https://github.com/dhanushgopi2456/My-All-Project-Screenshots/blob/main/Screenshot%202026-10-12%20161618.png" width="95%" alt="FreshMart homepage"/>
</p>

### 🛍️ Marketplace

<p align="center">
  <img src="https://github.com/dhanushgopi2456/My-All-Project-Screenshots/blob/main/Screenshot%202026-10-12%20161641.png" width="95%" alt="FreshMart product marketplace"/>
</p>

### 🤖 AI Assistant

<p align="center">
  <img src="https://github.com/dhanushgopi2456/My-All-Project-Screenshots/blob/main/Screenshot%202026-10-12%20161718.png" width="95%" alt="FreshMart AI shopping assistant"/>
</p>

### 👑 Admin Dashboard

<p align="center">
  <img src="https://github.com/dhanushgopi2456/My-All-Project-Screenshots/blob/main/Screenshot%202026-10-12%20161816.png" width="95%" alt="FreshMart administration dashboard"/>
</p>

---

## ☁️ Deployment

```mermaid
flowchart TD
    USER["🌐 Customer"] --> FRONT["Frontend Hosting"]
    FRONT --> API["Node.js / Express Hosting"]
    API --> DB[("MongoDB Atlas")]
    API --> AI["OpenRouter API"]
    API --> PAY["Razorpay"]
```

### Frontend Hosting

- Vercel
- Netlify

### Backend Hosting

- Render
- Railway
- Fly.io
- VPS with Nginx

### Deployment Checklist

- Configure production environment variables.
- Use MongoDB Atlas or another supported production database.
- Set trusted frontend origins in CORS.
- Configure HTTPS and secure cookies.
- Keep AI, payment, and email secrets server-side.
- Verify payment status on the backend.
- Test authentication and authorization after deployment.
- Review logs, errors, and production build output.

---

## 🗺️ Roadmap

```text
✅ Core E-Commerce
       ↓
✅ AI Shopping Assistant
       ↓
✅ 3D Shopping Experience
       ↓
🔮 AI Meal Planner
       ↓
🔮 Personalized Grocery Lists
       ↓
🔮 Voice Shopping Assistant
       ↓
🔮 PWA / Mobile App
       ↓
🔮 Advanced Recommendations
```

### Future Enhancements

- [ ] Voice-based product search
- [ ] AI-powered meal planning
- [ ] Personalized grocery lists
- [ ] Progressive Web App support
- [ ] Advanced recommendation engine
- [ ] Real-time order notifications
- [ ] Personalized offers
- [ ] Further performance optimizations for 3D scenes

---

## 🧠 What This Project Demonstrates

| Area | Skills Demonstrated |
|---|---|
| ⚛️ Frontend | React, TypeScript, responsive interfaces |
| 🌐 3D Web | Three.js, React Three Fiber, Drei |
| ✨ Animation | GSAP, Framer Motion, Lenis |
| ⚙️ Backend | Node.js, Express, REST APIs |
| 🗄️ Database | MongoDB, Mongoose |
| 🔐 Security | JWT, refresh tokens, RBAC, validation |
| 🤖 AI | LLM integration and product discovery |
| 💳 Payments | Razorpay integration workflow |
| 📊 Analytics | Recharts and admin dashboards |
| ♿ Accessibility | Keyboard support and reduced motion |
| ☁️ Deployment | Environment configuration and hosting |

---

## 🌟 Project Vision

> **Make grocery shopping feel less like a transaction and more like an experience.**

FreshMart combines immersive 3D visuals, AI-assisted discovery, full-stack e-commerce workflows, and administration tools in a single grocery marketplace.

## 👨‍💻 Developer

**Dhanush Gopi Kavala**

Full-Stack Developer | Software Engineering Graduate

<p align="center">
  <a href="https://github.com/dhanushgopi2456">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  <a href="https://www.linkedin.com/in/dhanush-gopi-kavala-a460a528b/">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
</p>

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:bbf7d0,35:00d46a,70:047857,100:061b12&height=170&section=footer&animation=fadeIn" width="100%" alt="FreshMart animated footer"/>
</p>

<p align="center">
  <strong>🥬 FreshMart</strong><br/>
  <em>Fresh groceries. Smarter shopping. Better experience.</em><br/><br/>
  Built with ❤️ using React • TypeScript • Node.js • MongoDB • Three.js • AI
</p>

<p align="center">
  ⭐ If you like FreshMart, consider starring the repository
</p>
