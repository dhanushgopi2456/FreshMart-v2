import { z } from 'zod'
import { ORDER_STATUSES } from '../models/Order.js'

export const couponSchema = z.object({
  code: z.string().trim().min(2).max(40).transform((s) => s.toUpperCase()),
  description: z.string().trim().max(300).optional().or(z.literal('')),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().min(0),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(0).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
})

export const orderStatusSchema = z.object({
  status: z.enum([...ORDER_STATUSES, 'CANCELLED'] as unknown as [string, ...string[]]),
})

export const userStatusSchema = z.object({
  isActive: z.boolean(),
})

export const userRoleSchema = z.object({
  role: z.enum(['CUSTOMER', 'ADMIN']),
})

export const inventoryUpdateSchema = z.object({
  stock: z.number().int().min(0).max(99999),
  minStock: z.number().int().min(0).optional(),
})