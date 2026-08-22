import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env, ROLES, type Role } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/User.js'

export const ACCESS_COOKIE = 'fm_access'
export const REFRESH_COOKIE = 'fm_refresh'

export interface AuthPayload {
  sub: string
  role: Role
}

export function signAccessToken(userId: string, role: Role): string {
  return jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: env.accessTokenTtl,
  } as jwt.SignOptions)
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenTtl,
  } as jwt.SignOptions)
}

export function verifyAccessToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload
  return { sub: String(decoded.sub), role: decoded.role as Role }
}

export function verifyRefreshToken(token: string): { sub: string } {
  const decoded = jwt.verify(token, env.jwtRefreshSecret) as jwt.JwtPayload
  return { sub: String(decoded.sub) }
}

export function setAuthCookies(res: Response, access: string, refresh: string): void {
  const base = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.isProd,
  }
  res.cookie(ACCESS_COOKIE, access, { ...base, maxAge: 15 * 60 * 1000, path: '/api' })
  res.cookie(REFRESH_COOKIE, refresh, {
    ...base,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  })
}

export function clearAuthCookies(res: Response): void {
  const base = { httpOnly: true, sameSite: 'lax' as const, secure: env.isProd, path: '/' as const }
  res.clearCookie(ACCESS_COOKIE, { ...base, path: '/api' })
  res.clearCookie(REFRESH_COOKIE, { ...base, path: '/api/auth' })
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role }
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_COOKIE] as string | undefined
  if (!token) {
    next(ApiError.unauthorized('Authentication required'))
    return
  }
  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    next(ApiError.unauthorized('Session expired or invalid'))
  }
}

export function authorize(...roles: Role[]): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'))
      return
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden('You do not have permission to perform this action'))
      return
    }
    next()
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(ApiError.unauthorized('Authentication required'))
    return
  }
  if (req.user.role !== ROLES.ADMIN) {
    next(ApiError.forbidden('Admin access required'))
    return
  }
  next()
}

export async function attachActiveUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id)
      if (!user || !user.isActive) {
        next(ApiError.unauthorized('Account is disabled'))
        return
      }
      req.user = { id: user._id.toString(), role: user.role }
    }
    next()
  } catch {
    next(ApiError.unauthorized('Authentication required'))
  }
}