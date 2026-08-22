import { z } from 'zod'

export const cartItemSchema = z.object({
  productId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Valid product id required'),
  quantity: z.number().int().min(1).max(99),
})

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().min(1).max(99),
})

export const applyCouponSchema = z.object({
  code: z.string().trim().min(2).max(40),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(150).optional().or(z.literal('')),
  text: z.string().trim().min(5, 'Review must be at least 5 characters').max(2000),
})

export const orderCreateSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(100),
    phone: z.string().trim().regex(/^[+]?[0-9]{10,15}$/),
    addressLine: z.string().trim().min(5).max(300),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(3).max(20),
    landmark: z.string().trim().max(150).optional().or(z.literal('')),
  }),
  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().trim().max(40).optional().or(z.literal('')),
  addressId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
})

export const paymentVerifySchema = z.object({
  orderId: z.string().regex(/^[a-fA-F0-9]{24}$/),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
})

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(400).optional().or(z.literal('')),
})