import { motion } from 'framer-motion'
import { Leaf, Truck, Sparkles, ShieldCheck, HeartHandshake, Users } from 'lucide-react'
import { Logo } from '@/components/Logo'

const VALUES = [
  {
    icon: Leaf,
    title: 'Farm-fresh always',
    text: 'We source produce daily from local farms and trusted vendors, so what reaches your doorstep is the freshest it can be.',
  },
  {
    icon: Truck,
    title: '30-minute delivery',
    text: 'Our dark stores are placed near you. Order and we deliver lightning fast — often before your coffee goes cold.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered shopping',
    text: 'FreshAI plans meals, builds lists, and finds deals based on how you actually shop. Groceries that feel effortless.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & safe',
    text: 'Contactless delivery, tamper-proof packaging, and a 30-minute replacement guarantee on any damaged item.',
  },
]

const STATS = [
  { value: '50k+', label: 'Happy families' },
  { value: '2,500+', label: 'Products' },
  { value: '120+', label: 'Partner farms' },
  { value: '30 min', label: 'Avg. delivery' },
]

export default function About() {
  return (
    <div className="container-fm pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-leaf-500">Our Story</p>
        <h1 className="section-title mt-3">Freshness, delivered with love</h1>
        <p className="mt-4 text-gray-400">
          FreshMart began with a simple frustration: why does ordering groceries online feel harder than going to the store?
          We set out to build the grocery experience we always wanted — fresh produce, honest prices, instant delivery,
          and a shopping experience that feels human.
        </p>
      </motion.div>

      <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card text-center"
          >
            <p className="font-display text-3xl font-extrabold text-leaf-500">{s.value}</p>
            <p className="mt-1 text-xs text-gray-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {VALUES.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-500/10">
              <v.icon className="h-6 w-6 text-leaf-500" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-white">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{v.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card mx-auto mt-14 flex max-w-3xl flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-mint">
          <HeartHandshake className="h-8 w-8 text-leaf-950" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-extrabold text-white">A family of farmers, drivers & food lovers</h3>
          <p className="mt-2 text-sm text-gray-400">
            Every delivery connects you to a network of local growers and gig drivers who earn fairly.
            We're proudly small — and growing — with <span className="font-semibold text-leaf-500">150+ teammates</span> across 4 cities.
          </p>
        </div>
        <Users className="h-10 w-10 text-gray-700" />
      </motion.div>

      <div className="mt-14 flex flex-col items-center gap-4">
        <Logo />
        <p className="text-sm text-gray-500">Fresh from farm to you — always.</p>
      </div>
    </div>
  )
}