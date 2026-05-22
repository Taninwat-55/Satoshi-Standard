import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children }) {
  return (
    <div className={cn(
      'bg-neutral-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl',
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('flex flex-col gap-1 p-6 pb-0', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('section-title', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }) {
  return (
    <p className={cn('text-xs text-neutral-500', className)}>
      {children}
    </p>
  );
}

export function CardContent({ className, children }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)}>
      {children}
    </div>
  );
}
