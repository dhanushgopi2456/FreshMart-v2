import type { Request, Response } from 'express'
import { chatWithAI, recommendProducts, aiProductSearch } from '../services/ai.service.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { message: string } }).validatedBody
  if (!body) throw ApiError.badRequest('Message is required')

  const result = await chatWithAI(body.message)
  res.json({ success: true, ...result })
})

export const recommendations = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: { prompt?: string; budget?: number; category?: string }
  }).validatedBody ?? {}

  const result = await recommendProducts(body)
  res.json({ success: true, ...result })
})

export const productSearch = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { query: string } }).validatedBody
  if (!body) throw ApiError.badRequest('Query is required')

  const products = await aiProductSearch(body.query)
  res.json({ success: true, products })
})