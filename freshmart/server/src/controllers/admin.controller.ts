import type { Request, Response } from 'express'
import { Order, ORDER_STATUSES } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { Category } from '../models/Category.js'
import { Coupon } from '../models/Coupon.js'
import { Review } from '../models/Review.js'
import { Notification } from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    paidOrders,
    _todayOrders,
    totalOrders,
    pendingOrders,
    customers,
    products,
    lowStock,
    outOfStock,
    revenueAgg,
    todayRevenueAgg,
  ] = await Promise.all([
    Order.find({ paymentStatus: 'PAID' }).select('total createdAt'),
    Order.find({ createdAt: { $gte: todayStart } }).select('total createdAt'),
    Order.countDocuments({}),
    Order.countDocuments({ orderStatus: { $nin: ['DELIVERED', 'CANCELLED'] } }),
    User.countDocuments({ role: 'CUSTOMER' }),
    Product.countDocuments({}),
    Product.countDocuments({ $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$minStock'] }] } }),
    Product.countDocuments({ stock: 0 }),
    Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'PAID', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ])

  res.json({
    success: true,
    stats: {
      totalRevenue: revenueAgg[0]?.total ?? 0,
      todayRevenue: todayRevenueAgg[0]?.total ?? 0,
      totalOrders,
      pendingOrders,
      customers,
      products,
      lowStock,
      outOfStock,
    },
    recentOrders: paidOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6),
  })
})

export const analytics = asyncHandler(async (_req: Request, res: Response) => {
  const days = Math.min(90, Math.max(7, Number(_req.query.days) || 30))
  const start = new Date()
  start.setDate(start.getDate() - days)

  const orders = await Order.find({ createdAt: { $gte: start }, paymentStatus: 'PAID' }).select(
    'total createdAt orderStatus',
  )

  const byDay = new Map<string, { revenue: number; orders: number }>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    byDay.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 })
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    const e = byDay.get(key)
    if (e) {
      e.revenue += o.total
      e.orders += 1
    }
  }

  const bestSellers = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: '$items.name',
        qty: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: 8 },
  ])

  const statusDistribution = await Order.aggregate([
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ])

  res.json({
    success: true,
    analytics: {
      daily: [...byDay.entries()].map(([date, v]) => ({ date, ...v })),
      bestSellers,
      statusDistribution,
    },
  })
})

export const allOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 15, status, q } = req.query
  const filter: Record<string, unknown> = {}
  if (status && status !== 'ALL') filter.orderStatus = status
  if (q) {
    filter.$or = [
      { orderNumber: { $regex: String(q), $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: String(q), $options: 'i' } },
      { 'shippingAddress.phone': { $regex: String(q), $options: 'i' } },
    ]
  }

  const p = Math.max(1, Number(page))
  const l = Math.min(50, Math.max(1, Number(limit)))
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).populate('user', 'name email'),
    Order.countDocuments(filter),
  ])

  res.json({ success: true, orders, pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) } })
})

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { status: string } }).validatedBody
  if (!body || !body.status) throw ApiError.badRequest('Status required')
  if (![...ORDER_STATUSES, 'CANCELLED'].includes(body.status)) {
    throw ApiError.badRequest('Invalid order status')
  }

  const order = await Order.findById(req.params.id).orFail(ApiError.notFound('Order not found'))
  order.orderStatus = body.status as typeof order.orderStatus
  if (body.status === 'DELIVERED') {
    order.deliveredAt = new Date()
    order.paymentStatus = order.paymentMethod === 'cod' ? 'PAID' : order.paymentStatus
  }
  await order.save()

  await orderUpdateNotification(order.user.toString(), order.orderNumber, body.status)

  res.json({ success: true, message: 'Order status updated', order })
})

async function orderUpdateNotification(userId: string, orderNumber: string, status: string) {
  const statusLabel = status.replace(/_/g, ' ').toLowerCase()
  await Notification.create({
    user: userId,
    type: 'ORDER',
    title: `Order ${orderNumber} ${statusLabel}`,
    body: `Your order is now ${statusLabel}. Track live from your orders page.`,
    link: '/orders',
  })
}

export const users = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 15, q } = req.query
  const filter: Record<string, unknown> = {}
  if (q) {
    filter.$or = [
      { name: { $regex: String(q), $options: 'i' } },
      { email: { $regex: String(q), $options: 'i' } },
      { phone: { $regex: String(q), $options: 'i' } },
    ]
  }

  const p = Math.max(1, Number(page))
  const l = Math.min(50, Math.max(1, Number(limit)))
  const [list, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
    User.countDocuments(filter),
  ])

  res.json({ success: true, users: list, pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) } })
})

