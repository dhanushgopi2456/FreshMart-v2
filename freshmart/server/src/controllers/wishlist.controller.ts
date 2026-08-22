import type { Request, Response } from 'express'
import { Wishlist } from '../models/Wishlist.js'
import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'

async function getOrCreateWishlist(userId: string) {
  let wishlist = await Wishlist.findOne({ user: userId }).populate('products')
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] })
  }
  return wishlist
}

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await getOrCreateWishlist(req.user!.id)
  const products = (wishlist.products ?? []).filter(Boolean)
  res.json({ success: true, products })
})

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.productId).orFail(ApiError.notFound('Product not found'))
  const wishlist = await getOrCreateWishlist(req.user!.id)

  if (!wishlist.products.some((p) => p._id.toString() === product._id.toString())) {
    wishlist.products.push(product._id)
    await wishlist.save()
  }

  res.status(201).json({ success: true, message: 'Added to wishlist', inWishlist: true })
})

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await getOrCreateWishlist(req.user!.id)
  wishlist.products = wishlist.products.filter((p) => p._id.toString() !== req.params.productId)
  await wishlist.save()

  res.json({ success: true, message: 'Removed from wishlist', inWishlist: false })
})