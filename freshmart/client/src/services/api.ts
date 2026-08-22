import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

// Helper to ensure baseURL safely ends with '/api' without double slashes
const getApiBaseUrl = (): string => {
  const rawUrl = (import.meta.env.VITE_API_URL as string | undefined) || ''
  if (!rawUrl || rawUrl.trim() === '') {
    return '/api'
  }
  const cleanUrl = rawUrl.trim().replace(/\/+$/, '')
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`
}

const apiBaseUrl = getApiBaseUrl()

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 20000,
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const original = error.config as { _retry?: boolean } & typeof error.config
    const status = error.response?.status
    const url = error.config?.url ?? ''

    // Authentication endpoints should never trigger
    // the automatic token-refresh flow.
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/me') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')

    // For normal protected API requests, try refreshing
    // the access token once when a 401 is received.
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      original._retry = true

      try {
        await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        return api(original)
      } catch {
        useAuthStore.getState().clearSession()
      }
    }

    // If authentication itself fails, simply clear the session.
    // Do not attempt another refresh.
    if (status === 401) {
      useAuthStore.getState().clearSession()
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.message || err.message || 'Something went wrong'
  }

  return err instanceof Error ? err.message : 'Something went wrong'
}

export function getErrorCode(err: unknown): string | undefined {
  if (err instanceof AxiosError) {
    return err.response?.data?.code
  }

  return undefined
}

export function toastError(
  err: unknown,
  fallback = 'Something went wrong',
): void {
  const message = getErrorMessage(err)
  const code = getErrorCode(err)

  if (
    code === 'OUT_OF_STOCK' ||
    message.toLowerCase().includes('stock')
  ) {
    useToastStore.getState().show({
      type: 'warning',
      title: 'Low stock',
      description: message,
    })
  } else {
    useToastStore.getState().show({
      type: 'error',
      title: fallback,
      description: message,
    })
  }
}

export default api