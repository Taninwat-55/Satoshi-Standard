import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, children }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children }) {
  return (
    <thead className={cn('[&_tr]:border-b [&_tr]:border-white/5', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children }) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children }) {
  return (
    <tr className={cn(
      'border-b border-white/5 transition-colors hover:bg-white/[0.02]',
      className
    )}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children }) {
  return (
    <th className={cn(
      'h-10 px-3 text-left align-middle text-[10px] font-medium text-neutral-500 uppercase tracking-wider',
      className
    )}>
      {children}
    </th>
  );
}

export function TableCell({ className, children }) {
  return (
    <td className={cn(
      'px-3 py-3 align-middle text-sm text-neutral-300',
      className
    )}>
      {children}
    </td>
  );
}
