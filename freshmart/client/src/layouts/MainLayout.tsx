import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ToastContainer } from '@/components/ui/Toast'
import { FreshEnergyField } from '@/three/FreshEnergyField'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { getReducedMotion } from '@/utils/device'

export function MainLayout() {
  const location = useLocation()
  const { status, hydrate, user } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { fetchWishlist } = useWishlistStore()

  useEffect(() => {
    void hydrate()
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    void fetchCart()
    void fetchWishlist()
  }, [status, user?._id])

  useEffect(() => {
    if (getReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  const isAdminPage = location.pathname.startsWith('/admin')
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)

  return (
    <div className="relative min-h-screen">
      {!isAdminPage && <FreshEnergyField />}
      {!isAuthPage && <Navbar />}
      <main className="relative z-10">
        <Outlet />
      </main>
      {!isAdminPage && !isAuthPage && <Footer />}
      <ToastContainer />
    </div>
  )
}