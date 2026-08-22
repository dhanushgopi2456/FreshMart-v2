import type { Request, Response } from 'express'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { Coupon } from '../models/Coupon.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'

interface CartItemInput {
  productId: string
  quantity: number
}

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product')

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    })
  }

  return cart
}

/**
 * Safely get a product ID from either:
 * - a populated Product document
 * - a MongoDB ObjectId
 * - a string
 * - null/undefined
 */
function getProductId(value: unknown): string | null {
  if (!value) return null

  if (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value
  ) {
    const id = (value as { _id?: unknown })._id
    return id ? String(id) : null
  }

  try {
    return String(value)
  } catch {
    return null
  }
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id)

  const summary = computeSummary(
    cart.items as unknown as CartRow[],
  )

  let coupon: {
    code: string
    type: string
    value: number
    maxDiscount?: number
    description?: string
  } | null = null

  if (cart.couponCode) {
    const c = await Coupon.findOne({
      code: cart.couponCode.toUpperCase(),
      isActive: true,
    })

    if (c) {
      coupon = {
        code: c.code,
        type: c.type,
        value: c.value,
        maxDiscount: c.maxDiscount,
        description: c.description,
      }
    }
  }

  res.json({
    success: true,
    cart: {
      ...cart.toObject(),
      summary,
    },
    coupon,
  })
})

interface CartRow {
  product: {
    _id: string
    name: string
    price: number
    discountPrice?: number | null
    images: string[]
    unit: string
    stock: number
    isActive: boolean
  } | null
  quantity: number
  priceSnapshot: number
}

export function computeSummary(rows: CartRow[]) {
  const valid = rows.filter(
    (row) => row && row.product,
  )

  const subtotal = valid.reduce(
    (sum, row) =>
      sum + row.priceSnapshot * row.quantity,
    0,
  )

  const discountFromMrp = valid.reduce(
    (sum, row) =>
      sum +
      Math.max(
        0,
        row.product!.price - row.priceSnapshot,
      ) *
        row.quantity,
    0,
  )

  const tax = Math.round(subtotal * 0.05)

  const deliveryFee = subtotal >= 499 ? 0 : 40

  return {
    itemsCount: valid.reduce(
      (sum, row) => sum + row.quantity,
      0,
    ),
    subtotal,
    discountFromMrp,
    tax,
    deliveryFee,
  }
}

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const body = (
    req as unknown as {
      validatedBody?: CartItemInput
    }
  ).validatedBody

  if (!body) {
    throw ApiError.badRequest('Invalid cart item')
  }

  const product = await Product.findById(
    body.productId,
  ).orFail(
    ApiError.notFound('Product not found'),
  )

  if (!product.isActive) {
    throw ApiError.badRequest(
      'Product is not available',
    )
  }

  if (product.stock < body.quantity) {
    throw ApiError.badRequest(
      `Only ${product.stock} units left in stock`,
      'OUT_OF_STOCK',
    )
  }

  const cart = await getOrCreateCart(req.user!.id)

  const price =
    product.discountPrice ?? product.price

  /*
   * IMPORTANT:
   *
   * items.product may be:
   * - a populated Product object
   * - an ObjectId
   * - null if the referenced product was deleted
   *
   * Never call .toString() directly on it.
   */
  const existing = cart.items.find((item) => {
    const existingProductId = getProductId(
      item.product,
    )

    return (
      existingProductId !== null &&
      existingProductId === body.productId
    )
  })

  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + body.quantity,
      Math.min(99, product.stock),
    )
  } else {
    cart.items.push({
      product: product._id,
      quantity: body.quantity,
      priceSnapshot: price,
      nameSnapshot: product.name,
      imageSnapshot: product.images[0] ?? '',
      unitSnapshot: product.unit,
    })
  }

  await cart.save()

  await cart.populate('items.product')

  const summary = computeSummary(
    cart.items as unknown as CartRow[],
  )

  res.status(201).json({
    success: true,
    message: 'Added to cart',
    cart: {
      ...cart.toObject(),
      summary,
    },
  })
})

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const body = (
    req as unknown as {
      validatedBody?: { quantity: number }
    }
  ).validatedBody

  if (!body) {
    throw ApiError.badRequest('Invalid quantity')
  }

  const cart = await getOrCreateCart(req.user!.id)

  const item = cart.items.find(
    (item) =>
      item._id &&
      item._id.toString() === req.params.id,
  )

  if (!item) {
    throw ApiError.notFound('Cart item not found')
  }

  const productId = getProductId(item.product)

  if (!productId) {
    throw ApiError.notFound(
      'The product in this cart item no longer exists',
    )
  }

  const product = await Product.findById(
    productId,
  ).orFail(
    ApiError.notFound('Product not found'),
  )

  if (!product.isActive) {
    throw ApiError.badRequest(
      'Product is not available',
    )
  }

  if (body.quantity > product.stock) {
    throw ApiError.badRequest(
      `Only ${product.stock} units left in stock`,
      'OUT_OF_STOCK',
    )
  }

  item.quantity = body.quantity

  await cart.save()
  await cart.populate('items.product')

  const summary = computeSummary(
    cart.items as unknown as CartRow[],
  )

  res.json({
    success: true,
    message: 'Cart updated',
    cart: {
      ...cart.toObject(),
      summary,
    },
  })
})

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id)

  const item = cart.items.find(
    (item) =>
      item._id &&
      item._id.toString() === req.params.id,
  )

  if (!item) {
    throw ApiError.notFound('Cart item not found')
  }

  cart.items = cart.items.filter(
    (item) =>
      item._id &&
      item._id.toString() !== req.params.id,
  )

  await cart.save()
  await cart.populate('items.product')

  const summary = computeSummary(
    cart.items as unknown as CartRow[],
  )

  res.json({
    success: true,
    message: 'Item removed from cart',
    cart: {
      ...cart.toObject(),
      summary,
    },
  })
})

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id)

  cart.items = []
  cart.couponCode = undefined

  await cart.save()

  const summary = computeSummary([])

  res.json({
    success: true,
    message: 'Cart cleared',
    cart: {
      ...cart.toObject(),
      summary,
    },
  })
})

