import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-leaf-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
  info: <Info className="h-5 w-5 text-blue-400" />,
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto relative overflow-hidden rounded-xl border border-white/10 bg-midnight-100/95 p-4 shadow-card backdrop-blur"
            role="status"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-gray-400">{t.description}</p>}
                {t.action && (
                  <button
                    onClick={() => {
                      t.action?.onClick()
                      dismiss(t.id)
                    }}
                    className="mt-2 text-xs font-semibold text-leaf-500 hover:text-leaf-400"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded p-0.5 text-gray-500 hover:text-gray-300 focus:outline-none"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-leaf-500/60"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: (t.duration ?? 3500) / 1000, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}