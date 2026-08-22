import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { User, type Address } from '../models/User.js'
import { Notification } from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'
import { revokeAllForUser } from '../services/tokenStore.service.js'
import { clearAuthCookies } from '../middleware/auth.js'

const BCRYPT_ROUNDS = 12

interface AddressInput {
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  landmark?: string
  isDefault?: boolean
}

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { name?: string; phone?: string; avatar?: string } })
    .validatedBody
  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.notFound('User not found')

  if (body?.name) user.name = body.name
  if (body?.phone !== undefined) user.phone = body.phone || undefined
  if (body?.avatar !== undefined) user.avatar = body.avatar || undefined
  await user.save()

  res.json({ success: true, message: 'Profile updated successfully', user })
})

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: { currentPassword: string; newPassword: string }
  }).validatedBody
  if (!body) throw ApiError.badRequest('Invalid payload')

  const user = await User.findById(req.user!.id).select('+passwordHash')
  if (!user || !user.passwordHash) throw ApiError.notFound('User not found')

  const ok = await bcrypt.compare(body.currentPassword, user.passwordHash)
  if (!ok) throw ApiError.badRequest('Current password is incorrect', 'WRONG_PASSWORD')

  user.passwordHash = await bcrypt.hash(body.newPassword, BCRYPT_ROUNDS)
  await user.save()

  revokeAllForUser(user._id.toString())
  clearAuthCookies(res)

  res.json({ success: true, message: 'Password changed. Please sign in again.' })
})

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, addresses: user.addresses })
})

async function sanitizeAddressInput(input: AddressInput) {
  return {
    fullName: input.fullName,
    phone: input.phone,
    addressLine: input.addressLine,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    landmark: input.landmark || undefined,
    isDefault: input.isDefault ?? false,
  }
}

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const input = (req as unknown as { validatedBody?: AddressInput }).validatedBody
  if (!input) throw ApiError.badRequest('Invalid address')

  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.notFound('User not found')

  if (user.addresses.length >= 10) throw ApiError.badRequest('Maximum 10 addresses allowed')

  const address = (await sanitizeAddressInput(input)) as Address
  address._id = new mongoose.Types.ObjectId()

  if (address.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((a) => {
      a.isDefault = false
    })
    address.isDefault = true
  }

  user.addresses.push(address)
  await user.save()

  res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses })
})

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const input = (req as unknown as { validatedBody?: AddressInput }).validatedBody
  if (!input) throw ApiError.badRequest('Invalid address')

  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.notFound('User not found')

  const idx = user.addresses.findIndex((a) => a._id.toString() === id)
  if (idx === -1) throw ApiError.notFound('Address not found')

  const clean = await sanitizeAddressInput(input)
  if (clean.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false
    })
  }

  Object.assign(user.addresses[idx], clean)
  await user.save()

  res.json({ success: true, message: 'Address updated', addresses: user.addresses })
})

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.notFound('User not found')

  user.addresses = user.addresses.filter((a) => a._id.toString() !== id)
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true
  }
  await user.save()

  res.json({ success: true, message: 'Address removed', addresses: user.addresses })
})

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ user: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(30)
  res.json({ success: true, notifications })
})

export const markNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ user: req.user!.id, isRead: false }, { isRead: true })
  res.json({ success: true, message: 'Notifications marked as read' })
})