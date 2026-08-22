import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(0,212,106,0.08),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="relative">
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-leaf-500/30 via-transparent to-mint/20" />
          <div className="relative rounded-3xl border border-white/10 bg-midnight-100/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 flex flex-col items-center text-center">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <Logo link={false} />
              </motion.div>
              <h1 className="mt-5 font-display text-2xl font-extrabold text-white">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm text-gray-400">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )
}