import mongoose from 'mongoose'

export interface IWishlist {
  user: mongoose.Types.ObjectId
  products: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const wishlistSchema = new mongoose.Schema<IWishlist>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
)

export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema)