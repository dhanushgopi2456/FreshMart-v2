import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, Check } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { accountApi } from '@/services'
import { getErrorMessage } from '@/services/api'
import { toastSuccess } from '@/store/toastStore'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function Security() {
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const pw = watch('newPassword') ?? ''
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
    setDone(false)
    try {
      await accountApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      reset()
      setDone(true)
      toastSuccess('Password changed', 'Use your new password next time you sign in.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-2xl pt-24 pb-16">
      <h1 className="section-title">Security</h1>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mt-8 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-500/10">
            <ShieldCheck className="h-5 w-5 text-leaf-500" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Change Password</h2>
            <p className="text-sm text-gray-400">Use a strong password you don't use elsewhere.</p>
          </div>
        </div>

        {done && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-leaf-500/30 bg-leaf-500/10 px-4 py-3 text-sm text-leaf-500">
            <Check className="h-4 w-4" /> Password updated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
          )}
          <div>
            <Input
              id="current"
              label="Current Password"
              type="password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
          </div>
          <div>
            <Input
              id="new"
              label="New Password"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {rules.map((r) => (
                <span key={r.label} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-leaf-500' : 'text-gray-500'}`}>
                  <Check className={`h-3 w-3 ${r.ok ? '' : 'opacity-30'}`} /> {r.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <Input
              id="confirm"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
          <Button type="submit" loading={isSubmitting}>
            Update Password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}