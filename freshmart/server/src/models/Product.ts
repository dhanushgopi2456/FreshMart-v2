import mongoose from 'mongoose'
import type { ICategory } from './Category.js'

export interface IProduct {
  name: string
  slug: string
  description: string
  category: mongoose.Types.ObjectId | ICategory
  brand?: string
  price: number
  discountPrice?: number
  images: string[]
  stock: number
  minStock?: number
  sku?: string
  unit: string
  rating: number
  reviewCount: number
  isFeatured: boolean
  isBestSeller: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: String, trim: true, maxlength: 120 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minStock: { type: Number, default: 5 },
    sku: { type: String, trim: true, maxlength: 60 },
    unit: { type: String, required: true, trim: true, maxlength: 60 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

productSchema.index({ name: 'text', description: 'text', brand: 'text' })

productSchema.pre('save', function (next) {
  if (this.slug && !this.sku) {
    this.sku = this.slug.toUpperCase().slice(0, 12).replace(/[^A-Z0-9]/g, '')
  }
  next()
})

export const Product = mongoose.model<IProduct>('Product', productSchema)