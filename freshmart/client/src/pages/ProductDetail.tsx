import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ShoppingCart,
  Zap,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RefreshCcw,
  CheckCircle2,
} from 'lucide-react'

import { productApi, reviewApi } from '@/services'
import type { Product, Review } from '@/types'
import { formatINR, discountPercent, classNames } from '@/utils/format'
import { Rating } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ProductCard'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { toastSuccess } from '@/store/toastStore'
import { flyToCart, triggerCartPulse } from '@/utils/cartFx'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  const [loading, setLoading] = useState(true)

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)

  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  // --------------------------------------------------
  // STORES
  // --------------------------------------------------

  const { user } = useAuthStore()

  const {
    addItem,
    updateItem,
    cart,
  } = useCartStore()

  const {
    toggle,
    isWishlisted,
  } = useWishlistStore()

  // --------------------------------------------------
  // LOAD PRODUCT
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true

    if (!id) {
      setProduct(null)
      setRelated([])
      setReviews([])
      setLoading(false)
      return
    }

    setLoading(true)
    setProduct(null)
    setRelated([])
    setReviews([])
    setActiveImg(0)
    setQty(1)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    const loadProduct = async () => {
      try {
        const response = await productApi.get(id)

        if (!mounted) return

        const loadedProduct = response.data.product
        const loadedRelated = response.data.related ?? []

        setProduct(loadedProduct ?? null)
        setRelated(
          Array.isArray(loadedRelated)
            ? loadedRelated.filter(Boolean)
            : [],
        )

        // Reviews are optional. A review API failure
        // should never make the product page crash.
        try {
          const reviewResponse = await reviewApi.list(id)

          if (!mounted) return

          setReviews(
            Array.isArray(reviewResponse.data.reviews)
              ? reviewResponse.data.reviews.filter(Boolean)
              : [],
          )
        } catch {
          if (mounted) {
            setReviews([])
          }
        }
      } catch {
        if (!mounted) return

        setProduct(null)
        setRelated([])
        setReviews([])
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      mounted = false
    }
  }, [id])

  // --------------------------------------------------
  // SAFE PRODUCT VALUES
  // --------------------------------------------------

  const discount = product
    ? discountPercent(product.price, product.discountPrice)
    : 0

  const currentPrice = product
    ? product.discountPrice ?? product.price
    : 0

  const wished = product
    ? isWishlisted(product._id)
    : false

  const cartItem = product
    ? cart?.items.find(
        (item) => item.product?._id === product._id,
      )
    : undefined

  // IMPORTANT:
  // Do NOT use useMemo here.
  //
  // reviews is already an array and doesn't need memoization.
  // This also prevents the "Rendered more hooks than during
  // the previous render" error.
  const allReviews = reviews

  // --------------------------------------------------
  // ADD TO CART
  // --------------------------------------------------

  const handleAdd = async () => {
    if (!product) return

    if (!user) {
      navigate(
        '/login?redirect=' +
          encodeURIComponent(`/product/${product._id}`),
      )
      return
    }

    setAdding(true)

    try {
      await addItem(product._id, qty)

      flyToCart(product)
      triggerCartPulse()

      toastSuccess(
        'Added to cart',
        product.name,
        {
          label: 'View Cart',
          onClick: () => navigate('/cart'),
        },
      )
    } catch {
      // The cart store handles the actual API error.
    } finally {
      setAdding(false)
    }
  }

  // --------------------------------------------------
  // BUY NOW
  // --------------------------------------------------

  const handleBuyNow = async () => {
    if (!product) return

    if (!user) {
      navigate(
        '/login?redirect=' +
          encodeURIComponent(`/product/${product._id}`),
      )
      return
    }

    setBuying(true)

    try {
      await addItem(product._id, qty)
      navigate('/checkout')
    } finally {
      setBuying(false)
    }
  }

  // --------------------------------------------------
  // WISHLIST
  // --------------------------------------------------

  const handleWishlist = async () => {
    if (!product) return

    if (!user) {
      navigate(
        '/login?redirect=' +
          encodeURIComponent(`/product/${product._id}`),
      )
      return
    }

    try {
      const { added } = await toggle(product)

      if (added) {
        toastSuccess(
          'Added to wishlist',
          product.name,
        )
      } else {
        toastSuccess(
          'Removed from wishlist',
          product.name,
        )
      }
    } catch {
      // Prevent an unhandled promise from crashing the page.
    }
  }

  // --------------------------------------------------
  // REVIEW
  // --------------------------------------------------

  const handleReview = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault()

    if (!product) return

    if (reviewText.trim().length < 5) {
      return
    }

    setSubmittingReview(true)

    try {
      await reviewApi.add(
        product._id,
        {
          rating: reviewRating,
          text: reviewText.trim(),
        },
      )

      toastSuccess(
        'Review submitted',
        'Thanks for sharing your experience!',
      )

      setReviewText('')

      const response = await reviewApi.list(
        product._id,
      )

      setReviews(
        Array.isArray(response.data.reviews)
          ? response.data.reviews.filter(Boolean)
          : [],
      )
    } finally {
      setSubmittingReview(false)
    }
  }

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="container-fm pt-24 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Image skeleton */}
          <div className="card aspect-square animate-pulse" />

          {/* Details skeleton */}
          <div className="space-y-4 pt-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-white/5" />

            <div className="h-10 w-3/4 animate-pulse rounded bg-white/5" />

            <div className="h-5 w-1/2 animate-pulse rounded bg-white/5" />

            <div className="h-14 w-1/3 animate-pulse rounded bg-white/5" />

            <div className="h-20 w-full animate-pulse rounded bg-white/5" />
          </div>

        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // PRODUCT NOT FOUND
  // --------------------------------------------------

  if (!product) {
    return (
      <div className="container-fm pt-24 pb-16 text-center">
        <h1 className="section-title">
          Product not found
        </h1>

        <p className="mt-3 text-gray-400">
          The product may have been removed or is no
          longer available.
        </p>

        <Link
          to="/shop"
          className="btn-primary mt-6 inline-flex"
        >
          Back to Shop
        </Link>
      </div>
    )
  }

  // --------------------------------------------------
  // PRODUCT DATA
  // --------------------------------------------------

  const images =
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images.filter(Boolean)
      : [
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        ]

  // Make sure active image is always valid.
  const safeActiveImg =
    activeImg >= 0 && activeImg < images.length
      ? activeImg
      : 0

  const categoryName =
    product.category &&
    typeof product.category === 'object'
      ? product.category.name
      : ''

  const categorySlug =
    product.category &&
    typeof product.category === 'object'
      ? product.category.slug
      : ''

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="pt-24 pb-16">
      <div className="container-fm">

        {/* --------------------------------------------------
            BREADCRUMB
        -------------------------------------------------- */}

        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-leaf-100"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            to="/shop"
            className="hover:text-leaf-100"
          >
            Shop
          </Link>

          {categoryName && (
            <>
              <span>/</span>

              <Link
                to={
                  categorySlug
                    ? `/shop?category=${categorySlug}`
                    : '/shop'
                }
                className="hover:text-leaf-100"
              >
                {categoryName}
              </Link>
            </>
          )}

          <span>/</span>

          <span className="text-gray-300">
            {product.name}
          </span>
        </nav>

        {/* --------------------------------------------------
            PRODUCT MAIN SECTION
        -------------------------------------------------- */}

        <div className="grid gap-10 lg:grid-cols-2">

          {/* ==================================================
              GALLERY
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <div className="card relative overflow-hidden">

              <AnimatePresence mode="wait">
                <motion.img
                  key={`${product._id}-${safeActiveImg}`}
                  src={images[safeActiveImg]}
                  alt={product.name}
                  initial={{
                    opacity: 0,
                    scale: 1.04,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                  className="aspect-square w-full object-cover"
                  onError={(event) => {
                    const target =
                      event.currentTarget

                    target.src =
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'
                  }}
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute left-4 top-4 flex flex-col gap-2">

                {discount > 0 && (
                  <span className="rounded-lg bg-leaf-500 px-3 py-1 text-sm font-bold text-leaf-950">
                    {discount}% OFF
                  </span>
                )}

                {product.isBestSeller && (
                  <span className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-amber-950">
                    Bestseller
                  </span>
                )}

              </div>

              {/* Out of stock */}
              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-midnight/60 backdrop-blur-sm">
                  <span className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold">
                    Out of stock
                  </span>
                </div>
              )}

            </div>

            {/* Image thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() =>
                      setActiveImg(index)
                    }
                    className={classNames(
                      'h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                      safeActiveImg === index
                        ? 'border-leaf-500'
                        : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ==================================================
              PRODUCT INFORMATION
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
          >

            {/* Category + Brand */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-leaf-500">
                {categoryName || 'FreshMart'}
              </span>

              {product.brand && (
                <span className="text-xs text-gray-500">
                  · {product.brand}
                </span>
              )}
            </div>

            {/* Product name */}
            <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3">
              <Rating
                value={product.rating}
                count={product.reviewCount}
                size="md"
              />
            </div>

            {/* Price */}
            <div className="mt-6 flex items-end gap-3">
              <p className="font-display text-4xl font-extrabold text-white">
                {formatINR(currentPrice)}
              </p>

              {discount > 0 && (
                <>
                  <p className="pb-1 text-lg text-gray-500 line-through">
                    {formatINR(product.price)}
                  </p>

                  <p className="pb-1 text-sm font-bold text-leaf-500">
                    {discount}% off
                  </p>
                </>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              per {product.unit}
            </p>

            {/* Stock */}
            <div className="mt-6 flex flex-wrap gap-2">
              {product.stock > 0 &&
              product.stock <=
                (product.minStock ?? 5) ? (
                <span className="chip border-amber-500/40 bg-amber-500/10 text-amber-300">
                  Only {product.stock} left
                </span>
              ) : product.stock > 0 ? (
                <span className="chip">
                  <CheckCircle2 className="h-3 w-3" />
                  In stock
                </span>
              ) : (
                <span className="chip border-red-500/40 bg-red-500/10 text-red-300">
                  Out of stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-6 text-gray-400">
              {product.description}
            </p>

            {/* ==================================================
                QUANTITY + ACTIONS
            ================================================== */}

            <div className="mt-8 flex flex-wrap items-center gap-4">

              {/* Quantity */}
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">

                <button
                  type="button"
                  onClick={() =>
                    setQty((q) =>
                      Math.max(1, q - 1),
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <motion.span
                  key={qty}
                  initial={{
                    scale: 1.3,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="w-10 text-center font-bold"
                >
                  {qty}
                </motion.span>

                <button
                  type="button"
                  onClick={() =>
                    setQty((q) =>
                      Math.min(99, q + 1),
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>

              </div>

              {/* Add to cart */}
              <Button
                onClick={handleAdd}
                loading={adding}
                disabled={product.stock === 0}
                className="flex-1 sm:min-w-[200px] sm:flex-none"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>

              {/* Buy now */}
              <Button
                onClick={handleBuyNow}
                loading={buying}
                disabled={product.stock === 0}
                variant="outline"
                className="flex-1 sm:min-w-[160px] sm:flex-none"
              >
                <Zap className="h-4 w-4" />
                Buy Now
              </Button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={handleWishlist}
                className={classNames(
                  'flex h-12 w-12 items-center justify-center rounded-xl border transition-all',
                  wished
                    ? 'border-red-500/50 bg-red-500/10 text-red-400'
                    : 'border-white/10 text-gray-300 hover:border-red-500/40 hover:text-red-400',
                )}
                aria-label={
                  wished
                    ? 'Remove from wishlist'
                    : 'Add to wishlist'
                }
              >
                <Heart
                  className={classNames(
                    'h-5 w-5 transition-transform',
                    wished &&
                      'scale-110 fill-red-500',
                  )}
                />
              </button>

            </div>

            {/* ==================================================
                CART ITEM
            ================================================== */}

            {cartItem && (
              <div className="mt-4 flex items-center gap-2 text-sm text-leaf-100">

                <span className="text-gray-500">
                  In cart:
                </span>

                <div className="flex items-center gap-1 rounded-lg border border-leaf-500/30 bg-leaf-500/10 px-2 py-1">

                  <button
                    type="button"
                    onClick={() =>
                      cartItem.quantity > 1 &&
                      updateItem(
                        cartItem._id,
                        cartItem.quantity - 1,
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center text-leaf-500"
                    aria-label="Decrease cart quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <span className="w-6 text-center font-bold">
                    {cartItem.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateItem(
                        cartItem._id,
                        cartItem.quantity + 1,
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center text-leaf-500"
                    aria-label="Increase cart quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>

                </div>

                <Link
                  to="/cart"
                  className="text-xs font-semibold text-leaf-500 hover:text-leaf-400"
                >
                  View Cart →
                </Link>

              </div>
            )}

            {/* ==================================================
                FEATURES
            ================================================== */}

            <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">

              {[
                {
                  icon: Truck,
                  text: '30-min delivery',
                },
                {
                  icon: ShieldCheck,
                  text: 'Quality checked',
                },
                {
                  icon: RefreshCcw,
                  text: 'Easy returns',
                },
              ].map((feature) => {
                const Icon = feature.icon

                return (
                  <div
                    key={feature.text}
                    className="flex items-center gap-2 text-xs text-gray-400"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-leaf-500" />

                    {feature.text}
                  </div>
                )
              })}

            </div>

          </motion.div>
        </div>

        {/* ==================================================
            REVIEWS
        ================================================== */}

        <section className="mt-16">
          <div className="grid gap-8 lg:grid-cols-3">

            {/* Review form */}
            <div>
              <h2 className="section-title text-2xl">
                Customer Reviews
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {allReviews.length} reviews
              </p>

              {user ? (
                <form
                  onSubmit={handleReview}
                  className="card mt-6 space-y-4 p-5"
                >
                  <h3 className="text-sm font-bold text-white">
                    Write a review
                  </h3>

                  {/* Rating selector */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(
                      (rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setReviewRating(
                              rating,
                            )
                          }
                          className={classNames(
                            'text-2xl transition-transform hover:scale-110',
                            rating <=
                              reviewRating
                              ? 'text-amber-400'
                              : 'text-gray-600',
                          )}
                          aria-label={`${rating} stars`}
                        >
                          ★
                        </button>
                      ),
                    )}
                  </div>

                  {/* Review text */}
                  <textarea
                    value={reviewText}
                    onChange={(event) =>
                      setReviewText(
                        event.target.value,
                      )
                    }
                    placeholder="Share your experience with this product..."
                    className="input min-h-[90px]"
                    required
                    minLength={5}
                  />

                  <Button
                    type="submit"
                    loading={submittingReview}
                    disabled={
                      reviewText.trim().length < 5
                    }
                  >
                    Submit Review
                  </Button>
                </form>
              ) : (
                <div className="card mt-6 p-5 text-sm text-gray-400">
                  <Link
                    to={`/login?redirect=/product/${product._id}`}
                    className="font-semibold text-leaf-100 hover:text-leaf-500"
                  >
                    Sign in
                  </Link>{' '}
                  to write a review.
                </div>
              )}
            </div>

            {/* Review list */}
            <div className="space-y-4 lg:col-span-2">

              {allReviews.length === 0 ? (
                <div className="card p-8 text-center text-sm text-gray-400">
                  No reviews yet. Be the first!
                </div>
              ) : (
                allReviews.map((review) => (
                  <div
                    key={review._id}
                    className="card p-5"
                  >
                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        {/* Avatar */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-500/20 text-xs font-bold text-leaf-100">
                          {review.user?.name?.[0]?.toUpperCase() ??
                            'U'}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-white">
                            {review.user?.name ??
                              'Customer'}
                          </p>

                          <div className="flex items-center gap-2">

                            <Rating
                              value={review.rating}
                              size="sm"
                            />

                            {review.isVerifiedPurchase && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-leaf-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified Purchase
                              </span>
                            )}

                          </div>
                        </div>

                      </div>

                      <span className="text-xs text-gray-500">
                        {new Date(
                          review.createdAt,
                        ).toLocaleDateString(
                          'en-IN',
                        )}
                      </span>

                    </div>

                    {review.title && (
                      <p className="mt-3 text-sm font-semibold text-gray-200">
                        {review.title}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-gray-400">
                      {review.text}
                    </p>

                  </div>
                ))
              )}

            </div>
          </div>
        </section>

        {/* ==================================================
            RELATED PRODUCTS
        ================================================== */}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title text-2xl">
              You may also like
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related
                .filter(Boolean)
                .map((relatedProduct, index) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                    index={index}
                  />
                ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}