'use client';
import { usePathname } from 'next/navigation';

/** Checkout routes, except the success page, which keeps the site layout (spec "Pages and layout"). */
export function isCheckoutFlow(pathname: string): boolean {
  return /^\/[^/]+\/checkout(\/(?!success(\/|$)).*)?$/.test(pathname);
}

/**
 * The site header, footer and trays, left out on checkout routes: those draw
 * the slim checkout header instead (`app/[locale]/checkout/(flow)/layout.tsx`).
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return isCheckoutFlow(usePathname() ?? '') ? null : children;
}
