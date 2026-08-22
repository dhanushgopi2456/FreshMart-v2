import mongoose from 'mongoose'
import type { IUser } from './User.js'

export interface OrderItem {
  product: mongoose.Types.ObjectId
  name: string
  image: string
  unit: string
  price: number
  quantity: number
}

export interface ShippingAddress {
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  landmark?: string
}

export type PaymentMethod = 'razorpay' | 'cod'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type OrderStatus =
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export const ORDER_STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

export interface IOrder {
  orderNumber: string
  user: mongoose.Types.ObjectId | IUser
  items: OrderItem[]
  shippingAddress: ShippingAddress
  subtotal: number
  discount: number
  tax: number
  deliveryFee: number
  total: number
  couponCode?: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentReference?: string
  paymentId?: string
  orderStatus: OrderStatus
  estimatedDelivery?: Date
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new mongoose.Schema<OrderItem>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true, trim: true },
    image: { type: String },
    unit: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const shippingSchema = new mongoose.Schema<ShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    landmark: { type: String },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentReference: { type: String },
    paymentId: { type: String },
    orderStatus: {
      type: String,
      enum: [...ORDER_STATUSES, 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true },
)

orderSchema.index({ orderStatus: 1, createdAt: -1 })

export const Order = mongoose.model<IOrder>('Order', orderSchema)