export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const body = (
    req as unknown as {
      validatedBody?: { code: string }
    }
  ).validatedBody

  if (!body) {
    throw ApiError.badRequest('Coupon code required')
  }

  const cart = await getOrCreateCart(req.user!.id)

  const summary = computeSummary(
    cart.items as unknown as CartRow[],
  )

  if (summary.itemsCount === 0) {
    throw ApiError.badRequest('Your cart is empty')
  }

  const coupon = await Coupon.findOne({
    code: body.code.toUpperCase(),
    isActive: true,
  })

  if (!coupon) {
    throw ApiError.badRequest(
      'Invalid coupon code',
      'INVALID_COUPON',
    )
  }

  if (
    coupon.expiresAt &&
    coupon.expiresAt.getTime() < Date.now()
  ) {
    throw ApiError.badRequest(
      'This coupon has expired',
      'COUPON_EXPIRED',
    )
  }

  if (
    coupon.maxUses &&
    coupon.usedCount >= coupon.maxUses
  ) {
    throw ApiError.badRequest(
      'This coupon has reached its usage limit',
      'COUPON_USED_UP',
    )
  }

  if (summary.subtotal < coupon.minOrderValue) {
    throw ApiError.badRequest(
      `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
      'MIN_ORDER',
    )
  }

  const discount = calcCouponDiscount(
    coupon,
    summary.subtotal,
  )

  cart.couponCode = coupon.code

  await cart.save()

  res.json({
    success: true,
    message: `Coupon ${coupon.code} applied`,
    discount,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
    },
    cart: {
      ...cart.toObject(),
      summary,
    },
  })
})

export function calcCouponDiscount(
  coupon: {
    type: string
    value: number
    maxDiscount?: number
  },
  subtotal: number,
): number {
  let discount =
    coupon.type === 'PERCENTAGE'
      ? (subtotal * coupon.value) / 100
      : coupon.value

  if (coupon.maxDiscount) {
    discount = Math.min(
      discount,
      coupon.maxDiscount,
    )
  }

  return Math.min(
    Math.round(discount),
    subtotal,
  )
}

export const removeCoupon = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id)

  cart.couponCode = undefined

  await cart.save()

  const summary = computeSummary(
    cart.items as unknown as CartRow[],
  )

  res.json({
    success: true,
    message: 'Coupon removed',
    cart: {
      ...cart.toObject(),
      summary,
    },
  })
})