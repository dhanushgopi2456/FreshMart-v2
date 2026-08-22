import mongoose from 'mongoose'

export interface ICategory {
  name: string
  slug: string
  description?: string
  icon?: string
  image?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    description: { type: String, trim: true, maxlength: 400 },
    icon: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Category = mongoose.model<ICategory>('Category', categorySchema)