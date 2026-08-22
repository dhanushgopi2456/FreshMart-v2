import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  TicketPercent,
  Star,
  BarChart3,
  LogOut,
  Store,
  Bot,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useAuthStore } from '@/store/authStore'
import { toastSuccess } from '@/store/toastStore'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/users', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export function AdminLayout() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toastSuccess('Logged out', "You've been logged out safely.")
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-midnight">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-midnight-200 lg:flex">
        <div className="flex h-16 items-center border-b border-white/5 px-5">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            Administration
          </p>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 ${
                  isActive
                    ? 'bg-leaf-500/15 text-leaf-100'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <l.icon className={`h-4 w-4 ${isActive ? 'text-leaf-500' : ''}`} />
                  {l.label}
                  {isActive && (
                    <motion.span layoutId="admin-active" className="ml-auto h-1.5 w-1.5 rounded-full bg-leaf-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/5 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-500/20 text-xs font-bold text-leaf-100">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-leaf-500">Admin</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4" /> View store
          </button>
          <button
            onClick={() => navigate('/ai')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Bot className="h-4 w-4" /> FreshMart AI
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-midnight/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Logo compact />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-display text-sm font-bold uppercase tracking-widest text-gray-400">
              FreshMart Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-leaf-500/40 hover:text-leaf-100 sm:block"
            >
              ← Back to store
            </a>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-1 overflow-x-auto border-b border-white/5 p-2 lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium ${
                  isActive ? 'bg-leaf-500/15 text-leaf-100' : 'text-gray-500'
                }`
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}