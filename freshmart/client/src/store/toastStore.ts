import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...toast, id }] }))
    const duration = toast.duration ?? (toast.type === 'success' ? 3000 : 4000)
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function toastSuccess(title: string, description?: string, action?: Toast['action']): void {
  useToastStore.getState().show({ type: 'success', title, description, action })
}

export function toastInfo(title: string, description?: string): void {
  useToastStore.getState().show({ type: 'info', title, description })
}