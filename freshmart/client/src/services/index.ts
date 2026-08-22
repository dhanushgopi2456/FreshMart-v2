import api from './api'
import type {
  Product,
  ProductFilters,
  Pagination,
  Category,
  User,
  Cart,
  CouponInfo,
  AIChatResult,
} from '@/types'

export const authApi = {
  register: (data: {
    name: string
    email: string
    phone?: string
    password: string
    confirmPassword: string
  }) => api.post<{ success: boolean; user: User }>('/auth/register', data),
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<{ success: boolean; user: User }>('/auth/login', data),
  logout: () => api.post<{ success: boolean }>('/auth/logout'),
  me: () => api.get<{ success: boolean; user: User }>('/auth/me'),
  forgotPassword: (email: string) => api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string, confirmPassword: string) =>
    api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, password, confirmPassword }),
}

export const productApi = {
  list: (filters: ProductFilters = {}) =>
    api.get<{ success: boolean; products: Product[]; pagination: Pagination }>('/products', {
      params: {
        ...filters,
        minPrice: filters.minPrice ?? undefined,
        maxPrice: filters.maxPrice ?? undefined,
        inStock: filters.inStock === undefined ? undefined : String(filters.inStock),
      },
    }),
  get: (id: string) =>
    api.get<{ success: boolean; product: Product; related: Product[] }>(`/products/${id}`),
  getBySlug: (slug: string) => api.get<{ success: boolean; product: Product }>(`/products/slug/${slug}`),
  featured: () => api.get<{ success: boolean; products: Product[] }>('/products/featured'),
  bestsellers: () => api.get<{ success: boolean; products: Product[] }>('/products/bestsellers'),
  deals: () => api.get<{ success: boolean; products: Product[] }>('/products/deals'),
}

export const categoryApi = {
  list: () => api.get<{ success: boolean; categories: Category[] }>('/categories'),
}

export const homeApi = {
  get: () =>
    api.get<{
      success: boolean
      data: { categories: Category[]; featured: Product[]; bestSellers: Product[]; deals: Product[] }
    }>('/home'),
}

export const cartApi = {
  get: () => api.get<{ success: boolean; cart: Cart; coupon: CouponInfo | null }>('/cart'),
  add: (productId: string, quantity = 1) =>
    api.post<{ success: boolean; message: string; cart: Cart }>('/cart/items', { productId, quantity }),
  update: (itemId: string, quantity: number) =>
    api.put<{ success: boolean; message: string; cart: Cart }>(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId: string) =>
    api.delete<{ success: boolean; message: string; cart: Cart }>(`/cart/items/${itemId}`),
  clear: () => api.delete<{ success: boolean; message: string; cart: Cart }>('/cart'),
  applyCoupon: (code: string) =>
    api.post<{ success: boolean; message: string; discount: number; cart: Cart }>('/cart/coupon', { code }),
  removeCoupon: () => api.delete<{ success: boolean; message: string; cart: Cart }>('/cart/coupon'),
}

export const wishlistApi = {
  get: () => api.get<{ success: boolean; products: Product[] }>('/wishlist'),
  add: (productId: string) =>
    api.post<{ success: boolean; message: string; inWishlist: boolean }>(`/wishlist/${productId}`),
  remove: (productId: string) =>
    api.delete<{ success: boolean; message: string; inWishlist: boolean }>(`/wishlist/${productId}`),
}

export const orderApi = {
  create: (data: {
    shippingAddress: {
      fullName: string
      phone: string
      addressLine: string
      city: string
      state: string
      postalCode: string
      landmark?: string
    }
    paymentMethod: 'razorpay' | 'cod'
    couponCode?: string
  }) =>
    api.post<{
      success: boolean
      order: import('@/types').Order
      razorpay: { orderId: string; amount: number; currency: string } | null
    }>('/orders', data),
  list: (page = 1) =>
    api.get<{ success: boolean; orders: import('@/types').Order[]; pagination: Pagination }>('/orders', {
      params: { page },
    }),
  get: (id: string) =>
    api.get<{ success: boolean; order: import('@/types').Order }>(`/orders/${id}`),
  cancel: (id: string) =>
    api.put<{ success: boolean; message: string; order: import('@/types').Order }>(`/orders/${id}/cancel`, {}),
  verifyPayment: (data: {
    orderId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }) => api.post<{ success: boolean; order: import('@/types').Order }>('/orders/verify-payment', data),
}

export const reviewApi = {
  list: (productId: string) =>
    api.get<{ success: boolean; reviews: import('@/types').Review[] }>(`/products/${productId}/reviews`),
  add: (productId: string, data: { rating: number; title?: string; text: string }) =>
    api.post<{ success: boolean; message: string }>(`/products/${productId}/reviews`, data),
}

