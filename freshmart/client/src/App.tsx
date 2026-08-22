import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { MainLayout } from '@/layouts/MainLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute'
import { LoadingOverlay } from '@/components/ui/Feedback'
import { useAuthStore } from '@/store/authStore'

const Home = lazy(() => import('@/pages/Home'))
const Shop = lazy(() => import('@/pages/Shop'))
const Categories = lazy(() => import('@/pages/Categories'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const Wishlist = lazy(() => import('@/pages/Wishlist'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'))
const Orders = lazy(() => import('@/pages/Orders'))
const OrderDetail = lazy(() => import('@/pages/OrderDetail'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Account = lazy(() => import('@/pages/account/Account'))
const AccountProfile = lazy(() => import('@/pages/account/Profile'))
const AccountOrders = lazy(() => import('@/pages/account/AccountOrders'))
const AccountAddresses = lazy(() => import('@/pages/account/Addresses'))
const AccountSecurity = lazy(() => import('@/pages/account/Security'))
const AIAssistant = lazy(() => import('@/pages/AIAssistant'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('@/pages/admin/Products'))
const AdminCategories = lazy(() => import('@/pages/admin/Categories'))
const AdminInventory = lazy(() => import('@/pages/admin/Inventory'))
const AdminOrders = lazy(() => import('@/pages/admin/Orders'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const AdminCoupons = lazy(() => import('@/pages/admin/Coupons'))
const AdminReviews = lazy(() => import('@/pages/admin/Reviews'))
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  const { status } = useAuthStore()

  if (status === 'idle') {
    return <LoadingOverlay label="Loading FreshMart..." />
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/account/profile" element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} />
          <Route path="/account/orders" element={<ProtectedRoute><AccountOrders /></ProtectedRoute>} />
          <Route path="/account/addresses" element={<ProtectedRoute><AccountAddresses /></ProtectedRoute>} />
          <Route path="/account/security" element={<ProtectedRoute><AccountSecurity /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingOverlay label="Loading FreshMart..." />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  )
}