'use client';
import { createContext, useContext } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export type BoundaryStrings = {
  locale: Locale;
  notFound: Dictionary['notFound'];
  errorPage: Dictionary['errorPage'];
};

const BoundaryStringsContext = createContext<BoundaryStrings | null>(null);

/**
 * `[locale]/not-found` and `[locale]/error` have to be client components, and a client
 * component that imports the dictionaries module ships every locale to the browser. The
 * locale layout already holds the right dictionary, so it hands down just the few strings
 * those two pages print, and they read them here instead.
 */
export function BoundaryStringsProvider({
  value,
  children,
}: {
  value: BoundaryStrings;
  children: React.ReactNode;
}) {
  return <BoundaryStringsContext.Provider value={value}>{children}</BoundaryStringsContext.Provider>;
}

export function useBoundaryStrings(): BoundaryStrings {
  const value = useContext(BoundaryStringsContext);
  if (!value) throw new Error('useBoundaryStrings must be used inside the locale layout');
  return value;
}
