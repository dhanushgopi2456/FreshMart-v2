import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, Minus, Flame, Loader2 } from 'lucide-react'
import type { Product } from '@/types'
import { formatINR, discountPercent, classNames } from '@/utils/format'
import { Rating } from '@/components/ui/Feedback'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { toastSuccess } from '@/store/toastStore'
import { flyToCart, triggerCartPulse } from '@/utils/cartFx'

interface Props {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: Props) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { addItem, updateItem, cart } = useCartStore()
  const [adding, setAdding] = useState(false)
  const [qty, setQty] = useState(1)
  const [showQty, setShowQty] = useState(false)
  const [heartPulse, setHeartPulse] = useState(0)

  const wished = isWishlisted(product._id)
  const discount = discountPercent(product.price, product.discountPrice)
  const currentPrice = product.discountPrice ?? product.price
 const cartItem = cart?.items.find((i) => i.product?._id === product._id)
  const inCart = Boolean(cartItem)

  const handleAdd = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/product/${product._id}`))
      return
    }
    setAdding(true)
    try {
      await addItem(product._id, qty)
      flyToCart(product)
      triggerCartPulse()
      setShowQty(true)
      setQty(1)
      toastSuccess('Added to cart', product.name, {
        label: 'View Cart',
        onClick: () => navigate('/cart'),
      })
    } finally {
      setAdding(false)
    }
  }

  const handleQtyChange = async (delta: number) => {
    if (!cartItem) return
    const next = cartItem.quantity + delta
    if (next < 1) {
      setShowQty(false)
      return
    }
    try {
      await updateItem(cartItem._id, next)
      triggerCartPulse()
    } catch {
      /* handled by interceptor */
    }
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/product/${product._id}`))
      return
    }
    try {
      const { added } = await toggle(product)
      if (added) toastSuccess('Added to wishlist', product.name)
      setHeartPulse(Date.now())
    } catch {
      /* handled */
    }
  }

  const name = typeof product.category === 'object' ? product.category.name : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group relative"
    >
      <Link
        to={`/product/${product._id}`}
        className="card block overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-leaf-500/30 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="rounded-md bg-leaf-500 px-2 py-0.5 text-[11px] font-bold text-leaf-950">
                {discount}% OFF
              </span>
            )}
            {product.isBestSeller && (
              <span className="flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold text-amber-950">
                <Flame className="h-3 w-3" /> Bestseller
              </span>
            )}
          </div>

          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-midnight/70 backdrop-blur transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
          >
            <Heart
              className={classNames(
                'h-4.5 w-4.5 h-[18px] w-[18px] transition-all duration-300',
                wished ? 'fill-red-500 text-red-500' : 'text-gray-300',
              )}
              style={{
                transform: wished ? 'scale(1.1)' : undefined,
              }}
            />
            <AnimatePresence>
              {heartPulse > 0 && (
                <motion.span
                  key={heartPulse}
                  className="pointer-events-none absolute inset-0 rounded-full border border-red-400/60"
                  initial={{ opacity: 0.7, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="p-3.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-leaf-500/90">{name || 'FreshMart'}</span>
            {product.stock === 0 ? (
              <span className="text-[11px] font-semibold text-red-400">Out of stock</span>
            ) : product.stock <= (product.minStock ?? 5) ? (
              <span className="text-[11px] font-semibold text-amber-400">Low stock</span>
            ) : null}
          </div>

          <h3 className="line-clamp-1 text-sm font-semibold text-white">{product.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{product.unit}</p>

          <div className="mt-1.5">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>

          <div className="mt-2.5 flex items-end justify-between gap-2">
            <div>
              <p className="text-base font-extrabold text-white">{formatINR(currentPrice)}</p>
              {discount > 0 && (
                <p className="text-xs text-gray-500 line-through">{formatINR(product.price)}</p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!inCart || !showQty ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={(e) => {
                    e.preventDefault()
                    void handleAdd()
                  }}
                  disabled={adding || product.stock === 0}
                  aria-label={`Add ${product.name} to cart`}
                  className={classNames(
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:shadow-glow active:scale-90',
                    product.stock === 0 ? 'cursor-not-allowed bg-white/5 text-gray-500' : 'bg-leaf-500 text-leaf-950 hover:bg-leaf-400',
                  )}
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={2.6} />
                  )}
                </motion.button>
              ) : (
                <motion.div
                  key="qty"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="flex items-center gap-1 rounded-xl border border-leaf-500/40 bg-leaf-500/10 px-1 py-1"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      void handleQtyChange(-1)
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-leaf-500 transition-colors hover:bg-leaf-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <motion.span
                    key={cartItem?.quantity}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    className="w-6 text-center text-sm font-bold text-white"
                  >
                    {cartItem?.quantity}
                  </motion.span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      void handleQtyChange(1)
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-leaf-500 transition-colors hover:bg-leaf-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}