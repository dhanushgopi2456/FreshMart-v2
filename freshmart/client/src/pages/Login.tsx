import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react'
import { AuthShell } from '@/components/AuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { toastSuccess } from '@/store/toastStore'
import { getErrorMessage } from '@/services/api'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { login, user } = useAuthStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const [shake, setShake] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/')
    }
  }, [user, navigate])

  const redirect = params.get('redirect') ?? (user?.role === 'ADMIN' ? '/admin' : '/')

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.email, data.password, data.rememberMe)
      toastSuccess('Welcome back', "You're successfully signed in.")
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setShake((s) => s + 1)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue shopping fresh">
      <motion.form
        key={shake}
        animate={shake > 0 ? { x: [0, -10, 10, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              role="alert"
            >
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <AlertCircle className="h-4 w-4 shrink-0" />
              </motion.span>
              <div>
                <p className="font-semibold">Unable to sign in</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-gray-400">
            <input type="checkbox" {...register('rememberMe')} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-leaf-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-leaf-500 hover:text-leaf-400">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
          <LogIn className="h-4 w-4" />
          {isSubmitting ? 'Signing you in...' : 'Login'}
        </Button>

        <p className="pt-2 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-semibold text-leaf-500 hover:text-leaf-400">
            Register
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  )
}