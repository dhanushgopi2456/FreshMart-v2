export const queryClient = undefined

export function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768 || navigator.maxTouchPoints > 0
}

export function isBrowserTabVisible(): boolean {
  return typeof document === 'undefined' || document.visibilityState === 'visible'
}