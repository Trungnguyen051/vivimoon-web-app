import type { AnalyticsEvent } from './events';

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void;

export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', event.name, event.params);
}