export const userDetail = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-passwordHash').orFail(ApiError.notFound('User not found'))
  const orderCount = await Order.countDocuments({ user: user._id })
  const orderValue = await Order.aggregate([
    { $match: { user: user._id, paymentStatus: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])
  res.json({
    success: true,
    user,
    stats: { orderCount, totalSpent: orderValue[0]?.total ?? 0 },
  })
})

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { isActive: boolean } }).validatedBody
  const user = await User.findById(req.params.id).orFail(ApiError.notFound('User not found'))
  if (user.role === 'ADMIN') throw ApiError.badRequest('Cannot deactivate another admin')
  if (body?.isActive !== undefined) user.isActive = body.isActive
  await user.save()
  res.json({ success: true, message: 'User status updated', user })
})

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { role: 'CUSTOMER' | 'ADMIN' } }).validatedBody
  const user = await User.findById(req.params.id).orFail(ApiError.notFound('User not found'))
  if (user.role === 'ADMIN' && body?.role !== 'ADMIN') throw ApiError.badRequest('Cannot demote another admin')
  if (body?.role) user.role = body.role
  await user.save()
  res.json({ success: true, message: 'User role updated', user })
})

export const inventory = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, q } = req.query
  const filter: Record<string, unknown> = {}
  if (q) {
    filter.$or = [{ name: { $regex: String(q), $options: 'i' } }, { sku: { $regex: String(q), $options: 'i' } }]
  }
  if (status === 'LOW') filter.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$minStock'] }] }
  if (status === 'OUT') filter.stock = 0
  if (status === 'IN') filter.stock = { $gt: 0 }

  const p = Math.max(1, Number(page))
  const l = Math.min(50, Math.max(1, Number(limit)))
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ stock: 1 }).skip((p - 1) * l).limit(l).populate('category', 'name'),
    Product.countDocuments(filter),
  ])

  res.json({ success: true, items, pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) } })
})

export const updateInventory = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { stock?: number; minStock?: number } }).validatedBody
  const product = await Product.findById(req.params.id).orFail(ApiError.notFound('Product not found'))
  if (body?.stock !== undefined) product.stock = body.stock
  if (body?.minStock !== undefined) product.minStock = body.minStock
  await product.save()
  res.json({ success: true, message: 'Inventory updated', product })
})

export const coupons = asyncHandler(async (_req: Request, res: Response) => {
  const list = await Coupon.find().sort({ createdAt: -1 })
  res.json({ success: true, coupons: list })
})

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: {
      code: string
      description?: string
      type: 'PERCENTAGE' | 'FIXED'
      value: number
      minOrderValue: number
      maxDiscount?: number | null
      maxUses?: number | null
      expiresAt?: string | null
      isActive?: boolean
    }
  }).validatedBody
  if (!body) throw ApiError.badRequest('Invalid coupon data')

  const existing = await Coupon.findOne({ code: body.code.toUpperCase() })
  if (existing) throw ApiError.conflict('Coupon code already exists')

  const coupon = await Coupon.create({
    ...body,
    code: body.code.toUpperCase(),
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
  })
  res.status(201).json({ success: true, message: 'Coupon created', coupon })
})

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: {
      code?: string
      description?: string
      type?: 'PERCENTAGE' | 'FIXED'
      value?: number
      minOrderValue?: number
      maxDiscount?: number | null
      maxUses?: number | null
      expiresAt?: string | null
      isActive?: boolean
    }
  }).validatedBody

  const coupon = await Coupon.findById(req.params.id).orFail(ApiError.notFound('Coupon not found'))
  if (body) {
    const clean = { ...body }
    if (clean.code) clean.code = clean.code.toUpperCase()
    if (clean.expiresAt) clean.expiresAt = new Date(clean.expiresAt).toISOString()
    Object.assign(coupon, clean)
  }
  await coupon.save()
  res.json({ success: true, message: 'Coupon updated', coupon })
})

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await Coupon.findByIdAndDelete(req.params.id).orFail(ApiError.notFound('Coupon not found'))
  res.json({ success: true, message: 'Coupon removed' })
})

export const allReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 15, status } = req.query
  const filter: Record<string, unknown> = {}
  if (status && status !== 'ALL') filter.status = status

  const p = Math.max(1, Number(page))
  const l = Math.min(50, Math.max(1, Number(limit)))
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).populate('user', 'name email').populate('product', 'name'),
    Review.countDocuments(filter),
  ])

  res.json({ success: true, reviews, pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) } })
})

export const categories = asyncHandler(async (_req: Request, res: Response) => {
  const list = await Category.find().sort({ sortOrder: 1 })
  res.json({ success: true, categories: list })
})