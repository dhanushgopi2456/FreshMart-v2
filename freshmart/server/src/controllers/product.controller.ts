import type { Request, Response } from 'express'
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'

interface ProductQuery {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: string
  featured?: string
  bestseller?: string
  sort?: string
  page?: number
  limit?: number
}

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  popular: { rating: -1, reviewCount: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1 },
}

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = (req as unknown as { validatedQuery?: ProductQuery }).validatedQuery ?? req.query as ProductQuery

  const filter: Record<string, unknown> = { isActive: true }

  if (q.q) {
    filter.$or = [
      { name: { $regex: q.q, $options: 'i' } },
      { description: { $regex: q.q, $options: 'i' } },
      { brand: { $regex: q.q, $options: 'i' } },
    ]
  }

  if (q.category) {
    const category = await Category.findOne({ slug: q.category }).orFail(
      ApiError.badRequest('Category not found'),
    )
    filter.category = category._id
  }

  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    const range: Record<string, number> = {}
    if (q.minPrice !== undefined) range.$gte = q.minPrice
    if (q.maxPrice !== undefined) range.$lte = q.maxPrice
    filter.discountPrice = range
    filter.$or = [{ price: range }, { discountPrice: range }]
  }

  if (q.minRating !== undefined) filter.rating = { $gte: q.minRating }
  if (q.inStock === 'true') filter.stock = { $gt: 0 }
  if (q.inStock === 'false') filter.stock = 0
  if (q.featured === 'true') filter.isFeatured = true
  if (q.bestseller === 'true') filter.isBestSeller = true

  const page = q.page ?? 1
  const limit = q.limit ?? 12
  const skip = (page - 1) * limit

  const sort = SORT_MAP[q.sort ?? 'popular'] ?? SORT_MAP.popular

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
  ])

  res.json({
    success: true,
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .orFail(ApiError.notFound('Product not found'))

  const related = await Product.find({
    category: (product.category as unknown as { _id: unknown })._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .populate('category', 'name slug')

  res.json({ success: true, product, related })
})

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .orFail(ApiError.notFound('Product not found'))
  res.json({ success: true, product })
})

export const getFeatured = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({ isFeatured: true, isActive: true, stock: { $gt: 0 } })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('category', 'name slug')
  res.json({ success: true, products })
})

export const getBestSellers = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({ isBestSeller: true, isActive: true })
    .sort({ rating: -1 })
    .limit(8)
    .populate('category', 'name slug')
  res.json({ success: true, products })
})

export const getDeals = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({
    isActive: true,
    discountPrice: { $ne: null },
    stock: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('category', 'name slug')
  res.json({ success: true, products })
})

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: {
      name: string
      slug: string
      description: string
      category: string
      brand?: string
      price: number
      discountPrice?: number
      images?: string[]
      stock: number
      minStock?: number
      sku?: string
      unit: string
      isFeatured?: boolean
      isBestSeller?: boolean
      isActive?: boolean
    }
  }).validatedBody
  if (!body) throw ApiError.badRequest('Invalid product data')

  const slugExists = await Product.findOne({ slug: body.slug })
  if (slugExists) throw ApiError.conflict('A product with this slug already exists')

  const product = await Product.create({
    ...body,
    images: body.images?.filter(Boolean) ?? [],
    discountPrice: body.discountPrice ?? null,
  })

  res.status(201).json({ success: true, message: 'Product created successfully', product })
})

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: {
      name?: string
      slug?: string
      description?: string
      category?: string
      brand?: string
      price?: number
      discountPrice?: number | null
      images?: string[]
      stock?: number
      minStock?: number
      sku?: string
      unit?: string
      isFeatured?: boolean
      isBestSeller?: boolean
      isActive?: boolean
    }
  }).validatedBody

  const product = await Product.findById(req.params.id).orFail(ApiError.notFound('Product not found'))

  if (body?.slug && body.slug !== product.slug) {
    const slugExists = await Product.findOne({ slug: body.slug, _id: { $ne: product._id } })
    if (slugExists) throw ApiError.conflict('A product with this slug already exists')
  }

  if (body) {
    if (body.images !== undefined) body.images = body.images.filter(Boolean)
    Object.assign(product, body)
  }
  await product.save()

  res.json({ success: true, message: 'Product updated successfully', product })
})

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id).orFail(
    ApiError.notFound('Product not found'),
  )
  res.json({ success: true, message: 'Product removed', id: product._id })
})