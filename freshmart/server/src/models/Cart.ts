import mongoose from 'mongoose'

export interface CartItem {
  _id?: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  quantity: number
  priceSnapshot: number
  nameSnapshot: string
  imageSnapshot: string
  unitSnapshot: string
}

export interface ICart {
  user: mongoose.Types.ObjectId
  items: CartItem[]
  couponCode?: string
  createdAt: Date
  updatedAt: Date
}

const cartItemSchema = new mongoose.Schema<CartItem>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, max: 99 },
    priceSnapshot: { type: Number, required: true, min: 0 },
    nameSnapshot: { type: String, required: true, trim: true },
    imageSnapshot: { type: String },
    unitSnapshot: { type: String },
  },
  { _id: true },
)

const cartSchema = new mongoose.Schema<ICart>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    couponCode: { type: String, trim: true, maxlength: 40 },
  },
  { timestamps: true },
)

export const Cart = mongoose.model<ICart>('Cart', cartSchema)