import { forwardRef, useCallback, useState } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { classNames } from '@/utils/format'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onAnimationCancel' | 'onTransitionEnd'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  success?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-leaf-500 text-leaf-950 hover:bg-leaf-400 hover:shadow-glow',
  outline: 'border border-leaf-500/30 text-leaf-100 hover:border-leaf-500/70 hover:bg-leaf-500/10',
  ghost: 'text-gray-300 hover:bg-white/5 hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  success: 'bg-leaf-600 text-white hover:bg-leaf-500',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs rounded-lg',
  md: 'px-5 py-3 text-sm rounded-xl',
  lg: 'px-7 py-4 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, success, fullWidth, className, children, disabled, onClick, ...props },
  ref,
) {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return
      onClick?.(e)
      if (success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1200)
      }
    },
    [loading, disabled, onClick, success],
  )

  const icon = loading ? (
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
  ) : showSuccess ? (
    <motion.span
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      <Check className="h-4 w-4" aria-hidden />
    </motion.span>
  ) : null

  return (
    <motion.button
      ref={ref}
      whileTap={loading || disabled ? undefined : { scale: 0.96 }}
      onClick={handleClick}
      disabled={loading || disabled}
      aria-busy={loading}
      className={classNames(
        'btn inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf-500 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {icon}
      {children}
    </motion.button>
  )
})