import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Page width and padding. Owned by the page rather than the locale layout, so a
 * page can place it per-section and let something (the homepage hero) run
 * full-bleed — see ADR-0013.
 */
export function PageContainer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 py-10 md:py-14', className)} {...props} />;
}
