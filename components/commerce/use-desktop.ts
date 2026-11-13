'use client';
import { useSyncExternalStore } from 'react';

const DESKTOP = '(min-width: 768px)';
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

/**
 * md and up, where a picker opens as a Dialog rather than a bottom Sheet. The server can't know the
 * width, so it renders as desktop; while closed, the Dialog and the Sheet render the same.
 */
export function useDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);
}
