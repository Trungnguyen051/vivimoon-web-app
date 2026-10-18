import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { PageContainer } from './page-container';

/**
 * One band of the homepage: a full-bleed background with the page grid inside.
 * The design alternates plain and tinted bands down the page, and a band's
 * colour runs edge to edge, so the background has to sit outside the container
 * rather than on the content — the same reason the hero does (ADR-0013).
 */
export function HomeSection({
  tinted = false, className, children,
}: {
  tinted?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn(tinted && 'bg-muted', className)}>
      <PageContainer className="space-y-16 py-16 md:space-y-24 md:py-24">{children}</PageContainer>
    </section>
  );
}
