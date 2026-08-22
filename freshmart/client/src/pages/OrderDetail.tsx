import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  MapPin,
  Truck,
  CreditCard,
  XCircle,
  Loader2,
  Clock,
  Package,
} from 'lucide-react'
import { orderApi } from '@/services'
import type { Order } from '@/types'
import { formatINR, formatDateTime, classNames } from '@/utils/format'
import { Skeleton } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { useModal } from '@/hooks/useModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

const TIMELINE = ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const modal = useModal()

  useEffect(() => {
    if (!id) return
    orderApi
      .get(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  const timelineIdx = useMemo(() => {
    if (!order) return -1
    if (order.orderStatus === 'CANCELLED') return -1
    return TIMELINE.indexOf(order.orderStatus)
  }, [order])

  if (loading) {
    return (
      <div className="container-fm pt-24 pb-16">
        <Skeleton className="h-40" />
        <Skeleton className="mt-4 h-64" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-fm flex min-h-[60vh] flex-col items-center justify-center text-center pt-24">
        <Package className="h-12 w-12 text-gray-600" />
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Order not found</h1>
        <p className="mt-2 text-gray-400">This order may have been removed or you don't have access to it.</p>
        <Link to="/orders" className="btn-outline mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
      </div>
    )
  }

  const canCancel = !['DELIVERED', 'CANCELLED'].includes(order.orderStatus)

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const { data } = await orderApi.cancel(order._id)
      setOrder(data.order)
      toastSuccess('Order cancelled', 'Stock has been restored to the shelf.')
    } catch (err) {
      toastError(err, 'Could not cancel')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="container-fm pt-24 pb-16">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-400">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={classNames(
              'rounded-full border px-4 py-1.5 text-xs font-bold',
              order.orderStatus === 'CANCELLED'
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-leaf-500/30 bg-leaf-500/10 text-leaf-500',
            )}
          >
            {order.orderStatus.replaceAll('_', ' ')}
          </span>
          {canCancel && (
            <Button variant="outline" onClick={() => modal.open()} disabled={cancelling} className="border-red-500/40 text-red-300 hover:border-red-500 hover:bg-red-500/10 hover:text-red-200">
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card mt-6 p-6">
        {order.orderStatus === 'CANCELLED' ? (
          <div className="flex items-center gap-3 text-red-400">
            <XCircle className="h-5 w-5" />
            <p className="text-sm font-semibold">This order was cancelled. Any payment will be refunded to your original method.</p>
          </div>
        ) : (
          <ol className="flex flex-wrap items-center gap-y-4">
            {TIMELINE.map((status, i) => {
              const done = i <= timelineIdx
              const current = i === timelineIdx
              return (
                <li key={status} className="flex flex-1 items-center gap-3">
                  <div className="flex flex-col items-center">
                    <motion.span
                      initial={false}
                      animate={{
                        scale: current ? 1.15 : 1,
                        backgroundColor: done ? 'rgba(0,212,106,1)' : 'rgba(255,255,255,0.08)',
                      }}
                      className={classNames(
                        'flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-colors',
                        done ? 'text-leaf-950' : 'text-gray-500',
                      )}
                    >
                      {done ? <Check className="h-5 w-5" /> : i + 1}
                    </motion.span>
                    <span className={classNames('mt-2 text-center text-[10px] font-semibold sm:text-xs', done ? 'text-leaf-100' : 'text-gray-500')}>
                      {status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className={classNames('mb-5 h-0.5 flex-1 rounded-full', i < timelineIdx ? 'bg-leaf-500' : 'bg-white/10')} />
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-white">Items</h2>
          <div className="mt-4 space-y-4">
            <AnimatePresence>
              {order.items.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl border border-white/10 object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 text-2xl">🛒</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.unit && `${item.unit} · `}Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatINR(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-500">{formatINR(item.price)} each</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <MapPin className="h-4 w-4 text-leaf-500" /> Delivery Address
            </h3>
            <p className="mt-3 text-sm font-semibold text-gray-200">{order.shippingAddress.fullName}</p>
            <p className="mt-1 text-sm text-gray-400">
              {order.shippingAddress.addressLine}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="mt-1 text-sm text-gray-400">{order.shippingAddress.phone}</p>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <CreditCard className="h-4 w-4 text-leaf-500" /> Payment
            </h3>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Method</span>
                <span className="font-semibold text-gray-200">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Status</span>
                <span className={classNames('font-semibold', order.paymentStatus === 'PAID' ? 'text-leaf-500' : 'text-amber-400')}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentReference && (
                <div className="flex justify-between text-gray-400">
                  <span>Reference</span>
                  <span className="max-w-[140px] truncate text-xs text-gray-200">{order.paymentReference}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Truck className="h-4 w-4 text-leaf-500" /> Bill
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-leaf-500">
                  <span>{order.couponCode ? `Coupon (${order.couponCode})` : 'Discount'}</span>
                  <span>− {formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400"><span>Tax</span><span>{formatINR(order.tax)}</span></div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span>
                <span className={order.deliveryFee === 0 ? 'text-leaf-500' : ''}>{order.deliveryFee === 0 ? 'FREE' : formatINR(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-extrabold text-white">
                <span>Total</span><span>{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          {order.estimatedDelivery && (
            <div className="card flex items-center gap-3 p-5">
              <Clock className="h-6 w-6 text-leaf-500" />
              <div>
                <p className="text-xs text-gray-400">Estimated delivery</p>
                <p className="font-display text-lg font-extrabold text-leaf-500">{order.estimatedDelivery}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modal.isOpen} onClose={modal.close}
        title="Cancel this order?"
        description={`This will cancel ${order.orderNumber}. Any payment will be refunded. This can't be undone.`}
        confirmLabel="Cancel Order"
        onConfirm={handleCancel}
      />
    </div>
  )
}