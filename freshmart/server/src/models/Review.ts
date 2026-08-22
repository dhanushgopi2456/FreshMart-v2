import mongoose from 'mongoose'

export interface IReview {
  product: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  order?: mongoose.Types.ObjectId
  rating: number
  title?: string
  text: string
  isVerifiedPurchase: boolean
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 150 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' },
  },
  { timestamps: true },
)

reviewSchema.index({ product: 1, user: 1 }, { unique: true })

export const Review = mongoose.model<IReview>('Review', reviewSchema)