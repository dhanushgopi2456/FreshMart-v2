import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Category } from '@/types'

const iconMap: Record<string, string> = {
  Apple: '🍎',
  Carrot: '🥕',
  Milk: '🥛',
  Croissant: '🥐',
  CupSoda: '🧃',
  Cookie: '🍪',
  Fish: '🐟',
  SprayCan: '🧽',
  Sparkles: '✨',
}

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.5) }}
    >
      <Link
        to={`/shop?category=${category.slug}`}
        className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-leaf-500/40 hover:bg-leaf-500/5 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
      >
        <motion.span
          whileHover={{ scale: 1.15, rotate: -6 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-500/10 text-3xl"
        >
          {category.icon ? iconMap[category.icon] ?? '🛒' : '🛒'}
        </motion.span>
        <div>
          <h3 className="text-sm font-semibold text-white transition-colors group-hover:text-leaf-100">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{category.description}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}