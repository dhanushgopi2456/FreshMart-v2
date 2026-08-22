import crypto from 'node:crypto'
import { env } from '../config/env.js'

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
}

export interface PaymentService {
  isConfigured(): boolean
  createOrder(orderId: string, amountInPaise: number): Promise<RazorpayOrder>
  verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean
}

const service: PaymentService = {
  isConfigured() {
    return Boolean(env.razorpayKeyId && env.razorpayKeySecret)
  },

  async createOrder(orderId: string, amountInPaise: number) {
    if (!this.isConfigured()) {
      return {
        id: `mock_${orderId}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderId,
      }
    }

    const { default: Razorpay } = await import('razorpay')
    const rzp = new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret })
    const order = (await rzp.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1,
    } as unknown as Parameters<typeof rzp.orders.create>[0])) as unknown as {
      id: string
      amount: number
      currency: string
      receipt: string
    }
    return { id: order.id, amount: Number(order.amount), currency: order.currency, receipt: order.receipt }
  },

  verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    if (!this.isConfigured() && signature === 'mock_signature_for_test_mode') {
      return true
    }
    const body = `${razorpayOrderId}|${razorpayPaymentId}`
    const expected = crypto
      .createHmac('sha256', env.razorpayKeySecret || 'dev-secret')
      .update(body)
      .digest('hex')
    return expected === signature
  },
}

export default service