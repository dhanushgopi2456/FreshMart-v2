import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Truck,
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  Banknote,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { accountApi, orderApi } from '@/services'
import { formatINR, classNames } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import {
  loadRazorpay,
  openRazorpay,
  mockPay,
  isMockSignature,
} from '@/services/razorpay'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'
import type { Address, Order } from '@/types'

type Step = 0 | 1 | 2 | 3

const steps = ['Address', 'Delivery', 'Payment', 'Confirmation']

interface AddressForm {
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  landmark?: string
}

export default function Checkout() {
  const { cart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(0)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')
  const [processing, setProcessing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  const [form, setForm] = useState<AddressForm>({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
  })

  /*
   * Keep user information in the address form if the user
   * becomes available after the Checkout page initially mounts.
   */
  useEffect(() => {
    if (!user) return

    setForm((previous) => ({
      ...previous,
      fullName: previous.fullName || user.name || '',
      phone: previous.phone || user.phone || '',
    }))
  }, [user])

  /*
   * Load saved addresses.
   */
  useEffect(() => {
    if (!user) {
      setAddresses([])
      setSelectedAddress('')
      return
    }

    let cancelled = false

    const loadAddresses = async () => {
      try {
        const { data } = await accountApi.addresses()

        if (cancelled) return

        const loadedAddresses = Array.isArray(data.addresses)
          ? data.addresses
          : []

        setAddresses(loadedAddresses)

        const defaultAddress =
          loadedAddresses.find((address) => address.isDefault) ??
          loadedAddresses[0]

        if (defaultAddress?._id) {
          setSelectedAddress(defaultAddress._id)
        } else {
          setSelectedAddress('')
        }
      } catch (err) {
        if (!cancelled) {
          setAddresses([])
          setSelectedAddress('')
          toastError(err, 'Could not load saved addresses')
        }
      }
    }

    void loadAddresses()

    return () => {
      cancelled = true
    }
  }, [user])

  /*
   * Navigate after an order is successfully placed.
   *
   * This avoids calling navigate() directly during render.
   */
  useEffect(() => {
    if (!placedOrder) return

    navigate('/order-success', {
      replace: true,
      state: {
        order: placedOrder,
      },
    })
  }, [placedOrder, navigate])

  const summary = cart?.summary
  const subtotal = summary?.subtotal ?? 0
  const tax = summary?.tax ?? 0
  const deliveryFee = summary?.deliveryFee ?? 0
  const grandTotal = subtotal + tax + deliveryFee

  const selectedAddr = addresses.find(
    (address) => address._id === selectedAddress,
  )

  /*
   * Continue is enabled only when:
   * 1. We are on Address step
   * 2. A selected address exists
   * 3. That address actually exists in the loaded addresses
   */
  const canProceed =
    step !== 0 ||
    Boolean(
      selectedAddress &&
        addresses.some((address) => address._id === selectedAddress),
    )

  /*
   * Save a new delivery address.
   */
  const handleSaveAddress = async () => {
    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine: form.addressLine.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      landmark: form.landmark?.trim() || undefined,
      isDefault: addresses.length === 0,
    }

    if (
      !payload.fullName ||
      !payload.phone ||
      !payload.addressLine ||
      !payload.city ||
      !payload.state ||
      !payload.postalCode
    ) {
      toastError(
        new Error('Please fill all required address fields'),
        'Incomplete address',
      )
      return
    }

    try {
      const { data } = await accountApi.addAddress(payload)

      if (!data.success) {
        throw new Error('Address could not be saved')
      }

      const updatedAddresses = Array.isArray(data.addresses)
        ? data.addresses
        : []

      setAddresses(updatedAddresses)

      /*
       * Prefer the newly-created address.
       *
       * Backend normally returns the updated address array with
       * the newly-added address at the end.
       */
      const addedAddress =
        updatedAddresses[updatedAddresses.length - 1]

      if (addedAddress?._id) {
        setSelectedAddress(addedAddress._id)
      } else {
        /*
         * Fallback in case backend changes the ordering.
         */
        const matchingAddress = updatedAddresses.find(
          (address) =>
            address.fullName === payload.fullName &&
            address.phone === payload.phone &&
            address.addressLine === payload.addressLine &&
            address.city === payload.city &&
            address.state === payload.state &&
            address.postalCode === payload.postalCode,
        )

        if (matchingAddress?._id) {
          setSelectedAddress(matchingAddress._id)
        }
      }

      /*
       * Clear only the address-specific fields.
       * Keep name and phone for convenience.
       */
      setForm((previous) => ({
        ...previous,
        addressLine: '',
        city: '',
        state: '',
        postalCode: '',
        landmark: '',
      }))

      toastSuccess('Address saved successfully')
    } catch (err) {
      toastError(err, 'Could not save address')
    }
  }

  /*
   * Create order and handle Razorpay/COD.
   */
  const handleCreateOrder = async (
    method: 'razorpay' | 'cod',
  ) => {
    /*
     * COD uses the current form as a fallback.
     * For normal checkout we use the selected saved address.
     */
    const address =
      method === 'cod'
        ? selectedAddr ?? form
        : selectedAddr ?? form

    if (
      !address.fullName ||
      !address.phone ||
      !address.addressLine ||
      !address.city ||
      !address.state ||
      !address.postalCode
    ) {
      toastError(
        new Error('Please select or provide a complete delivery address'),
        'Address required',
      )
      setStep(0)
      return
    }

    setProcessing(true)

    try {
      const { data } = await orderApi.create({
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine: address.addressLine,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          landmark: address.landmark || undefined,
        },
        paymentMethod: method,
        couponCode: cart?.couponCode,
      })

      /*
       * Cash on Delivery
       */
      if (method === 'cod') {
        setPlacedOrder(data.order)
        return
      }

      /*
       * If backend doesn't return Razorpay information,
       * treat the created order as completed.
       */
      if (!data.razorpay) {
        setPlacedOrder(data.order)
        return
      }

      const { order } = data

      const loaded = await loadRazorpay()

      const paymentCallback = async (resp: {
        razorpay_payment_id: string
        razorpay_order_id: string
        razorpay_signature: string
      }) => {
        setProcessing(true)

        try {
          await orderApi.verifyPayment({
            orderId: order._id,
            razorpayOrderId: resp.razorpay_order_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpaySignature: resp.razorpay_signature,
          })

          setPlacedOrder(order)
        } catch (err) {
          toastError(err, 'Payment verification failed')
          setProcessing(false)
        }
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: 'FreshMart',
        description: `Order ${order.orderNumber}`,
        order_id: data.razorpay.orderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        handler: paymentCallback,
        modal: {
          ondismiss: () => setProcessing(false),
        },
      }

      if (loaded) {
        setProcessing(false)

        const opened = openRazorpay(options)

        if (!opened) {
          mockPay(options)
        }
      } else if (
        isMockSignature('mock_signature_for_test_mode')
      ) {
        /*
         * Development mode without Razorpay script.
         */
        mockPay(options)
      }
    } catch (err) {
      toastError(err, 'Could not place order')
      setProcessing(false)
    }
  }

  /*
   * Empty cart protection.
   */
  if (!cart || !cart.items?.length) {
    return (
      <div className="container-fm flex min-h-[70vh] items-center justify-center pt-24 pb-16">
        <div className="card w-full max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-white">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Add some fresh products before proceeding to checkout.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate('/shop')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fm pt-24 pb-16">
      <h1 className="section-title">Checkout</h1>

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => (
          <li
            key={s}
            className="flex flex-1 items-center gap-2"
          >
            <button
              onClick={() => {
                if (i < step) {
                  setStep(i as Step)
                }
              }}
              className="flex items-center gap-2.5"
              disabled={i > step}
            >
              <motion.span
                animate={{
                  scale: step === i ? 1.1 : 1,
                  backgroundColor:
                    i <= step
                      ? 'rgba(0,212,106,1)'
                      : 'rgba(255,255,255,0.08)',
                }}
                className={classNames(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors',
                  i <= step
                    ? 'text-leaf-950'
                    : 'text-gray-400',
                )}
              >
                {i < step ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.span>
                ) : (
                  i + 1
                )}
              </motion.span>

              <span
                className={classNames(
                  'hidden text-sm font-medium sm:block',
                  i <= step
                    ? 'text-white'
                    : 'text-gray-500',
                )}
              >
                {s}
              </span>
            </button>

            {i < steps.length - 1 && (
              <div
                className={classNames(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  i < step
                    ? 'bg-leaf-500'
                    : 'bg-white/10',
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          <AnimatePresence mode="wait">
            {/* ADDRESS */}
            {step === 0 && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <MapPin className="h-4 w-4 text-leaf-500" />
                  Delivery Address
                </div>

                {addresses.length === 0 ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
                    No saved addresses. Please add one below or from your account.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <button
                        key={address._id}
                        type="button"
                        onClick={() =>
                          setSelectedAddress(address._id)
                        }
                        className={classNames(
                          'rounded-xl border p-4 text-left transition-all',
                          selectedAddress === address._id
                            ? 'border-leaf-500/60 bg-leaf-500/10'
                            : 'border-white/10 hover:border-white/25',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">
                            {address.fullName}
                          </p>

                          {address.isDefault && (
                            <span className="text-[10px] font-semibold text-leaf-500">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-gray-400">
                          {address.addressLine}
                        </p>

                        <p className="text-xs text-gray-400">
                          {address.city}, {address.state}{' '}
                          {address.postalCode}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {address.phone}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                <details
                  open={addresses.length === 0}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-leaf-100">
                    + Add new address
                  </summary>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Full Name"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          fullName: e.target.value,
                        })
                      }
                    />

                    <Input
                      label="Phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value,
                        })
                      }
                    />

                    <div className="sm:col-span-2">
                      <Textarea
                        label="Address"
                        value={form.addressLine}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            addressLine: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Input
                      label="City"
                      value={form.city}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          city: e.target.value,
                        })
                      }
                    />

                    <Input
                      label="State"
                      value={form.state}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          state: e.target.value,
                        })
                      }
                    />

                    <Input
                      label="Postal Code"
                      value={form.postalCode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          postalCode: e.target.value,
                        })
                      }
                    />

                    <Input
                      label="Landmark (optional)"
                      value={form.landmark}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          landmark: e.target.value,
                        })
                      }
                    />

                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveAddress}
                        disabled={
                          !form.fullName.trim() ||
                          !form.phone.trim() ||
                          !form.addressLine.trim() ||
                          !form.city.trim() ||
                          !form.state.trim() ||
                          !form.postalCode.trim()
                        }
                      >
                        Save Address
                      </Button>
                    </div>
                  </div>
                </details>

                <Button
                  type="button"
                  onClick={() => {
                    if (!canProceed) {
                      toastError(
                        new Error(
                          'Please select or save a delivery address first',
                        ),
                        'Address required',
                      )
                      return
                    }

                    setStep(1)
                  }}
                  disabled={!canProceed}
                  className="mt-4"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* DELIVERY */}
            {step === 1 && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Truck className="h-4 w-4 text-leaf-500" />
                  Delivery Options
                </div>

                <div className="rounded-xl border border-leaf-500/30 bg-leaf-500/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        Express Delivery
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Estimated arrival:{' '}
                        <span className="font-semibold text-leaf-100">
                          30 minutes
                        </span>
                      </p>
                    </div>

                    <span className="rounded-lg bg-leaf-500/15 px-3 py-1 text-sm font-bold text-leaf-100">
                      {deliveryFee === 0
                        ? 'FREE'
                        : formatINR(deliveryFee)}
                    </span>
                  </div>

                  {deliveryFee > 0 && (
                    <p className="mt-3 text-xs text-amber-300">
                      Add{' '}
                      {formatINR(Math.max(0, 499 - subtotal))}{' '}
                      more for free delivery!
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(0)}
                    variant="ghost"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* PAYMENT */}
            {step === 2 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CreditCard className="h-4 w-4 text-leaf-500" />
                  Payment Method
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod('razorpay')
                    }
                    className={classNames(
                      'rounded-xl border p-5 text-left transition-all',
                      paymentMethod === 'razorpay'
                        ? 'border-leaf-500/60 bg-leaf-500/10'
                        : 'border-white/10 hover:border-white/25',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="h-6 w-6 text-leaf-500" />

                      <span
                        className={classNames(
                          'h-4 w-4 rounded-full border-2',
                          paymentMethod === 'razorpay'
                            ? 'border-leaf-500 bg-leaf-500'
                            : 'border-gray-600',
                        )}
                      />
                    </div>

                    <p className="mt-3 font-semibold text-white">
                      Card / UPI / NetBanking
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Secure payment via Razorpay
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={classNames(
                      'rounded-xl border p-5 text-left transition-all',
                      paymentMethod === 'cod'
                        ? 'border-leaf-500/60 bg-leaf-500/10'
                        : 'border-white/10 hover:border-white/25',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Banknote className="h-6 w-6 text-leaf-500" />

                      <span
                        className={classNames(
                          'h-4 w-4 rounded-full border-2',
                          paymentMethod === 'cod'
                            ? 'border-leaf-500 bg-leaf-500'
                            : 'border-gray-600',
                        )}
                      />
                    </div>

                    <p className="mt-3 font-semibold text-white">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Pay when your order arrives
                    </p>
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-3 text-xs text-blue-200">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Payments are verified securely on our servers.
                  Your card details never touch us.
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="ghost"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      handleCreateOrder(paymentMethod)
                    }
                    loading={processing}
                    className="flex-1"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {paymentMethod === 'razorpay'
                          ? 'Processing payment...'
                          : 'Placing order...'}
                      </>
                    ) : (
                      <>
                        Pay {formatINR(grandTotal)}
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ORDER SUMMARY */}
        <div className="card h-fit p-5">
          <h2 className="font-display text-lg font-bold text-white">
            Order Summary
          </h2>

          {cart.items.map((item) => {
            const image =
              item.imageSnapshot ||
              item.product?.images?.[0] ||
              '/images/products/placeholder.jpg'

            return (
              <div
                key={item._id}
                className="mt-4 flex items-center gap-3"
              >
                <img
                  src={image}
                  alt={item.nameSnapshot || 'Product'}
                  className="h-12 w-12 rounded-lg object-cover"
                  onError={(event) => {
                    const target = event.currentTarget

                    if (
                      target.src.includes(
                        '/images/products/placeholder.jpg',
                      )
                    ) {
                      return
                    }

                    target.src =
                      '/images/products/placeholder.jpg'
                  }}
                />

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-white">
                    {item.nameSnapshot ||
                      item.product?.name ||
                      'Product'}
                  </p>

                  <p className="text-[11px] text-gray-500">
                    × {item.quantity}
                  </p>
                </div>

                <span className="text-xs font-semibold text-gray-200">
                  {formatINR(
                    item.priceSnapshot * item.quantity,
                  )}
                </span>
              </div>
            )
          })}

          <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>

            {summary &&
              summary.discountFromMrp > 0 && (
                <div className="flex justify-between text-leaf-500">
                  <span>MRP savings</span>
                  <span>
                    − {formatINR(summary.discountFromMrp)}
                  </span>
                </div>
              )}

            <div className="flex justify-between text-gray-400">
              <span>Tax</span>
              <span>{formatINR(tax)}</span>
            </div>

            <div className="flex justify-between text-gray-400">
              <span>Delivery</span>

              <span
                className={
                  deliveryFee === 0
                    ? 'font-semibold text-leaf-500'
                    : ''
                }
              >
                {deliveryFee === 0
                  ? 'FREE'
                  : formatINR(deliveryFee)}
              </span>
            </div>

            <div className="flex justify-between border-t border-white/10 pt-3 text-base font-extrabold text-white">
              <span>Total</span>

              <motion.span
                key={grandTotal}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {formatINR(grandTotal)}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}