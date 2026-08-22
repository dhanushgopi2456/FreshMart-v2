import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PackageSearch, ChevronRight, Clock, Truck } from 'lucide-react'
import { orderApi } from '@/services'
import type { Order } from '@/types'
import { formatINR, formatDateTime, classNames, estimatedDeliveryText } from '@/utils/format'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  PROCESSING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  PACKED: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  SHIPPED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  OUT_FOR_DELIVERY: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  DELIVERED: 'bg-leaf-500/10 text-leaf-500 border-leaf-500/30',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const PAYMENT_STYLES: Record<string, string> = {
  PAID: 'text-leaf-500',
  PENDING: 'text-amber-400',
  FAILED: 'text-red-400',
  REFUNDED: 'text-gray-400',
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi
      .list()
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container-fm pt-24 pb-16">
        <div className="section-title mb-8">My Orders</div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fm pt-24 pb-16">
      <h1 className="section-title">My Orders</h1>
      <p className="mt-1 text-sm text-gray-400">Track and manage all your FreshMart orders.</p>

      {orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No orders yet"
          description="When you place your first order it will show up here."
          action={<Link to="/shop" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <div className="mt-8 grid gap-4">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/orders/${order._id}`} className="card block p-5 transition-colors hover:border-leaf-500/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-extrabold text-white">{order.orderNumber}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="h-3 w-3" /> {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={classNames('rounded-full border px-3 py-1 text-xs font-semibold', STATUS_STYLES[order.orderStatus] ?? STATUS_STYLES.CONFIRMED)}>
                      {order.orderStatus.replaceAll('_', ' ')}
                    </span>
                    <span className={classNames('text-xs font-semibold', PAYMENT_STYLES[order.paymentStatus] ?? '')}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 overflow-x-auto">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.name} className="relative shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl border border-white/10 object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
                          🛒
                        </div>
                      )}
                      <span className="absolute -bottom-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-leaf-500 px-1 text-[10px] font-bold text-leaf-950">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Truck className="h-4 w-4 text-leaf-500" />
                    {order.orderStatus === 'CANCELLED'
                      ? 'This order was cancelled'
                      : order.orderStatus === 'DELIVERED'
                        ? 'Delivered'
                        : `Arriving in ${estimatedDeliveryText(order.estimatedDelivery)}`}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      {order.items.reduce((s, it) => s + it.quantity, 0)} items
                    </span>
                    <span className="font-display text-lg font-extrabold text-white">{formatINR(order.total)}</span>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}