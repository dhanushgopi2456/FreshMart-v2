import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Box,
  ChevronRight,
} from 'lucide-react'
import { adminApi } from '@/services'
import type { DashboardStats, Order } from '@/types'
import { formatINR, formatDateTime } from '@/utils/format'
import { Skeleton } from '@/components/ui/Feedback'

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-sky-500/10 text-sky-400',
  PROCESSING: 'bg-indigo-500/10 text-indigo-400',
  PACKED: 'bg-violet-500/10 text-violet-400',
  SHIPPED: 'bg-amber-500/10 text-amber-400',
  OUT_FOR_DELIVERY: 'bg-orange-500/10 text-orange-400',
  DELIVERED: 'bg-leaf-500/10 text-leaf-500',
  CANCELLED: 'bg-red-500/10 text-red-400',
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    adminApi.dashboard().then(({ data }) => {
      setStats(data.stats)
      setOrders(data.recentOrders)
    })
  }, [])

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Total Revenue', value: formatINR(stats.totalRevenue), icon: IndianRupee, tint: 'text-leaf-500', bg: 'bg-leaf-500/10' },
    { label: 'Today', value: formatINR(stats.todayRevenue), icon: TrendingUp, tint: 'text-mint', bg: 'bg-mint/10' },
    { label: 'Orders', value: String(stats.totalOrders), icon: ShoppingCart, tint: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Customers', value: String(stats.customers), icon: Users, tint: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Products', value: String(stats.products), icon: Package, tint: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Low Stock', value: String(stats.lowStock), icon: AlertTriangle, tint: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Out of Stock', value: String(stats.outOfStock), icon: Box, tint: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-400">A quick pulse on your store.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card flex items-center gap-4 p-5"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg}`}>
              <c.icon className={`h-6 w-6 ${c.tint}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-extrabold text-white">{c.value}</p>
              <p className="text-xs text-gray-400">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-leaf-500 hover:text-leaf-400">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-white/5">
            {orders.map((o) => (
              <Link key={o._id} to={`/admin/orders`} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLES[o.orderStatus] ?? 'bg-white/10 text-gray-300'}`}>
                  {o.orderStatus.replaceAll('_', ' ')}
                </span>
                <span className="w-20 text-right text-sm font-bold text-leaf-500">{formatINR(o.total)}</span>
              </Link>
            ))}
            {orders.length === 0 && <p className="py-6 text-center text-sm text-gray-500">No orders yet.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-white">Attention needed</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-200">Low stock items</span>
              </div>
              <span className="font-bold text-amber-300">{stats.lowStock}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-red-500/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <Box className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-200">Out of stock</span>
              </div>
              <span className="font-bold text-red-300">{stats.outOfStock}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-sky-500/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-4 w-4 text-sky-400" />
                <span className="text-sm text-sky-200">Pending orders</span>
              </div>
              <span className="font-bold text-sky-300">{stats.pendingOrders}</span>
            </div>
            <Link to="/admin/analytics" className="btn-outline mt-2 w-full justify-center text-xs">
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}