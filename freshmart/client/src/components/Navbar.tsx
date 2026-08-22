import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  Bot,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { toastSuccess } from '@/store/toastStore'
import { setCartTarget } from '@/utils/cartFx'
import { initials } from '@/utils/format'
import { Drawer } from '@/components/ui/Drawer'
import { useModal } from '@/hooks/useModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop Catalog' },
  { to: '/categories', label: 'Categories' },
  { to: '/orders', label: 'Track Orders' },
]

function Badge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-leaf-500 px-1 text-[10px] font-bold text-leaf-950"
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export function Navbar() {
  const { user, logout } = useAuthStore()
  const { cart } = useCartStore()
  const wishlistCount = useWishlistStore((s) => s.ids.size)
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartPulse, setCartPulse] = useState(0)
  const cartRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  useEffect(() => {
    setCartTarget(cartRef.current)
    const handler = () => setCartPulse((n) => n + 1)
    const el = cartRef.current
    el?.addEventListener('fm-cart-pulse', handler)
    return () => {
      el?.removeEventListener('fm-cart-pulse', handler)
      setCartTarget(null)
    }
  }, [cart])

  const cartCount = cart?.summary.itemsCount ?? 0

  const logoutModal = useModal()

  const handleLogout = async () => {
    logoutModal.close()
    await logout()
    toastSuccess('Logged out', "You've been logged out safely.")
    navigate('/')
  }

  const mobileLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/categories', label: 'Categories' },
    { to: '/orders', label: 'Orders' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/account', label: 'Account' },
  ]

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/10 bg-midnight/85 shadow-card backdrop-blur-xl'
            : 'border-b border-transparent bg-gradient-to-b from-midnight/90 to-transparent'
        }`}
      >
        <nav
          className={`container-fm flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled ? 'h-14' : 'h-18 sm:h-20'
          }`}
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <motion.span
                      className="absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-leaf-500"
                      initial={false}
                      animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigate('/shop')}
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-all hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 sm:flex"
              aria-label="Search products"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button
              onClick={() => (user ? navigate('/ai') : navigate('/login?redirect=/ai'))}
              className="hidden items-center gap-1.5 rounded-xl border border-leaf-500/30 bg-leaf-500/10 px-3 py-2 text-xs font-semibold text-leaf-100 transition-all hover:border-leaf-500/60 hover:bg-leaf-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 md:flex"
            >
              <Bot className="h-4 w-4" />
              Ask FreshMart AI
            </button>

            <div className="relative hidden sm:block">
              <Link
                to="/wishlist"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
                aria-label={`Wishlist, ${wishlistCount} items`}
              >
                <Heart className="h-[18px] w-[18px]" />
                <Badge count={wishlistCount} />
              </Link>
            </div>

            <div
              ref={cartRef}
              className="relative"
              onAnimationEnd={() => {}}
            >
              <motion.div
                key={cartPulse}
                animate={cartPulse ? { scale: [1, 1.18, 1] } : {}}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Link
                  to="/cart"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
                  aria-label={`Cart, ${cartCount} items`}
                >
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  <Badge count={cartCount} />
                </Link>
              </motion.div>
              <AnimatePresence>
                {cartPulse > 0 && (
                  <motion.span
                    key={`ring-${cartPulse}`}
                    className="pointer-events-none absolute inset-0 rounded-xl border-2 border-leaf-500"
                    initial={{ opacity: 0.7, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="group relative">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-leaf-500/40 bg-leaf-500/15 text-sm font-bold text-leaf-100 transition-all hover:border-leaf-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
                  aria-label="Account menu"
                  onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/account')}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    initials(user.name)
                  )}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary hidden px-4 py-2 text-sm md:inline-flex"
              >
                Login
              </Link>
            )}

            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
              onClick={() => (user ? navigate(user.role === 'ADMIN' ? '/admin' : '/account') : navigate('/login'))}
              aria-label="Account"
            >
              <UserIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </nav>
      </motion.header>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="FreshMart" side="left">
        <div className="flex flex-col p-4">
          <div className="flex flex-col gap-1">
            {mobileLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-leaf-500/10 hover:text-leaf-100"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/ai"
              onClick={() => setMenuOpen(false)}
              className="mt-1 flex items-center gap-3 rounded-xl border border-leaf-500/30 bg-leaf-500/10 px-4 py-3 text-sm font-semibold text-leaf-100"
            >
              <Bot className="h-4 w-4" /> AI Assistant
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
              </Link>
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-500/20 font-bold text-leaf-100">
                    {initials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    logoutModal.open()
                  }}
                  className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary flex-1"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-outline flex-1"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <ConfirmModal
        open={logoutModal.isOpen}
        onClose={logoutModal.close}
        onConfirm={handleLogout}
        title="Sign out of FreshMart?"
        description="You'll need to sign in again to place orders."
        confirmLabel="Sign out"
        icon={<LogOut className="h-5 w-5" />}
        variant="danger"
      />
    </>
  )
}