export const accountApi = {
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put<{ success: boolean; user: User }>('/account/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ success: boolean; message: string }>('/account/change-password', data),
  addresses: () => api.get<{ success: boolean; addresses: User['addresses'] }>('/account/addresses'),
  addAddress: (data: Omit<AddressInput, '_id'>) =>
    api.post<{ success: boolean; addresses: User['addresses'] }>('/account/addresses', data),
  updateAddress: (id: string, data: Omit<AddressInput, '_id'>) =>
    api.put<{ success: boolean; addresses: User['addresses'] }>(`/account/addresses/${id}`, data),
  deleteAddress: (id: string) =>
    api.delete<{ success: boolean; addresses: User['addresses'] }>(`/account/addresses/${id}`),
  notifications: () =>
    api.get<{ success: boolean; notifications: import('@/types').NotificationItem[] }>('/account/notifications'),
}

export interface AddressInput {
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  landmark?: string
  isDefault?: boolean
}

export const aiApi = {
  chat: (message: string) => api.post<{ success: boolean } & AIChatResult>('/ai/chat', { message }),
  recommendations: (data: { prompt?: string; budget?: number; category?: string }) =>
    api.post<{ success: boolean; text: string; products: Product[] }>('/ai/recommendations', data),
  search: (query: string) =>
    api.post<{ success: boolean; products: Product[] }>('/ai/product-search', { query }),
}

export const adminApi = {
  dashboard: () =>
    api.get<{
      success: boolean
      stats: import('@/types').DashboardStats
      recentOrders: import('@/types').Order[]
    }>('/admin/dashboard'),
  analytics: (days = 30) =>
    api.get<{
      success: boolean
      analytics: {
        daily: Array<{ date: string; revenue: number; orders: number }>
        bestSellers: Array<{ _id: string; qty: number; revenue: number }>
        statusDistribution: Array<{ _id: string; count: number }>
      }
    }>('/admin/analytics', { params: { days } }),
  orders: (params: { page?: number; status?: string; q?: string }) =>
    api.get<{
      success: boolean
      orders: import('@/types').Order[]
      pagination: Pagination
    }>('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string) =>
    api.put<{ success: boolean; message: string; order: import('@/types').Order }>(
      `/admin/orders/${id}/status`,
      { status },
    ),
  users: (params: { page?: number; q?: string }) =>
    api.get<{ success: boolean; users: import('@/types').AdminUser[]; pagination: Pagination }>('/admin/users', {
      params,
    }),
  updateUserStatus: (id: string, isActive: boolean) =>
    api.put<{ success: boolean; message: string }>(`/admin/users/${id}/status`, { isActive }),
  inventory: (params: { page?: number; status?: string; q?: string }) =>
    api.get<{
      success: boolean
      items: Product[]
      pagination: Pagination
    }>('/admin/inventory', { params }),
  updateInventory: (id: string, data: { stock: number; minStock?: number }) =>
    api.put<{ success: boolean; message: string; product: Product }>(`/admin/inventory/${id}`, data),
  coupons: () => api.get<{ success: boolean; coupons: import('@/types').Coupon[] }>('/admin/coupons'),
  createCoupon: (data: Record<string, unknown>) =>
    api.post<{ success: boolean; message: string }>('/admin/coupons', data),
  updateCoupon: (id: string, data: Record<string, unknown>) =>
    api.put<{ success: boolean; message: string }>(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete<{ success: boolean; message: string }>(`/admin/coupons/${id}`),
  reviews: (params: { page?: number; status?: string }) =>
    api.get<{
      success: boolean
      reviews: import('@/types').Review[]
      pagination: Pagination
    }>('/admin/reviews', { params }),
  moderateReview: (id: string, status: string) =>
    api.put<{ success: boolean; message: string }>(`/admin/reviews/${id}/moderate`, { status }),
  createProduct: (data: Record<string, unknown>) =>
    api.post<{ success: boolean; message: string; product: Product }>('/admin/products', data),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.put<{ success: boolean; message: string; product: Product }>(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete<{ success: boolean; message: string }>(`/admin/products/${id}`),
  createCategory: (data: Record<string, unknown>) =>
    api.post<{ success: boolean; message: string }>('/admin/categories', data),
  updateCategory: (id: string, data: Record<string, unknown>) =>
    api.put<{ success: boolean; message: string }>(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete<{ success: boolean; message: string }>(`/admin/categories/${id}`),
}