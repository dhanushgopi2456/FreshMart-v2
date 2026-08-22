import type { NextFunction, Request, Response } from 'express'

function cleanValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/<[^>]*>/g, '').trim()
  }
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((v) => cleanValue(v))
    }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = cleanValue(v)
    }
    return out
  }
  return value
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = cleanValue(req.body) as Request['body']
  if (req.query) req.query = cleanValue(req.query) as Request['query']
  next()
}