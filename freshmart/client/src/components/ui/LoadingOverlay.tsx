'use client';

import { useLoadingStore } from '@/store/loadingStore';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export function LoadingOverlay() {
  const { isLoading, message } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-freshmart-bg/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading'}
    >
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-freshmart-primary to-freshmart-secondary flex items-center justify-center"
        >
          <ShoppingBag className="w-8 h-8 text-freshmart-bg" aria-hidden="true" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-body text-freshmart-textSecondary"
        >
          {message || 'Loading...'}
        </motion.p>
      </div>
    </motion.div>
  );
}