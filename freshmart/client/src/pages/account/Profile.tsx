import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Save } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { accountApi } from '@/services'
import { getErrorMessage } from '@/services/api'
import { toastSuccess } from '@/store/toastStore'
import { initials } from '@/utils/format'

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Enter a valid phone number'),
})

type FormData = z.infer<typeof schema>

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const { data: res } = await accountApi.updateProfile(data)
      setUser(res.user)
      toastSuccess('Profile updated', 'Your details were saved.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl pt-24 pb-16">
      <h1 className="section-title">Profile</h1>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mt-8 p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-mint text-2xl font-extrabold text-leaf-950">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              initials(user.name)
            )}
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-white">{user.name}</p>
            <p className="text-sm text-gray-400">
              Member since{' '}
              {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
          )}
          <div>
            <Input
              id="name"
              label="Full Name"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <Input id="email" label="Email" type="email" value={user.email} disabled leftIcon={<Mail className="h-4 w-4" />} />
          <div>
            <Input
              id="phone"
              label="Phone"
              type="tel"
              leftIcon={<Phone className="h-4 w-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
          <Button type="submit" loading={isSubmitting}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </form>
      </motion.div>
    </div>
  )
}