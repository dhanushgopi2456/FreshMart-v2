import { useEffect, useState } from 'react'
import { Search, Boxes, Minus, Plus } from 'lucide-react'
import { adminApi } from '@/services'
import type { Product } from '@/types'
import { formatINR, classNames } from '@/utils/format'
import { Input } from '@/components/ui/Input'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

type StatusFilter = 'ALL' | 'IN' | 'LOW' | 'OUT'

const TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'IN', label: 'In Stock' },
  { value: 'LOW', label: 'Low' },
  { value: 'OUT', label: 'Out' },
]

export default function Inventory() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [adjusting, setAdjusting] = useState<string | null>(null)

  const load = (s: StatusFilter = status, query = q, p = page) => {
    setLoading(true)
    adminApi
      .inventory({ page: p, status: s, q: query || undefined })
      .then(({ data }) => {
        setItems(data.items)
        setTotalPages(data.pagination.totalPages)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(status, q, page)
  }, [status, page])

  const adjust = async (p: Product, delta: number) => {
    setAdjusting(p._id)
    try {
      const { data } = await adminApi.updateInventory(p._id, { stock: Math.max(0, p.stock + delta) })
      setItems((list) => list.map((it) => (it._id === p._id ? data.product : it)))
    } catch (err) {
      toastError(err, 'Could not update stock')
    } finally {
      setAdjusting(null)
    }
  }

  const quickSet = async (p: Product, value: number) => {
    setAdjusting(p._id)
    try {
      const { data } = await adminApi.updateInventory(p._id, { stock: Math.max(0, value) })
      setItems((list) => list.map((it) => (it._id === p._id ? data.product : it)))
      toastSuccess(`${p.name} updated`)
    } catch (err) {
      toastError(err, 'Could not update stock')
    } finally {
      setAdjusting(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white">Inventory</h1>
      <p className="mt-1 text-sm text-gray-400">Adjust stock levels quickly.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setStatus(t.value)
                setPage(1)
              }}
              className={classNames(
                'rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors',
                status === t.value ? 'bg-leaf-500 text-leaf-950' : 'text-gray-400 hover:text-white',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search by name or SKU..."
            className="pl-10"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              clearTimeout((window as any).__invT)
              ;(window as any).__invT = setTimeout(() => load(status, e.target.value, 1), 350)
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
      ) : items.length === 0 ? (
        <EmptyState icon={Boxes} title="Nothing here" description="No products match these filters." />
      ) : (
        <div className="card mt-6 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">SKU</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Stock</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((p) => {
                  const state = p.stock === 0 ? 'out' : p.stock <= (p.minStock ?? 5) ? 'low' : 'ok'
                  return (
                    <tr key={p._id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-lg border border-white/10 object-cover" />
                          <span className="max-w-[240px] truncate font-semibold text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {p.discountPrice && p.discountPrice < p.price ? formatINR(p.discountPrice) : formatINR(p.price)}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.sku ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span
                          className={classNames(
                            'rounded-full px-2.5 py-1 text-[10px] font-bold',
                            state === 'ok' && 'bg-leaf-500/10 text-leaf-500',
                            state === 'low' && 'bg-amber-500/10 text-amber-400',
                            state === 'out' && 'bg-red-500/10 text-red-400',
                          )}
                        >
                          {state === 'ok' ? 'In Stock' : state === 'low' ? 'Low' : 'Out'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => adjust(p, -1)}
                            disabled={adjusting === p._id}
                            className="rounded-lg bg-white/5 p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            value={p.stock}
                            onChange={(e) => quickSet(p, Number(e.target.value))}
                            className={classNames(
                              'w-16 rounded-lg border border-white/10 bg-midnight-200 px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-leaf-500/60',
                              state === 'low' ? 'text-amber-400' : state === 'out' ? 'text-red-400' : 'text-leaf-500',
                            )}
                          />
                          <button
                            onClick={() => adjust(p, 1)}
                            disabled={adjusting === p._id}
                            className="rounded-lg bg-white/5 p-1.5 text-gray-400 hover:bg-leaf-500/10 hover:text-leaf-500 disabled:opacity-40"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-gray-500">min {p.minStock ?? 5}</td>
                    </tr>
                  )
                })}
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
    </div>
  )
}