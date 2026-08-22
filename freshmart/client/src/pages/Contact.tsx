import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

const CHANNELS = [
  { icon: Phone, label: 'Call us', value: '+91 98765 43210', note: 'Mon–Sat, 8am–10pm' },
  { icon: Mail, label: 'Email', value: 'hello@freshmart.shop', note: 'Replies within 24h' },
  { icon: MapPin, label: 'Head Office', value: 'MG Road, Bengaluru 560001', note: 'Drop by for a coffee' },
  { icon: Clock, label: 'Support Hours', value: '8:00 AM – 10:00 PM', note: 'All days' },
]

export default function Contact() {
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    try {
      await new Promise((r) => setTimeout(r, 700))
      toastSuccess('Message sent', 'Our team will get back to you within 24 hours.')
      ;(e.target as HTMLFormElement).reset()
    } catch {
      toastError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-fm pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf-500">Get in touch</p>
        <h1 className="section-title mt-3">We'd love to hear from you</h1>
        <p className="mt-4 text-gray-400">Questions about an order, feedback on a product, or a partnership idea — we're listening.</p>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CHANNELS.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-500/10">
              <c.icon className="h-5 w-5 text-leaf-500" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">{c.label}</p>
            <p className="mt-1 text-sm font-semibold text-white">{c.value}</p>
            <p className="mt-1 text-xs text-gray-500">{c.note}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card mx-auto mt-12 max-w-2xl p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-500/10">
            <MessageSquare className="h-5 w-5 text-leaf-500" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Send a message</h2>
            <p className="text-sm text-gray-400">We read every single one.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="name" label="Your Name" placeholder="Dhanush Gopi" required />
            <Input name="email" label="Email" type="email" placeholder="you@example.com" required />
          </div>
          <Input name="subject" label="Subject" placeholder="What's this about?" />
          <Textarea name="message" label="Message" rows={5} placeholder="Tell us everything..." required />
          <Button type="submit" loading={busy}>
            <Send className="h-4 w-4" /> Send Message
          </Button>
        </form>
      </motion.div>
    </div>
  )
}