import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, KeyRound, Check } from 'lucide-react'
import { AuthShell } from '@/components/AuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/services'
import { getErrorMessage } from '@/services/api'
import { toastSuccess } from '@/store/toastStore'

const schema = z
  .object({
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const token = params.get('token') ?? ''

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const pw = watch('password') ?? ''
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

  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true })
  }, [token, navigate])

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await authApi.resetPassword(token, data.password, data.confirmPassword)
      toastSuccess('Password updated', 'Please sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you'll remember">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
        )}
        <Input
          id="password"
          label="New Password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="grid grid-cols-2 gap-2">
          {rules.map((r) => (
            <span key={r.label} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-leaf-500' : 'text-gray-500'}`}>
              <Check className={`h-3 w-3 ${r.ok ? '' : 'opacity-30'}`} /> {r.label}
            </span>
          ))}
        </div>
        <Input
          id="confirm"
          label="Confirm Password"
          type="password"
          leftIcon={<KeyRound className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Update Password
        </Button>
      </form>
    </AuthShell>
  )
}