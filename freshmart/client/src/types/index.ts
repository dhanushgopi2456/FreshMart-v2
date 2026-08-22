export type Role = 'CUSTOMER' | 'ADMIN'

export interface Address {
  _id: string
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  landmark?: string
  isDefault?: boolean
}

export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: Role
  avatar?: string
  addresses: Address[]
  isVerified: boolean
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  image?: string
  isActive: boolean
  sortOrder: number
}

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  category: string | { _id: string; name: string; slug: string }
  brand?: string
  price: number
  discountPrice?: number | null
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
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  _id: string
  product: Product
  quantity: number
  priceSnapshot: number
  nameSnapshot: string
  imageSnapshot: string
  unitSnapshot: string
}

export interface CartSummary {
  itemsCount: number
  subtotal: number
  discountFromMrp: number
  tax: number
  deliveryFee: number
}

export interface Cart {
  _id: string
  user: string
  items: CartItem[]
  couponCode?: string
  summary: CartSummary
  createdAt: string
  updatedAt: string
}

export interface CouponInfo {
  code: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderValue: number
  maxDiscount?: number
  expiresAt?: string
}

export type OrderStatus =
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface OrderItem {
  product?: string
  name: string
  image?: string
  unit?: string
  price: number
  quantity: number
}

export interface Order {
  _id: string
  orderNumber: string
  user: string
  items: OrderItem[]
  shippingAddress: {
    fullName: string
    phone: string
    addressLine: string
    city: string
    state: string
    postalCode: string
    landmark?: string
  }
  subtotal: number
  discount: number
  tax: number
  deliveryFee: number
  total: number
  couponCode?: string
  paymentMethod: 'razorpay' | 'cod'
  paymentStatus: PaymentStatus
  paymentReference?: string
  orderStatus: OrderStatus
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  _id: string
  product: string
  user: { _id: string; name: string; avatar?: string }
  rating: number
  title?: string
  text: string
  isVerifiedPurchase: boolean
  status: string
  createdAt: string
}

export interface Coupon {
  _id: string
  code: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderValue: number
  maxDiscount?: number
  maxUses?: number
  usedCount: number
  expiresAt?: string
  isActive: boolean
}

export interface NotificationItem {
  _id: string
  type: string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductFilters {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  featured?: boolean
  bestseller?: boolean
  sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating'
  page?: number
  limit?: number
}

export interface AIChatResult {
  text: string
  products: Product[]
  intent: string
}

export interface DashboardStats {
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  pendingOrders: number
  customers: number
  products: number
  lowStock: number
  outOfStock: number
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  phone?: string
  role: Role
  isActive: boolean
  createdAt: string
}