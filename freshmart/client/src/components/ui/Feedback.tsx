import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Star } from 'lucide-react'
import { classNames } from '@/utils/format'

export function Rating({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  const px = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={classNames(
              px,
              i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-600',
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-300">{value?.toFixed(1) || '0.0'}</span>
      {count !== undefined && <span className="text-xs text-gray-500">({count})</span>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('animate-pulse rounded-lg bg-white/5', className)} aria-hidden />
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="relative mb-5">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-20 w-20 items-center justify-center rounded-full border border-leaf-500/20 bg-leaf-500/10"
        >
          <Icon className="h-9 w-9 text-leaf-500" />
        </motion.div>
        <motion.span
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-leaf-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <AlertTriangleIcon className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

import { AlertTriangle as AlertTriangleIcon } from 'lucide-react'

export function LoadingOverlay({ label }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-midnight/80 backdrop-blur-sm"
      role="status"
      aria-label={label}
    >
      <div className="relative h-14 w-14">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-leaf-500/20 border-t-leaf-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {label && <p className="mt-4 text-sm text-gray-300">{label}</p>}
    </motion.div>
  )
}