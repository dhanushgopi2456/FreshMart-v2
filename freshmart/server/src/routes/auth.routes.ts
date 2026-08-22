import { Router } from 'express'
import * as auth from '../controllers/auth.controller.js'
import { validate } from '../middleware/validation.js'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.js'
import { authenticate } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), auth.register)
router.post('/login', authLimiter, validate(loginSchema), auth.login)
router.post('/logout', auth.logout)
router.post('/refresh', auth.refresh)
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), auth.forgotPassword)
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), auth.resetPassword)
router.get('/me', authenticate, auth.getMe)

export default router