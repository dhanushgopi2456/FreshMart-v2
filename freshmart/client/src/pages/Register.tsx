import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, Check } from 'lucide-react'
import { AuthShell } from '@/components/AuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { toastSuccess } from '@/store/toastStore'
import { getErrorMessage } from '@/services/api'

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Uppercase')
  .regex(/[a-z]/, 'Lowercase')
  .regex(/[0-9]/, 'Number')
  .regex(/[^A-Za-z0-9]/, 'Special character')

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Enter a valid phone number'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function Register() {
  const { register: registerUser, user } = useAuthStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const [pw, setPw] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (user) navigate(user.role === 'ADMIN' ? '/admin' : '/')
  }, [user, navigate])

  useEffect(() => {
    const sub = watch((v) => setPw(v.password ?? ''))
    return () => sub.unsubscribe()
  }, [watch])

  const redirect = params.get('redirect') ?? '/'

  const rules = useMemo(
    () => [
      { label: '8+ characters', ok: pw.length >= 8 },
      { label: 'Uppercase', ok: /[A-Z]/.test(pw) },
      { label: 'Lowercase', ok: /[a-z]/.test(pw) },
      { label: 'Number', ok: /[0-9]/.test(pw) },
      { label: 'Special character', ok: /[^A-Za-z0-9]/.test(pw) },
    ],
    [pw],
  )

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await registerUser(data)
      toastSuccess('Account created', `Welcome to FreshMart, ${data.name.split(' ')[0]}!`)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Join FreshMart and get fresh groceries in 30 minutes">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          id="name"
          label="Full Name"
          placeholder="Dhanush Gopi"
          autoComplete="name"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
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
        <Input
          id="phone"
          label="Phone"
          type="tel"
          placeholder="9876543210"
          autoComplete="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div>
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {rules.map((r) => (
              <motion.div
                key={r.label}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                  r.ok ? 'text-leaf-500' : 'text-gray-500'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${
                    r.ok ? 'border-leaf-500 bg-leaf-500/20' : 'border-gray-600'
                  }`}
                >
                  {r.ok ? <Check className="h-2.5 w-2.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />}
                </span>
                {r.label}
              </motion.div>
            ))}
          </div>
        </div>
        <Input
          id="confirm"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>

        <p className="pt-1 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-leaf-500 hover:text-leaf-400">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}