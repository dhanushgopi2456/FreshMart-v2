import { Router } from 'express'
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { Coupon } from '../models/Coupon.js'
import { asyncHandler } from '../middleware/error.js'

const router = Router()

router.get('/home', asyncHandler(async (_req, res) => {
  const [categories, featured, bestSellers, deals] = await Promise.all([
    Category.find({ isActive: true }).sort({ sortOrder: 1 }).limit(9),
    Product.find({ isFeatured: true, isActive: true, stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('category', 'name slug'),
    Product.find({ isBestSeller: true, isActive: true })
      .sort({ rating: -1 })
      .limit(8)
      .populate('category', 'name slug'),
    Product.find({ discountPrice: { $ne: null }, isActive: true, stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('category', 'name slug'),
  ])
  res.json({ success: true, data: { categories, featured, bestSellers, deals } })
}))

router.get('/coupons/public', asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find({ isActive: true }).select('code description type value minOrderValue expiresAt')
  res.json({ success: true, coupons })
}))

export default router