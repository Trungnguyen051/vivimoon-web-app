import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Page width and padding. Owned by the page rather than the locale layout, so a
 * page can place it per-section and let something (the homepage hero) run
 * full-bleed — see ADR-0013.
 *
 * It no longer caps: the design runs every band edge to edge with a 40px gutter,
 * and a capped body under a full-bleed header is a visible seam at any viewport
 * past the old 1280px — see ADR-0015, which also records what that costs on a
 * wide monitor. The gutter stays 16px on phones, where 40px would spend a fifth
 * of a 390px screen on margin and the design has nothing to say.
 */
export function PageContainer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('w-full px-4 py-10 md:px-10 md:py-14', className)} {...props} />;
}
