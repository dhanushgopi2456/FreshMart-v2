import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PackageSearch, ChevronRight, Truck, Clock } from 'lucide-react'
import { orderApi } from '@/services'
import type { Order } from '@/types'
import { formatINR, formatDateTime, estimatedDeliveryText } from '@/utils/format'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-sky-500/10 text-sky-400',
  PROCESSING: 'bg-indigo-500/10 text-indigo-400',
  PACKED: 'bg-violet-500/10 text-violet-400',
  SHIPPED: 'bg-amber-500/10 text-amber-400',
  OUT_FOR_DELIVERY: 'bg-orange-500/10 text-orange-400',
  DELIVERED: 'bg-leaf-500/10 text-leaf-500',
  CANCELLED: 'bg-red-500/10 text-red-400',
}

export default function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.list().then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container-fm pt-24 pb-16">
        <div className="section-title mb-8">My Orders</div>
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    )
  }

  return (
    <div className="container-fm pt-24 pb-16">
      <h1 className="section-title">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No orders yet"
          description="Fresh groceries are one click away."
          action={<Link to="/shop" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/orders/${order._id}`} className="card block p-5 transition-colors hover:border-leaf-500/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-extrabold text-white">{order.orderNumber}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" /> {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.orderStatus] ?? 'bg-white/10 text-gray-300'}`}>
                      {order.orderStatus.replaceAll('_', ' ')}
                    </span>
                    <span className="font-display text-lg font-extrabold text-white">{formatINR(order.total)}</span>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <Truck className="h-3.5 w-3.5 text-leaf-500" />
                  {order.orderStatus === 'CANCELLED'
                    ? 'Cancelled'
                    : order.orderStatus === 'DELIVERED'
                      ? 'Delivered'
                      : `Arriving in ${estimatedDeliveryText(order.estimatedDelivery)}`}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}