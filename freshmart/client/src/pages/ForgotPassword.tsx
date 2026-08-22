import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthShell } from '@/components/AuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/services'
import { getErrorMessage } from '@/services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await authApi.forgotPassword(email)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure reset link">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-leaf-500/15"
            >
              <CheckCircle2 className="h-8 w-8 text-leaf-500" />
            </motion.div>
            <h2 className="font-display text-lg font-bold text-white">Check your inbox</h2>
            <p className="mt-2 text-sm text-gray-400">
              If an account exists for <span className="font-semibold text-gray-200">{email}</span>, a reset link is on its way.
            </p>
            <Link to="/login" className="btn-outline mt-6">
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            className="space-y-4"
          >
            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
            )}
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" fullWidth size="lg" loading={busy}>
              <Send className="h-4 w-4" />
              Send Reset Link
            </Button>
            <p className="text-center text-sm text-gray-400">
              Remembered it?{' '}
              <Link to="/login" className="font-semibold text-leaf-500 hover:text-leaf-400">
                Login
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}