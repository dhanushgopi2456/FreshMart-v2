import type { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import { Order, ORDER_STATUSES } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { Coupon } from '../models/Coupon.js'
import { Product } from '../models/Product.js'
import { Notification } from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'
import payment from '../services/payment.service.js'
import { calcCouponDiscount } from './cart.controller.js'
import { sendMail, orderConfirmationEmail } from '../services/mailer.service.js'
import { env } from '../config/env.js'

const DELIVERY_FEE_THRESHOLD = 499
const DELIVERY_FEE = 40
const TAX_RATE = 0.05

interface OrderAddress {
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  landmark?: string
}

async function buildOrderPayload(userId: string, address: OrderAddress, couponCode?: string) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product')
  if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty')

  const rows: Array<{ product: { _id: string; name: string; price: number; discountPrice?: number | null; images: string[]; unit: string; stock: number; isActive: boolean }; quantity: number }> =
    (cart.items as unknown as Array<{ product: { _id: string; name: string; price: number; discountPrice?: number | null; images: string[]; unit: string; stock: number; isActive: boolean }; quantity: number }>).filter(
      (r) => r.product,
    )

  if (rows.length === 0) throw ApiError.badRequest('Your cart is empty')

  for (const row of rows) {
    if (!row.product.isActive) throw ApiError.badRequest(`${row.product.name} is no longer available`)
    if (row.product.stock < row.quantity) {
      throw ApiError.badRequest(`Only ${row.product.stock} of ${row.product.name} left in stock`, 'OUT_OF_STOCK')
    }
  }

  const items = rows.map((row) => ({
    product: row.product._id,
    name: row.product.name,
    image: row.product.images?.[0] ?? '',
    unit: row.product.unit,
    price: row.product.discountPrice ?? row.product.price,
    quantity: row.quantity,
  }))

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  let discount = 0
  let usedCouponCode: string | undefined
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true })
    if (!coupon) throw ApiError.badRequest('Invalid coupon code', 'INVALID_COUPON')
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) throw ApiError.badRequest('Coupon expired', 'COUPON_EXPIRED')
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw ApiError.badRequest('Coupon usage limit reached', 'COUPON_USED_UP')
    if (subtotal < coupon.minOrderValue) throw ApiError.badRequest(`Minimum order ₹${coupon.minOrderValue} required`)
    discount = calcCouponDiscount(coupon, subtotal)
    usedCouponCode = coupon.code
  }

  const tax = Math.round(subtotal * TAX_RATE)
  const deliveryFee = subtotal - discount >= DELIVERY_FEE_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal - discount + tax + deliveryFee

  return {
    cart,
    items,
    subtotal,
    discount,
    tax,
    deliveryFee,
    total,
    usedCouponCode,
  }
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: { shippingAddress: OrderAddress; paymentMethod: 'razorpay' | 'cod'; couponCode?: string }
  }).validatedBody
  if (!body) throw ApiError.badRequest('Invalid order data')

  const payload = await buildOrderPayload(req.user!.id, body.shippingAddress, body.couponCode)
  const orderNumber = `FM-${nanoid(6).toUpperCase()}`

  const estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000)

  let paymentReference: string | undefined
  let razorpayOrderId: string | undefined
  if (body.paymentMethod === 'razorpay') {
    const rzpOrder = await payment.createOrder(orderNumber, Math.round(payload.total * 100))
    razorpayOrderId = rzpOrder.id
    paymentReference = rzpOrder.id
  }

  const order = await Order.create({
    orderNumber,
    user: req.user!.id,
    items: payload.items,
    shippingAddress: body.shippingAddress,
    subtotal: payload.subtotal,
    discount: payload.discount,
    tax: payload.tax,
    deliveryFee: payload.deliveryFee,
    total: payload.total,
    couponCode: payload.usedCouponCode,
    paymentMethod: body.paymentMethod,
    paymentStatus: body.paymentMethod === 'cod' ? 'PENDING' : 'PENDING',
    paymentReference,
    orderStatus: 'CONFIRMED',
    estimatedDelivery,
  })

  if (payload.usedCouponCode) {
    await Coupon.updateOne({ code: payload.usedCouponCode }, { $inc: { usedCount: 1 } })
  }

  for (const item of payload.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
  }

  await Cart.updateOne({ user: req.user!.id }, { $set: { items: [], couponCode: undefined } })

  await Notification.create({
    user: req.user!.id,
    type: 'ORDER',
    title: `Order ${orderNumber} confirmed`,
    body: `Your order of ₹${payload.total} is being prepared. Estimated delivery in 30 minutes.`,
    link: `/orders/${order._id}`,
  })

  const u = await import('../models/User.js').then((m) => m.User.findById(req.user!.id))

  res.status(201).json({
    success: true,
    message: 'Order created',
    order,
    razorpay: razorpayOrderId
      ? { orderId: razorpayOrderId, amount: Math.round(payload.total * 100), currency: 'INR', key: '' }
      : null,
  })

  if (u) {
    void sendMail({
      to: u.email,
      subject: `FreshMart order ${orderNumber} confirmed`,
      html: orderConfirmationEmail(u.name, orderNumber, payload.total, `${env.clientUrl}/orders/${order._id}`),
    })
  }
})

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as {
    validatedBody?: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
  }).validatedBody
  if (!body) throw ApiError.badRequest('Invalid payment verification data')

  const order = await Order.findById(body.orderId).orFail(ApiError.notFound('Order not found'))
  if (order.user.toString() !== req.user!.id) throw ApiError.forbidden()

  if (order.paymentStatus === 'PAID') {
    res.json({ success: true, message: 'Payment already confirmed', order })
    return
  }

  const valid = payment.verifySignature(body.razorpayOrderId, body.razorpayPaymentId, body.razorpaySignature)
  if (!valid) throw ApiError.badRequest('Payment signature verification failed', 'PAYMENT_VERIFY_FAILED')

  order.paymentStatus = 'PAID'
  order.paymentId = body.razorpayPaymentId
  order.paymentReference = body.razorpayOrderId
  await order.save()

  res.json({ success: true, message: 'Payment confirmed', order })
})

export const confirmCodOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).orFail(ApiError.notFound('Order not found'))
  if (order.user.toString() !== req.user!.id) throw ApiError.forbidden()
  if (order.paymentMethod !== 'cod') throw ApiError.badRequest('Not a cash order')
  order.paymentStatus = 'PENDING'
  await order.save()
  res.json({ success: true, message: 'Order placed (cash on delivery)', order })
})

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10))

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user!.id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments({ user: req.user!.id }),
  ])

  res.json({ success: true, orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
})

export const getMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user!.id }).orFail(
    ApiError.notFound('Order not found'),
  )
  res.json({ success: true, order })
})

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user!.id }).orFail(
    ApiError.notFound('Order not found'),
  )

  const cancelable = ['CONFIRMED', 'PROCESSING', 'PACKED']
  if (!cancelable.includes(order.orderStatus)) {
    throw ApiError.badRequest('This order can no longer be cancelled')
  }

  order.orderStatus = 'CANCELLED'
  await order.save()

  for (const item of order.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
  }

  res.json({ success: true, message: 'Order cancelled', order })
})

export const orderStatuses = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, statuses: ORDER_STATUSES })
})