import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Review } from '../models/Review.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../middleware/error.js'

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ product: req.params.id, status: 'APPROVED' })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar')
  res.json({ success: true, reviews })
})

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const body = (req as unknown as { validatedBody?: { rating: number; title?: string; text: string } })
    .validatedBody
  if (!body) throw ApiError.badRequest('Invalid review')

  const product = await Product.findById(req.params.id).orFail(ApiError.notFound('Product not found'))

  const existing = await Review.findOne({ product: product._id, user: req.user!.id })
  if (existing) throw ApiError.conflict('You have already reviewed this product')

  const purchased = await Order.findOne({
    user: req.user!.id,
    orderStatus: { $nin: ['CANCELLED'] },
    'items.product': product._id,
  })

  const review = await Review.create({
    product: product._id,
    user: req.user!.id,
    order: purchased?._id,
    rating: body.rating,
    title: body.title || undefined,
    text: body.text,
    isVerifiedPurchase: Boolean(purchased),
    status: 'APPROVED',
  })

  const [ratingAgg, count] = await Promise.all([
    Review.aggregate([
      { $match: { product: product._id, status: 'APPROVED' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    Review.countDocuments({ product: product._id, status: 'APPROVED' }),
  ])

  product.rating = Math.round((ratingAgg[0]?.avg ?? body.rating) * 10) / 10
  product.reviewCount = count
  await product.save()

  res.status(201).json({ success: true, message: 'Review submitted', review })
})

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id).orFail(ApiError.notFound('Review not found'))
  const isOwner = review.user.toString() === req.user!.id
  const isAdmin = req.user!.role === 'ADMIN'
  if (!isOwner && !isAdmin) throw ApiError.forbidden('You can only delete your own reviews')

  await Review.findByIdAndDelete(review._id)

  await Product.updateOne(
    { _id: review.product },
    { $inc: { reviewCount: -1 } },
  )
  const agg = await Review.aggregate([
    { $match: { product: review.product, status: 'APPROVED' } },
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ])
  await Product.updateOne(
    { _id: review.product },
    { $set: { rating: Math.round((agg[0]?.avg ?? 0) * 10) / 10 } },
  )

  res.json({ success: true, message: 'Review removed' })
})

export const moderateReview = asyncHandler(async (req: Request, res: Response) => {
  const status = (req as unknown as { validatedBody?: { status: string } }).validatedBody?.status
  if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    throw ApiError.badRequest('Invalid moderation status')
  }

  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true }).orFail(
    ApiError.notFound('Review not found'),
  )

  if (status === 'APPROVED') {
    const agg = await Review.aggregate([
      { $match: { product: review.product, status: 'APPROVED' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    await Product.updateOne(
      { _id: review.product },
      { $set: { rating: Math.round((agg[0]?.avg ?? 0) * 10) / 10, reviewCount: agg[0]?.count ?? 0 } },
    )
  }

  res.json({ success: true, message: 'Review updated', review })
})

export const isReviewable = asyncHandler(async (req: Request, res: Response) => {
  const productId = new mongoose.Types.ObjectId(req.params.productId)
  const order = await Order.findOne({
    user: req.user!.id,
    orderStatus: { $nin: ['CANCELLED'] },
    'items.product': productId,
  })
  const existing = await Review.findOne({ product: productId, user: req.user!.id })
  res.json({
    success: true,
    canReview: Boolean(order) && !existing,
    alreadyReviewed: Boolean(existing),
  })
})