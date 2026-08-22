import { useCallback } from 'react'
import { useCartStore } from '@/store/cartStore'

let cartTarget: HTMLElement | null = null

export function setCartTarget(el: HTMLElement | null): void {
  cartTarget = el
}

export function triggerCartPulse(): void {
  const el = cartTarget
  if (!el) return
  el.dispatchEvent(new CustomEvent('fm-cart-pulse'))
}

export function flyToCart(product: { images?: string[]; name: string }): void {
  const target = cartTarget
  if (!target) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  const img = product.images?.[0]
  const startX = window.innerWidth * 0.5
  const startY = window.innerHeight * 0.6
  const rect = target.getBoundingClientRect()
  const endX = rect.left + rect.width / 2
  const endY = rect.top + rect.height / 2

  const flyer = document.createElement('img')
  flyer.src = img || ''
  flyer.alt = product.name
  flyer.style.cssText = `
    position: fixed; left:0; top:0; width:56px; height:56px; object-fit:cover;
    border-radius:14px; z-index:9999; pointer-events:none; will-change:transform;
    box-shadow:0 8px 30px rgba(0,212,106,.35); border:2px solid rgba(0,212,106,.5);
  `
  document.body.appendChild(flyer)

  const dx = endX - startX
  const dy = endY - startY
  const duration = 650

  const start = performance.now()
  function step(now: number) {
    const t = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    const x = startX + dx * eased
    const y = startY + dy * eased
    const scale = 1 - 0.6 * eased
    flyer.style.transform = `translate(${x - 28}px, ${y - 28}px) scale(${scale}) rotate(${eased * 45}deg)`
    if (t < 1) {
      requestAnimationFrame(step)
    } else {
      flyer.remove()
    }
  }
  requestAnimationFrame(step)
}

export function useCartPulse(): {
  setTarget: (el: HTMLElement | null) => void
  trigger: () => void
} {
  const setTarget = useCallback((el: HTMLElement | null) => setCartTarget(el), [])
  const trigger = useCallback(() => triggerCartPulse(), [])
  void useCartStore
  return { setTarget, trigger }
}