import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { formatINR, discountPercent } from '@/utils/format'
import { EmptyState, Rating } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { toastSuccess } from '@/store/toastStore'
import { flyToCart, triggerCartPulse } from '@/utils/cartFx'

export default function Wishlist() {
  const { products, remove, fetchWishlist, loading } = useWishlistStore()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
    const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (user) void fetchWishlist()
  }, [user?._id])

  const moveToCart = async (productId: string, name: string, image: string) => {
    setBusy(productId)
    try {
      await addItem(productId, 1)
      flyToCart({ name, images: [image] })
      triggerCartPulse()
      toastSuccess('Added to cart', name)
    } finally {
      setBusy(null)
    }
  }

  if (!loading && products.length === 0) {
    return (
      <div className="container-fm pt-24 pb-16">
        <EmptyState
          icon={Heart}
          title="Save something you love"
          description="Tap the heart on any product to keep it here for later."
          action={
            <Link to="/shop" className="btn-primary">
              Discover Products
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-fm pt-24 pb-16">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Saved for later</p>
        <h1 className="section-title">Your Wishlist</h1>
        <p className="mt-2 text-sm text-gray-400">{products.length} items</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence>
          {products.map((p) => {
            const discount = discountPercent(p.price, p.discountPrice)
            return (
              <motion.div
                key={p._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3 }}
                className="card group overflow-hidden transition-all hover:border-leaf-500/30"
              >
                <Link to={`/product/${p._id}`} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={p.images?.[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {discount > 0 && (
                      <span className="absolute left-2.5 top-2.5 rounded-md bg-leaf-500 px-2 py-0.5 text-[11px] font-bold text-leaf-950">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-3.5">
                  <h3 className="line-clamp-1 text-sm font-semibold text-white">{p.name}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{p.unit}</p>
                  <div className="mt-1.5">
                    <Rating value={p.rating} count={p.reviewCount} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-white">{formatINR(p.discountPrice ?? p.price)}</p>
                      {discount > 0 && <p className="text-xs text-gray-500 line-through">{formatINR(p.price)}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => moveToCart(p._id, p.name, p.images?.[0] ?? '')}
                        loading={busy === p._id}
                        disabled={p.stock === 0}
                        aria-label={`Add ${p.name} to cart`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </Button>
                      <button
                        onClick={async () => {
                          await remove(p._id)
                          toastSuccess('Removed from wishlist', p.name)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition-colors hover:border-red-500/40 hover:text-red-400"
                        aria-label={`Remove ${p.name} from wishlist`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}