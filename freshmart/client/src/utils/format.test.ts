import { describe, it, expect } from 'vitest'
import { formatINR, discountPercent, estimatedDeliveryText, truncate, slugify, initials } from './format'

describe('format utils', () => {
  it('formats INR with grouping', () => {
    expect(formatINR(1573)).toBe('₹1,573')
    expect(formatINR(100000)).toBe('₹1,00,000')
  })

  it('computes discount percentage', () => {
    expect(discountPercent(100, 80)).toBe(20)
    expect(discountPercent(100, 100)).toBe(0)
    expect(discountPercent(100, null)).toBe(0)
    expect(discountPercent(100, 120)).toBe(0)
  })

  it('estimates delivery text', () => {
    const soon = new Date(Date.now() + 30 * 60000).toISOString()
    expect(estimatedDeliveryText(soon)).toBe('30 minutes')
    const later = new Date(Date.now() + 2 * 3600000 + 5 * 60000).toISOString()
    expect(estimatedDeliveryText(later)).toBe('2h 5m')
  })

  it('truncates long text', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
    expect(truncate('short', 20)).toBe('short')
  })

  it('slugifies strings', () => {
    expect(slugify('Fresh Mart!  -  Milk')).toBe('fresh-mart-milk')
  })

  it('builds initials', () => {
    expect(initials('Dhanush Gopi')).toBe('DG')
    expect(initials('ada lovelace')).toBe('AL')
  })
})