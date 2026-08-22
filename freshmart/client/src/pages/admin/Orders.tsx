import { useEffect, useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'
import { adminApi } from '@/services'
import type { Order } from '@/types'
import { formatINR, formatDateTime, classNames } from '@/utils/format'
import { Input, Select } from '@/components/ui/Input'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'
import { useModal } from '@/hooks/useModal'
import { Modal } from '@/components/ui/Modal'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

const STATUSES = ['ALL', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-sky-500/10 text-sky-400',
  PROCESSING: 'bg-indigo-500/10 text-indigo-400',
  PACKED: 'bg-violet-500/10 text-violet-400',
  SHIPPED: 'bg-amber-500/10 text-amber-400',
  OUT_FOR_DELIVERY: 'bg-orange-500/10 text-orange-400',
  DELIVERED: 'bg-leaf-500/10 text-leaf-500',
  CANCELLED: 'bg-red-500/10 text-red-400',
}

const PAYMENT_STYLES: Record<string, string> = {
  PAID: 'text-leaf-500',
  PENDING: 'text-amber-400',
  FAILED: 'text-red-400',
  REFUNDED: 'text-gray-400',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ALL')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState<Order | null>(null)
  const [saving, setSaving] = useState(false)
  const detail = useModal()

  const load = (s = status, query = q, p = page) => {
    setLoading(true)
    adminApi
      .orders({ page: p, status: s, q: query || undefined })
      .then(({ data }) => {
        setOrders(data.orders)
        setTotalPages(data.pagination.totalPages)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(status, q, page)
  }, [status, page])

  const openDetail = (o: Order) => {
    setSelected(o)
    detail.open()
  }

  const setStatusOf = async (id: string, next: string) => {
    setSaving(true)
    try {
      const { data } = await adminApi.updateOrderStatus(id, next)
      setOrders((list) => list.map((o) => (o._id === id ? data.order : o)))
      setSelected(data.order)
      toastSuccess('Order status updated')
    } catch (err) {
      toastError(err, 'Could not update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white">Orders</h1>
      <p className="mt-1 text-sm text-gray-400">Manage fulfilment across all orders.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          options={STATUSES.map((s) => ({ value: s, label: s.replaceAll('_', ' ') }))}
          className="w-48"
        />
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search order no, name or phone..."
            className="pl-10"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              clearTimeout((window as any).__ordT)
              ;(window as any).__ordT = setTimeout(() => load(status, e.target.value, 1), 350)
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders" description="Orders matching these filters will appear here." />
      ) : (
        <div className="card mt-6 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3.5 font-semibold">Order</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o._id} onClick={() => openDetail(o)} className="cursor-pointer transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-bold text-white">{o.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-300">
                      <p className="font-semibold">{o.shippingAddress.fullName}</p>
                      <p className="text-xs text-gray-500">{o.shippingAddress.phone}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={classNames('rounded-full px-2.5 py-1 text-[10px] font-bold', STATUS_STYLES[o.orderStatus] ?? 'bg-white/10 text-gray-300')}>
                        {o.orderStatus.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className={classNames('px-5 py-3 text-xs font-semibold', PAYMENT_STYLES[o.paymentStatus] ?? '')}>
                      {o.paymentStatus}
                    </td>
                    <td className="px-5 py-3 text-right font-display text-base font-extrabold text-leaf-500">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={classNames(
                'h-9 w-9 rounded-lg text-sm font-semibold transition-colors',
                page === i + 1 ? 'bg-leaf-500 text-leaf-950' : 'bg-white/5 text-gray-400 hover:text-white',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <Modal open={detail.isOpen} onClose={detail.close} title={selected?.orderNumber ?? 'Order'} maxWidth="max-w-2xl">
        {selected && (
          <div>
            <div className="flex items-center gap-3">
              <Select
                value={selected.orderStatus}
                onChange={(e) => setStatusOf(selected._id, e.target.value)}
                disabled={saving}
                options={STATUSES.filter((s) => s !== 'ALL').map((s) => ({ value: s, label: s.replaceAll('_', ' ') }))}
                className="w-52"
              />
              <span className={classNames('text-xs font-semibold', PAYMENT_STYLES[selected.paymentStatus])}>
                {selected.paymentStatus}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {selected.items.map((it) => (
                <div key={it.name} className="flex items-center gap-3">
                  {it.image && <img src={it.image} alt="" className="h-10 w-10 rounded-lg border border-white/10 object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{it.name}</p>
                    <p className="text-xs text-gray-500">Qty {it.quantity} · {formatINR(it.price)}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-200">{formatINR(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatINR(selected.subtotal)}</span></div>
              {selected.discount > 0 && (
                <div className="flex justify-between text-leaf-500"><span>Discount</span><span>− {formatINR(selected.discount)}</span></div>
              )}
              <div className="flex justify-between text-gray-400"><span>Tax</span><span>{formatINR(selected.tax)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Delivery</span><span>{formatINR(selected.deliveryFee)}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-display text-lg font-extrabold text-white">
                <span>Total</span><span className="text-leaf-500">{formatINR(selected.total)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
              <p className="font-bold text-white">{selected.shippingAddress.fullName}</p>
              <p className="mt-1 text-gray-400">
                {selected.shippingAddress.addressLine}, {selected.shippingAddress.city}, {selected.shippingAddress.state} {selected.shippingAddress.postalCode}
              </p>
              <p className="mt-1 text-gray-400">{selected.shippingAddress.phone}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}