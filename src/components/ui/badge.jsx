import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-neutral-800 text-neutral-300 border-white/10',
  orange:  'bg-brand-orange/10 text-brand-orange border-brand-orange/30',
  green:   'bg-green-500/10 text-green-400 border-green-500/20',
  red:     'bg-red-500/10 text-red-400 border-red-500/20',
  amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function Badge({ variant = 'default', className, children }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
