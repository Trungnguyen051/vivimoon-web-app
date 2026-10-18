import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/** The rounded marketing CTA used across the homepage (hero, category headers, promo bands) — distinct from the app-chrome `Button`. */
export function PillLink({
  variant = 'dark', className, ...props
}: ComponentProps<typeof Link> & { variant?: 'dark' | 'light' }) {
  return (
    <Link
      className={cn(
        'inline-flex h-11 w-fit items-center rounded-full px-6 text-sm font-medium transition-transform hover:-translate-y-px',
        variant === 'dark' ? 'bg-black text-white' : 'bg-white text-black',
        className,
      )}
      {...props}
    />
  );
}
