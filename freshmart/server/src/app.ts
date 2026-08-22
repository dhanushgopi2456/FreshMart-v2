import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pinoHttp from 'express-pino-logger'

import { env } from './config/env.js'
import { httpLogger } from './utils/logger.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { sanitizeInput } from './middleware/sanitize.js'
import { notFoundHandler, errorHandler } from './middleware/error.js'

import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import categoryRoutes from './routes/category.routes.js'
import cartRoutes from './routes/cart.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import orderRoutes from './routes/order.routes.js'
import reviewRoutes from './routes/review.routes.js'
import aiRoutes from './routes/ai.routes.js'
import adminRoutes from './routes/admin.routes.js'
import accountRoutes from './routes/account.routes.js'
import miscRoutes from './routes/misc.routes.js'

const app = express()

app.set('trust proxy', 1)

app.use(
  helmet({
    contentSecurityPolicy: env.isProd ? undefined : false,
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  }),
)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fresh-mart-v2.vercel.app',
  'https://dhanushgopi2456.github.io',
  ...(env.clientUrl ? env.clientUrl.split(',').map((o) => o.trim()) : []),
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true)
      }
      return callback(new Error(`Blocked by CORS: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
)

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(pinoHttp({ logger: httpLogger }))
app.use(generalLimiter)
app.use(sanitizeInput)

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'freshmart-api',
    time: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/admin', adminRoutes)

/*
 * Account routes
 *
 * This enables:
 * GET    /api/account/addresses
 * POST   /api/account/addresses
 * PUT    /api/account/addresses/:id
 * DELETE /api/account/addresses/:id
 * PUT    /api/account/profile
 * PUT    /api/account/change-password
 * GET    /api/account/notifications
 * PUT    /api/account/notifications/read
 */
app.use('/api/account', accountRoutes)

app.use('/api', miscRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app