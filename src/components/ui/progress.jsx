import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Progress({ value = 0, className }) {
  return (
    <div className={cn('relative h-2 bg-neutral-800 rounded-full overflow-hidden', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className='absolute top-0 left-0 h-full bg-gradient-to-r from-brand-orange to-orange-400'
      />
    </div>
  );
}
