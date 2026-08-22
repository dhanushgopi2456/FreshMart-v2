import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBasket } from 'lucide-react'

export function Logo({ compact = false, link = true }: { compact?: boolean; link?: boolean }) {
  const inner = (
    <span className="flex items-center gap-2.5">
      <motion.span
        whileHover={{ rotate: -8, scale: 1.05 }}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-500 text-leaf-950 shadow-glow"
      >
        <ShoppingBasket className="h-5 w-5" strokeWidth={2.4} />
      </motion.span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Fresh<span className="text-gradient">Mart</span>
          </span>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-500">
            3D Organic Marketplace
          </span>
        </span>
      )}
    </span>
  )

  if (!link) return inner
  return (
    <Link to="/" aria-label="FreshMart home" className="focus-ring rounded-lg">
      {inner}
    </Link>
  )
}