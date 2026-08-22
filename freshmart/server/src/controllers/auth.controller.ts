import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { User } from '../models/User.js'
import { Cart } from '../models/Cart.js'
import { Wishlist } from '../models/Wishlist.js'
import { env, ROLES } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'
import {
  setAuthCookies,
  clearAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth.js'
import {
  createRefreshToken,
  isValidRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
} from '../services/tokenStore.service.js'
import { forgotPasswordEmail, sendMail } from '../services/mailer.service.js'

const BCRYPT_ROUNDS = 12

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { name: string; email: string; password: string; phone?: string } })
    .validatedBody
  if (!body) throw ApiError.badRequest('Invalid registration payload')

  const existing = await User.findOne({ email: body.email })
  if (existing) throw ApiError.conflict('An account with this email already exists')

  const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS)

  const user = await User.create({
    name: body.name,
    email: body.email,
    phone: body.phone || undefined,
    passwordHash,
    role: ROLES.CUSTOMER,
    isVerified: true,
  })

  await Cart.create({ user: user._id, items: [] })
  await Wishlist.create({ user: user._id, products: [] })

  const access = signAccessToken(user._id.toString(), user.role)
  const refresh = signRefreshToken(user._id.toString())
  createRefreshToken(user._id.toString())
  setAuthCookies(res, access, refresh)

  res.status(201).json({ success: true, message: 'Account created successfully', user })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { email: string; password: string } }).validatedBody
  if (!body) throw ApiError.badRequest('Invalid login payload')

  const user = await User.findOne({ email: body.email }).select('+passwordHash')
  if (!user || !user.passwordHash) throw ApiError.unauthorized('The email or password is incorrect.')

  const ok = await bcrypt.compare(body.password, user.passwordHash)
  if (!ok) throw ApiError.unauthorized('The email or password is incorrect.')

  if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated. Contact support.')

  user.lastLogin = new Date()
  await user.save()

  const access = signAccessToken(user._id.toString(), user.role)
  const refresh = signRefreshToken(user._id.toString())
  createRefreshToken(user._id.toString())
  setAuthCookies(res, access, refresh)

  res.json({ success: true, message: 'Welcome back!', user })
})

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  const refresh = _req.cookies?.fm_refresh as string | undefined
  if (refresh) {
    revokeRefreshToken(refresh)
    try {
      const payload = verifyRefreshToken(refresh)
      revokeAllForUser(payload.sub)
    } catch {
      /* token already invalid */
    }
  }
  clearAuthCookies(res)
  res.json({ success: true, message: 'You have been logged out safely.' })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.fm_refresh as string | undefined
  if (!refreshToken) throw ApiError.unauthorized('Refresh token missing')

  let payload: { sub: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw ApiError.unauthorized('Invalid refresh token')
  }

  if (!isValidRefreshToken(refreshToken)) throw ApiError.unauthorized('Refresh token expired')

  const user = await User.findById(payload.sub)
  if (!user || !user.isActive) throw ApiError.unauthorized('Account unavailable')

  revokeRefreshToken(refreshToken)
  const access = signAccessToken(user._id.toString(), user.role)
  const newRefresh = signRefreshToken(user._id.toString())
  createRefreshToken(user._id.toString())
  setAuthCookies(res, access, newRefresh)

  res.json({ success: true, user })
})

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, user })
})

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { email: string } }).validatedBody
  const user = body?.email ? await User.findOne({ email: body.email }) : null

  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const resetToken = crypto.createHash('sha256').update(token).digest('hex')
    await user.updateOne({ resetPasswordToken: resetToken, resetPasswordExpires: Date.now() + 15 * 60 * 1000 })

    const resetUrl = `${env.clientUrl}/reset-password?token=${token}`
    await sendMail({ to: user.email, subject: 'Reset your FreshMart password', html: forgotPasswordEmail(resetUrl) })
  }

  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
})

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: { token: string; password: string }
  }).validatedBody
  if (!body) throw ApiError.badRequest('Invalid payload')

  const tokenHash = crypto.createHash('sha256').update(body.token).digest('hex')
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+passwordHash')

  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired', 'INVALID_RESET_TOKEN')

  const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS)
  user.passwordHash = passwordHash
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()

  revokeAllForUser(user._id.toString())
  clearAuthCookies(res)

  res.json({ success: true, message: 'Password updated successfully. Please sign in.' })
})