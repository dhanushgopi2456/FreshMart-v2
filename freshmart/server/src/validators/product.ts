import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(10, 'Description is required').max(4000),
  category: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Valid category id required'),
  brand: z.string().trim().max(120).optional().or(z.literal('')),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0).optional().nullable(),
  images: z.array(z.string().url().or(z.literal(''))).max(8).optional(),
  stock: z.number().int().min(0).max(99999),
  minStock: z.number().int().min(0).optional(),
  sku: z.string().trim().max(60).optional().or(z.literal('')),
  unit: z.string().trim().min(1, 'Unit is required').max(60),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const productQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.enum(['true', 'false']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  bestseller: z.enum(['true', 'false']).optional(),
  sort: z.enum(['popular', 'newest', 'price_asc', 'price_desc', 'rating']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
})

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(400).optional().or(z.literal('')),
  icon: z.string().trim().max(100).optional().or(z.literal('')),
  image: z.string().trim().max(400).optional().or(z.literal('')),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})