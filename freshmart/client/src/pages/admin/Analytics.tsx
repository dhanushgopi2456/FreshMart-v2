import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { adminApi } from '@/services'
import { formatINR, formatDate } from '@/utils/format'
import { Skeleton } from '@/components/ui/Feedback'

interface Analytics {
  daily: Array<{ date: string; revenue: number; orders: number }>
  bestSellers: Array<{ _id: string; qty: number; revenue: number }>
  statusDistribution: Array<{ _id: string; count: number }>
}

const COLORS = ['#00d46a', '#38bdf8', '#a78bfa', '#fbbf24', '#fb923c', '#f87171', '#94a3b8']

function RevenueChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  const max = Math.max(...data.map((d) => d.revenue), 1)
  return (
    <div className="mt-6 flex h-48 items-end gap-1.5">
      {data.map((d, i) => {
        const h = Math.max(4, (d.revenue / max) * 100)
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.02, type: 'spring', stiffness: 200, damping: 24 }}
            className="group relative flex-1 rounded-t-md bg-gradient-to-t from-leaf-600/40 to-leaf-500 transition-colors hover:from-leaf-500 hover:to-leaf-400"
          >
            <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-midnight-200 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              {formatDate(d.date)} · {formatINR(d.revenue)}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function Analytics() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminApi
      .analytics(days)
      .then(({ data }) => setData(data.analytics))
      .finally(() => setLoading(false))
  }, [days])

  const totalRevenue = useMemo(() => (data?.daily ?? []).reduce((s, d) => s + d.revenue, 0), [data])
  const totalOrders = useMemo(() => (data?.daily ?? []).reduce((s, d) => s + d.orders, 0), [data])
  const maxStatus = useMemo(() => Math.max(...(data?.statusDistribution ?? []).map((s) => s.count), 1), [data])

  if (loading || !data) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-400">
            {formatINR(totalRevenue)} revenue across {totalOrders} orders in {days} days.
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                days === d ? 'bg-leaf-500 text-leaf-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <BarChart3 className="h-4 w-4 text-leaf-500" /> Daily Revenue
          </h2>
          <RevenueChart data={data.daily} />
          <div className="mt-3 flex justify-between text-[10px] text-gray-500">
            <span>{data.daily[0]?.date ? formatDate(data.daily[0].date) : ''}</span>
            <span>{data.daily[data.daily.length - 1]?.date ? formatDate(data.daily[data.daily.length - 1].date) : ''}</span>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-white">Order Status</h2>
          <div className="mt-5 space-y-4">
            {data.statusDistribution.map((s, i) => (
              <div key={s._id}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-200">{s._id.replaceAll('_', ' ')}</span>
                  <span className="text-gray-400">{s.count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / maxStatus) * 100}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="font-display text-lg font-bold text-white">Best Sellers</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-500">
                <th className="pb-3 pr-4 font-semibold">Product</th>
                <th className="pb-3 pr-4 font-semibold">Units sold</th>
                <th className="pb-3 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.bestSellers.map((b) => (
                <tr key={b._id}>
                  <td className="py-3 pr-4 font-semibold text-white">{b._id}</td>
                  <td className="py-3 pr-4 text-gray-400">{b.qty}</td>
                  <td className="py-3 font-bold text-leaf-500">{formatINR(b.revenue)}</td>
                </tr>
              ))}
              {data.bestSellers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">No sales in this window.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}