import type { Request, Response } from 'express'
import { Category } from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 })
  res.json({ success: true, categories })
})

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id).orFail(ApiError.notFound('Category not found'))
  res.json({ success: true, category })
})

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug }).orFail(
    ApiError.notFound('Category not found'),
  )
  res.json({ success: true, category })
})

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: {
      name: string
      slug: string
      description?: string
      icon?: string
      image?: string
      sortOrder?: number
      isActive?: boolean
    }
  }).validatedBody
  if (!body) throw ApiError.badRequest('Invalid category data')

  const existing = await Category.findOne({ slug: body.slug })
  if (existing) throw ApiError.conflict('Category with this slug already exists')

  const category = await Category.create(body)
  res.status(201).json({ success: true, message: 'Category created successfully', category })
})

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: {
      name?: string
      slug?: string
      description?: string
      icon?: string
      image?: string
      sortOrder?: number
      isActive?: boolean
    }
  }).validatedBody

  const category = await Category.findById(req.params.id).orFail(ApiError.notFound('Category not found'))

  if (body?.slug && body.slug !== category.slug) {
    const existing = await Category.findOne({ slug: body.slug, _id: { $ne: category._id } })
    if (existing) throw ApiError.conflict('Category with this slug already exists')
  }

  if (body) Object.assign(category, body)
  await category.save()

  res.json({ success: true, message: 'Category updated successfully', category })
})

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id).orFail(
    ApiError.notFound('Category not found'),
  )
  res.json({ success: true, message: 'Category removed', id: category._id })
})