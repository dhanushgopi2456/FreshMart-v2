import { create } from 'zustand'
import type { User } from '@/types'
import { authApi } from '@/services'

interface AuthState {
  user: User | null
  status: 'idle' | 'loading' | 'authenticated' | 'guest'
  hydrate: () => Promise<void>
  setUser: (user: User | null) => void
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<User>
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

      set({
        user: data.user,
        status: 'authenticated',
      })
    } catch {
      set({
        user: null,
        status: 'guest',
      })
    }
  },

  setUser: (user) =>
    set({
      user,
      status: user ? 'authenticated' : 'guest',
    }),

  login: async (email, password, rememberMe) => {
    set({ status: 'loading' })

    try {
      const { data } = await authApi.login({
        email,
        password,
        rememberMe,
      })

      set({
        user: data.user,
        status: 'authenticated',
      })

      return data.user
    } catch (error) {
      set({
        user: null,
        status: 'guest',
      })

      throw error
    }
  },

  register: async (payload) => {
    set({ status: 'loading' })

    try {
      const { data } = await authApi.register(payload)

      set({
        user: data.user,
        status: 'authenticated',
      })

      return data.user
    } catch (error) {
      set({
        user: null,
        status: 'guest',
      })

      throw error
    }
  },

  logout: async () => {
    /*
     * Clear the frontend session FIRST.
     * This immediately changes the application to guest mode,
     * so the Home page can render without waiting for the API.
     */
    set({
      user: null,
      status: 'guest',
    })

    /*
     * Then tell the backend to invalidate the session/cookie.
     * A network failure should not prevent the user from seeing Home.
     */
    try {
      await authApi.logout()
    } catch {
      // Ignore logout network errors.
    }
  },

  clearSession: () =>
    set({
      user: null,
      status: 'guest',
    }),
}))