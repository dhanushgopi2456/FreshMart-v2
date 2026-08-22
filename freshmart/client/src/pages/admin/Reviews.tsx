import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, StarHalf, Check, X } from 'lucide-react'
import { adminApi } from '@/services'
import type { Review } from '@/types'
import { formatDate, classNames } from '@/utils/format'
import { Select } from '@/components/ui/Input'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        if (rating >= n) return <Star key={n} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        if (rating >= n - 0.5) return <StarHalf key={n} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        return <Star key={n} className="h-3.5 w-3.5 text-gray-600" />
      })}
    </div>
  )
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = (s = status, p = page) => {
    setLoading(true)
    adminApi
      .reviews({ page: p, status: s })
      .then(({ data }) => {
        setReviews(data.reviews)
        setTotalPages(data.pagination.totalPages)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(status, page)
  }, [status, page])

  const moderate = async (id: string, next: 'APPROVED' | 'REJECTED') => {
    setBusyId(id)
    try {
      await adminApi.moderateReview(id, next)
      toastSuccess(next === 'APPROVED' ? 'Review approved' : 'Review rejected')
      load()
    } catch (err) {
      toastError(err, 'Could not moderate')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white">Reviews</h1>
      <p className="mt-1 text-sm text-gray-400">Moderate customer feedback.</p>

      <div className="mt-6">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          options={[
            { value: 'ALL', label: 'All reviews' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
          className="w-48"
        />
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews" description="No reviews match this filter." />
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint/15 text-xs font-bold text-mint">
                      {r.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{r.user?.name ?? 'Unknown'}</p>
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        {formatDate(r.createdAt)}
                        {r.isVerifiedPurchase && <span className="rounded-full bg-leaf-500/10 px-2 py-0.5 text-[9px] font-bold text-leaf-500">VERIFIED</span>}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-400">Product: <span className="font-semibold text-gray-200">{(r.product as unknown as { name?: string })?.name ?? '—'}</span></p>
                  {r.title && <p className="mt-2 font-semibold text-gray-200">{r.title}</p>}
                  <p className="mt-1 text-sm text-gray-400">{r.text}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Stars rating={r.rating} />
                  <span className={classNames('rounded-full px-2.5 py-1 text-[10px] font-bold', r.status === 'APPROVED' ? 'bg-leaf-500/10 text-leaf-500' : r.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400')}>
                    {r.status}
                  </span>
                </div>
              </div>
              {r.status === 'PENDING' && (
                <div className="mt-4 flex justify-end gap-2 border-t border-white/10 pt-3">
                  <button
                    onClick={() => moderate(r._id, 'REJECTED')}
                    disabled={busyId === r._id}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                  >
                    <X className="mr-1 inline h-3.5 w-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => moderate(r._id, 'APPROVED')}
                    disabled={busyId === r._id}
                    className="rounded-lg bg-leaf-500 px-3 py-1.5 text-xs font-semibold text-leaf-950 transition-colors hover:bg-leaf-400 disabled:opacity-40"
                  >
                    <Check className="mr-1 inline h-3.5 w-3.5" /> Approve
                  </button>
                </div>
              )}
            </motion.div>
          ))}
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