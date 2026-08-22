import { describe, it, expect, vi } from 'vitest'

vi.mock('../config/env.js', () => ({
  env: {
    razorpayKeyId: '',
    razorpayKeySecret: '',
    openrouterApiKey: '',
  },
}))

import payment from './payment.service.js'

describe('payment.service', () => {
  it('reports not configured without keys', () => {
    expect(payment.isConfigured()).toBe(false)
  })

  it('creates a mock order id in dev mode', async () => {
    const order = await payment.createOrder('FM-TEST-1', 12345)
    expect(order.id).toBe('mock_FM-TEST-1')
    expect(order.amount).toBe(12345)
    expect(order.currency).toBe('INR')
  })

  it('accepts the mock signature only when not configured', () => {
    expect(payment.verifySignature('r1', 'p1', 'mock_signature_for_test_mode')).toBe(true)
  })

  it('rejects an arbitrary signature when not configured', () => {
    expect(payment.verifySignature('r1', 'p1', 'garbage')).toBe(false)
  })

  it('rejects a mock signature when configured with real keys', async () => {
    vi.resetModules()
    vi.doMock('../config/env.js', () => ({
      env: { razorpayKeyId: 'rzp_test', razorpayKeySecret: 'secret' },
    }))
    const configured = (await import('./payment.service.js')).default
    expect(configured.isConfigured()).toBe(true)
    expect(configured.verifySignature('r1', 'p1', 'mock_signature_for_test_mode')).toBe(false)
  })
})