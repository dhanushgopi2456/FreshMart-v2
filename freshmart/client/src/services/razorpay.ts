import { getErrorMessage } from '@/services/api'

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayCtor {
  new (options: RazorpayOptions): {
    open: () => void
  }
}

declare global {
  interface Window {
    Razorpay?: RazorpayCtor
  }
}

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function openRazorpay(opts: RazorpayOptions): boolean {
  if (!window.Razorpay) return false
  try {
    const rzp = new window.Razorpay(opts)
    rzp.open()
    return true
  } catch {
    return false
  }
}

export function mockPay(options: RazorpayOptions): void {
  setTimeout(() => {
    options.handler({
      razorpay_payment_id: `mock_pay_${Date.now()}`,
      razorpay_order_id: options.order_id,
      razorpay_signature: 'mock_signature_for_test_mode',
    })
  }, 1600)
}

export function isMockSignature(signature: string): boolean {
  return signature === 'mock_signature_for_test_mode'
}

export { getErrorMessage }