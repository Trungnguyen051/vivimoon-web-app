import { useId, useState } from 'react';
import { Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import type { Currency } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { shippingMethodName } from '@/lib/orders/shipping-method-name';
import { StepHeading } from './step-heading';

// Arrival is the shop's calendar (Vietnam), written dd/mm in both locales as on the wireframe.
export const ARRIVAL_FORMAT = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
const DAY_MS = 24 * 60 * 60 * 1000;

export type ShippingQuote = { method: string; etaDays: number; fee: number };

/**
 * Checkout's "Vận chuyển" block: the option pricing will charge, shown, never
 * chosen — shipping auto-selects the cheapest quote (#21). `quote` is null
 * until the address can be quoted, and while a re-quote is in flight or failed,
 * so an old option is never presented as the current one.
 */
export function ShippingBlock({ quote, failed, currency, locale, dict, step, className }: {
  quote: ShippingQuote | null; failed: boolean; currency: Currency; locale: Locale; dict: Dictionary;
  /** Checkout's block number, drawn before the title. */
  step?: number;
  className?: string;
}) {
  const t = dict.checkout.shipping;
  const headingId = useId();
  // Read once per mount: render must stay pure, and checkout is a short visit.
  const [now] = useState(() => Date.now());

  return (
    <section aria-labelledby={headingId} className={className ?? 'flex flex-col gap-4'}>
      <StepHeading id={headingId} step={step}>{t.title}</StepHeading>
      {quote ? (
        <div className="flex items-center gap-3 border border-foreground p-4 md:gap-4 md:p-5">
          <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground">
            <span className="size-2.5 rounded-full bg-foreground" />
          </span>
          <Truck aria-hidden className="size-6 shrink-0" strokeWidth={1.5} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="font-medium">
              {shippingMethodName(quote.method, dict)} · {(quote.etaDays === 1 ? t.day : t.days).replace('{n}', String(quote.etaDays))}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.arrivesBy.replace('{date}', ARRIVAL_FORMAT.format(new Date(now + quote.etaDays * DAY_MS)))}
            </p>
          </div>
          <p className="font-semibold">{quote.fee === 0 ? t.free : formatPrice(quote.fee, currency, locale)}</p>
        </div>
      ) : (
        <p className="border border-dashed p-5 text-sm text-muted-foreground">{failed ? t.failed : t.pending}</p>
      )}
    </section>
  );
}
