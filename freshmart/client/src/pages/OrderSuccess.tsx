import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Package, Clock, Truck } from 'lucide-react'
import type { Order } from '@/types'
import { formatINR } from '@/utils/format'
import { useCartStore } from '@/store/cartStore'
import { estimatedDeliveryText } from '@/utils/format'

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const order = (location.state as { order?: Order } | null)?.order
  const { reset } = useCartStore()

  useEffect(() => {
    if (!order) navigate('/orders', { replace: true })
    else reset()
  }, [order, navigate, reset])

  if (!order) return null

  return (
    <div className="container-fm flex min-h-[80vh] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg text-center"
      >
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-leaf-500/40"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', repeatDelay: 1 }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-leaf-500/30"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', repeatDelay: 1, delay: 0.4 }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.2 }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-leaf-500 shadow-glow"
          >
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.45 }}
            >
              <Check className="h-11 w-11 text-leaf-950" strokeWidth={3} />
            </motion.span>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Order Confirmed!</p>
          <h1 className="font-display text-3xl font-extrabold text-white">
            {order.orderNumber}
          </h1>
          <p className="mt-3 text-gray-400">Your groceries are being prepared.</p>

          <div className="card mx-auto mt-8 max-w-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="h-4 w-4 text-leaf-500" />
                Estimated Delivery
              </div>
              <span className="font-display text-lg font-extrabold text-leaf-500">
                {estimatedDeliveryText(order.estimatedDelivery)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Total paid</span>
              <span className="font-display text-xl font-extrabold text-white">{formatINR(order.total)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={`/orders/${order._id}`} className="btn-primary px-7 py-4">
              <Truck className="h-4 w-4" /> Track My Order
            </Link>
            <Link to="/shop" className="btn-outline px-7 py-4">
              <Package className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}