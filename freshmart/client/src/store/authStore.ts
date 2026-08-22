import { create } from 'zustand'
import type { User } from '@/types'
import { authApi } from '@/services'

interface AuthState {
  user: User | null
  status: 'idle' | 'loading' | 'authenticated' | 'guest'
  hydrate: () => Promise<void>
  setUser: (user: User | null) => void
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>
  register: (data: {
    name: string
    email: string
    phone?: string
    password: string
    confirmPassword: string
  }) => Promise<User>
  logout: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  hydrate: async () => {
    try {
      const { data } = await authApi.me()
      set({ user: data.user, status: 'authenticated' })
    } catch {
      set({ user: null, status: 'guest' })
    }
  },

  setUser: (user) => set({ user, status: user ? 'authenticated' : 'guest' }),

  login: async (email, password, rememberMe) => {
    set({ status: 'loading' })
    const { data } = await authApi.login({ email, password, rememberMe })
    set({ user: data.user, status: 'authenticated' })
    return data.user
  },

  register: async (payload) => {
    set({ status: 'loading' })
    const { data } = await authApi.register(payload)
    set({ user: data.user, status: 'authenticated' })
    return data.user
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      /* ignore network errors on logout */
    }
    set({ user: null, status: 'guest' })
  },

  clearSession: () => set({ user: null, status: 'guest' }),
}))