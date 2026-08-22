import type { NextFunction, Request, Response } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'

type Source = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source])
      ;(req as unknown as Record<string, unknown>)[`validated${source.charAt(0).toUpperCase() + source.slice(1)}`] = data
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        next(err)
        return
      }
      next(ApiError.badRequest('Invalid input'))
    }
  }
}

export function safeId(req: Request, _res: Response, next: NextFunction): void {
  const id = req.params.id ?? req.params.productId
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    next(ApiError.badRequest('Invalid identifier format', 'INVALID_ID'))
    return
  }
  next()
}