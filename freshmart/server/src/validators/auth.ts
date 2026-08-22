import { z } from 'zod'
import { ALLOWED_ROLES } from '../config/env.js'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character')

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email'),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number')
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
    // Client-controlled role is intentionally rejected: only CUSTOMER is accepted.
    role: z.enum(ALLOWED_ROLES).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.role === 'ADMIN') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['role'],
        message: 'Cannot register as ADMIN',
      })
    }
  })

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required').max(100),
  rememberMe: z.boolean().optional(),
})

export const refreshSchema = z.object({})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().regex(/^[+]?[0-9]{10,15}$/).optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
})

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
  addressLine: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(20),
  landmark: z.string().trim().max(150).optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
})