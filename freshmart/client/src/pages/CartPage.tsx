import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBasket,
  TicketPercent,
  X,
  Loader2,
} from 'lucide-react'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatINR } from '@/utils/format'
import { EmptyState } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { toastSuccess, useToastStore } from '@/store/toastStore'
import { triggerCartPulse } from '@/utils/cartFx'

export default function CartPage() {
  const {
    cart,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    fetchCart,
  } = useCartStore()

  const { user, status } = useAuthStore()
  const navigate = useNavigate()

  const [couponInput, setCouponInput] = useState('')
  const [couponBusy, setCouponBusy] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const toast = useToastStore()

  useEffect(() => {
    if (status === 'authenticated') {
      void fetchCart()
    }
  }, [status, user?._id, fetchCart])

  const handleCoupon = async () => {
    if (!couponInput.trim()) return

    setCouponBusy(true)

    try {
      await applyCoupon(couponInput.trim())

      toastSuccess(
        'Coupon applied',
        couponInput.trim().toUpperCase(),
      )

      setCouponInput('')
    } catch {
      // Store/API handles the actual error.
    } finally {
      setCouponBusy(false)
    }
  }

  const handleRemove = async (
    itemId: string,
    name: string,
  ) => {
    setRemoving(itemId)

    const snapshot = cart

    try {
      await removeItem(itemId)

      toast.show({
        type: 'info',
        title: 'Item removed',
        description: name,
        action: {
          label: 'Undo',
          onClick: async () => {
            if (snapshot) {
              useCartStore.setState({
                cart: snapshot,
              })
            }

            await fetchCart()
          },
        },
      })
    } catch {
      // Store/API handles the actual error.
    } finally {
      setRemoving(null)
    }
  }

  /*
   * Authentication/loading safety.
   *
   * Do not try to render cart data until the user is authenticated.
   */
  if (status !== 'authenticated') {
    return (
      <div className="container-fm pt-24 pb-16">
        <EmptyState
          icon={ShoppingBasket}
          title="Sign in to view your cart"
          description="Your FreshMart basket is saved to your account."
          action={
            <Button
              onClick={() =>
                navigate('/login?redirect=/cart')
              }
            >
              Sign In
            </Button>
          }
        />
      </div>
    )
  }

  /*
   * Cart can initially be null while fetchCart() is running.
   * Treat it as an empty state instead of accessing cart.items.
   */
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="container-fm pt-24 pb-16">
        <EmptyState
          icon={ShoppingBasket}
          title="Your basket is feeling light"
          description="Let's fill it with something fresh."
          action={
            <Link
              to="/shop"
              className="btn-primary"
            >
              Explore Groceries
            </Link>
          }
        />
      </div>
    )
  }

  /*
   * Filter invalid/orphaned cart items.
   *
   * A cart item can exist in MongoDB even if its referenced
   * product was deleted. Never allow that to crash the page.
   */
  const validItems = cart.items.filter(
    (item) => item && item.product,
  )

  /*
   * If the cart only contains orphaned products, show
   * the empty state rather than rendering null.product.
   */
  if (validItems.length === 0) {
    return (
      <div className="container-fm pt-24 pb-16">
        <EmptyState
          icon={ShoppingBasket}
          title="Your basket is feeling light"
          description="Some products in your old cart are no longer available."
          action={
            <Link
              to="/shop"
              className="btn-primary"
            >
              Explore Groceries
            </Link>
          }
        />
      </div>
    )
  }

  /*
   * Backend normally provides summary.
   * Keep a safe fallback for older cart records/responses.
   */
  const summary = cart.summary ?? {
    itemsCount: validItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    ),
    subtotal: validItems.reduce(
      (sum, item) =>
        sum + item.priceSnapshot * item.quantity,
      0,
    ),
    discountFromMrp: validItems.reduce(
      (sum, item) => {
        const productPrice =
          item.product?.price ?? item.priceSnapshot

        return (
          sum +
          Math.max(
            0,
            productPrice - item.priceSnapshot,
          ) *
            item.quantity
        )
      },
      0,
    ),
    tax: 0,
    deliveryFee: 0,
  }

  const couponDiscount = cart.couponCode
    ? Math.min(summary.subtotal * 0.15, 250)
    : 0

  return (
    <div className="container-fm pt-24 pb-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="section-title">
          Your Cart
        </h1>

        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <AnimatePresence>
            {validItems.map((item) => {
              /*
               * Safe because validItems only contains items
               * where product exists.
               */
              const product = item.product

              const productId =
                product?._id ?? ''

              const productImage =
                item.imageSnapshot ||
                product?.images?.[0] ||
                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'

              const productUnit =
                item.unitSnapshot ||
                product?.unit ||
                'unit'

              const productPrice =
                product?.price ??
                item.priceSnapshot

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -40,
                    height: 0,
                    marginBottom: 0,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="card flex items-center gap-4 p-4"
                >
                  {productId ? (
                    <Link
                      to={`/product/${productId}`}
                      className="shrink-0"
                    >
                      <img
                        src={productImage}
                        alt={item.nameSnapshot}
                        className="h-20 w-20 rounded-xl object-cover"
                        onError={(event) => {
                          event.currentTarget.src =
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
                        }}
                      />
                    </Link>
                  ) : (
                    <div className="shrink-0">
                      <img
                        src={productImage}
                        alt={item.nameSnapshot}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {productId ? (
                      <Link
                        to={`/product/${productId}`}
                        className="line-clamp-1 text-sm font-semibold text-white hover:text-leaf-100"
                      >
                        {item.nameSnapshot}
                      </Link>
                    ) : (
                      <p className="line-clamp-1 text-sm font-semibold text-white">
                        {item.nameSnapshot}
                      </p>
                    )}

                    <p className="mt-0.5 text-xs text-gray-500">
                      {productUnit}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (item.quantity > 1) {
                                await updateItem(
                                  item._id,
                                  item.quantity - 1,
                                )

                                triggerCartPulse()
                              } else {
                                await handleRemove(
                                  item._id,
                                  item.nameSnapshot,
                                )
                              }
                            } catch {
                              // Prevent unhandled click errors.
                            }
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-300 hover:bg-white/10"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <motion.span
                          key={item.quantity}
                          initial={{
                            scale: 1.4,
                          }}
                          animate={{
                            scale: 1,
                          }}
                          className="w-7 text-center text-sm font-bold"
                        >
                          {item.quantity}
                        </motion.span>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await updateItem(
                                item._id,
                                item.quantity + 1,
                              )

                              triggerCartPulse()
                            } catch {
                              // Prevent unhandled click errors.
                            }
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-300 hover:bg-white/10"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {removing === item._id && (
                        <Loader2 className="h-4 w-4 animate-spin text-leaf-500" />
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {formatINR(
                        item.priceSnapshot *
                          item.quantity,
                      )}
                    </p>

                    <p className="text-xs text-gray-500 line-through">
                      {item.priceSnapshot <
                      productPrice
                        ? formatINR(
                            productPrice *
                              item.quantity,
                          )
                        : ''}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          item._id,
                          item.nameSnapshot,
                        )
                      }
                      className="mt-1 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Remove ${item.nameSnapshot}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="card sticky top-24 p-5">
            <h2 className="font-display text-lg font-bold text-white">
              Order Summary
            </h2>

            {cart.couponCode ? (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-leaf-500/30 bg-leaf-500/10 px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2 font-semibold text-leaf-100">
                  <TicketPercent className="h-4 w-4" />
                  {cart.couponCode}
                </span>

                <button
                  type="button"
                  onClick={() => removeCoupon()}
                  className="text-gray-400 hover:text-red-400"
                  aria-label="Remove coupon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(event) =>
                    setCouponInput(
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="Coupon code"
                  className="input py-2.5 text-sm uppercase"
                  aria-label="Coupon code"
                />

                <Button
                  variant="outline"
                  onClick={handleCoupon}
                  loading={couponBusy}
                  disabled={!couponInput.trim()}
                  className="px-4 py-2.5"
                >
                  Apply
                </Button>
              </div>
            )}

            <div className="mt-5 space-y-2.5 text-sm">
              <Row
                label={`Items (${summary.itemsCount})`}
                value={formatINR(summary.subtotal)}
              />

              {summary.discountFromMrp > 0 && (
                <Row
                  label="MRP savings"
                  value={`− ${formatINR(
                    summary.discountFromMrp,
                  )}`}
                  green
                />
              )}

              {couponDiscount > 0 && (
                <Row
                  label={`Coupon (${cart.couponCode})`}
                  value={`− ${formatINR(
                    couponDiscount,
                  )}`}
                  green
                />
              )}

              <Row
                label="Tax (5%)"
                value={formatINR(summary.tax)}
              />

              <Row
                label="Delivery"
                value={
                  summary.deliveryFee === 0
                    ? 'FREE'
                    : formatINR(
                        summary.deliveryFee,
                      )
                }
                green={summary.deliveryFee === 0}
              />

              <div className="border-t border-white/10 pt-3">
                <Row
                  label="Grand total"
                  value={formatINR(
                    summary.subtotal +
                      summary.tax +
                      summary.deliveryFee,
                  )}
                  strong
                />
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              className="mt-5"
              onClick={() =>
                navigate('/checkout')
              }
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Prices are recalculated and verified at checkout.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={async () => {
          try {
            await clearCart()

            toastSuccess(
              'Cart cleared',
              'Your cart is now empty.',
            )

            setConfirmClear(false)
          } catch {
            // Store/API handles the actual error.
          }
        }}
        title="Clear your cart?"
        description="All items will be removed from your basket."
        confirmLabel="Clear cart"
      />
    </div>
  )
}

function Row({
  label,
  value,
  green,
  strong,
}: {
  label: string
  value: string
  green?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          strong
            ? 'font-bold text-white'
            : 'text-gray-400'
        }
      >
        {label}
      </span>

      <motion.span
        key={value}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        className={
          strong
            ? 'font-display text-lg font-extrabold text-white'
            : green
              ? 'font-semibold text-leaf-500'
              : 'font-semibold text-gray-200'
        }
      >
        {value}
      </motion.span>
    </div>
  )
}