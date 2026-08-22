import mongoose from 'mongoose'

export type CouponType = 'PERCENTAGE' | 'FIXED'

export interface ICoupon {
  code: string
  description?: string
  type: CouponType
  value: number
  minOrderValue: number
  maxDiscount?: number
  maxUses?: number
  usedCount: number
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const couponSchema = new mongoose.Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 300 },
    type: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    maxUses: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema)