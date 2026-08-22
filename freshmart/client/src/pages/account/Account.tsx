import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Package,
  Heart,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { orderApi } from '@/services'
import type { Order } from '@/types'
import { formatINR, initials } from '@/utils/format'
import { toastSuccess } from '@/store/toastStore'

const MENU = [
  { to: '/account/profile', icon: User, label: 'Profile', desc: 'Name, email & phone' },
  { to: '/account/orders', icon: ShoppingBag, label: 'My Orders', desc: 'Track and manage orders' },
  { to: '/account/addresses', icon: MapPin, label: 'Addresses', desc: 'Saved delivery addresses' },
  { to: '/account/security', icon: ShieldCheck, label: 'Security', desc: 'Change password' },
]

export default function Account() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    orderApi.list(1).then(({ data }) => setOrders(data.orders)).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    toastSuccess('Signed out', 'See you soon!')
    navigate('/')
  }

  if (!user) return null

  const recentOrders = orders.slice(0, 3)
  const activeOrderCount = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)).length

  return (
    <div className="container-fm pt-24 pb-16">
      <h1 className="section-title">My Account</h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mt-8 flex flex-wrap items-center gap-5 p-6"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-mint text-xl font-extrabold text-leaf-950">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full rounded-2xl object-cover" />
          ) : (
            initials(user.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-extrabold text-white">{user.name}</p>
          <p className="truncate text-sm text-gray-400">{user.email}</p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="font-display text-2xl font-extrabold text-white">{orders.length}</p>
            <p className="text-xs text-gray-500">Total orders</p>
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-leaf-500">{activeOrderCount}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {MENU.map((item, i) => (
            <motion.div key={item.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <Link
                to={item.to}
                className="card flex items-center gap-4 p-5 transition-colors hover:border-leaf-500/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-500/10">
                  <item.icon className="h-5 w-5 text-leaf-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </Link>
            </motion.div>
          ))}
          <button
            onClick={handleLogout}
            className="card flex w-full items-center gap-4 p-5 text-left transition-colors hover:border-red-500/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <LogOut className="h-5 w-5 text-red-400" />
            </div>
            <p className="font-semibold text-red-300">Sign Out</p>
          </button>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Package className="h-4 w-4 text-leaf-500" /> Recent Orders
              </h3>
              <Link to="/account/orders" className="text-xs font-semibold text-leaf-500 hover:text-leaf-400">View all</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">No orders yet.</p>
                <Link to="/shop" className="btn-outline mt-3 px-4 py-2 text-xs">Shop now</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentOrders.map((o) => (
                  <Link key={o._id} to={`/orders/${o._id}`} className="flex items-center justify-between rounded-xl border border-white/10 p-3 transition-colors hover:border-leaf-500/30">
                    <div>
                      <p className="text-xs font-bold text-white">{o.orderNumber}</p>
                      <p className="text-[10px] text-gray-500">{o.items.reduce((s, it) => s + it.quantity, 0)} items</p>
                    </div>
                    <span className="text-sm font-bold text-leaf-500">{formatINR(o.total)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/wishlist" className="card p-4 text-center transition-colors hover:border-leaf-500/30">
              <Heart className="mx-auto h-6 w-6 text-rose-400" />
              <p className="mt-2 text-sm font-semibold text-white">Wishlist</p>
            </Link>
            <Link to="/ai" className="card p-4 text-center transition-colors hover:border-leaf-500/30">
              <Sparkles className="mx-auto h-6 w-6 text-mint" />
              <p className="mt-2 text-sm font-semibold text-white">FreshAI</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}