import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Compass, Home, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-fm flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
          <Compass className="h-14 w-14 text-leaf-500" />
        </div>
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-leaf-500/20"
          animate={{ scale: [1, 1.4], opacity: [1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h1 className="mt-8 font-display text-6xl font-extrabold text-white">
          4<span className="text-leaf-500">0</span>4
        </h1>
        <p className="mt-3 font-display text-xl font-bold text-gray-200">This aisle doesn't exist</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
          The page you're looking for has been moved, or never stocked. Let's get you back to the fresh stuff.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary px-6 py-3">
            <Home className="h-4 w-4" /> Go Home
          </Link>
          <Link to="/shop" className="btn-outline px-6 py-3">
            <ShoppingBag className="h-4 w-4" /> Browse Shop
          </Link>
        </div>
      </motion.div>
    </div>
  )
}