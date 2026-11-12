import { Truck } from 'lucide-react';
import { formatPrice, toIntlLocale } from '@/lib/utils/format';
import type { Currency } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * Checkout's "Vận chuyển" block: the option pricing will charge, shown, never
 * chosen — shipping auto-selects the cheapest quote (#21). `method` is absent
 * until the address can be quoted.
 */
export function ShippingBlock({ method, etaDays, fee, currency, locale, dict }: {
  method: string | undefined; etaDays: number | undefined; fee: number | null;
  currency: Currency; locale: Locale; dict: Dictionary;
}) {
  const t = dict.checkout.shipping;
  const names: Record<string, string> = dict.orderDetail.shippingMethods;
  const quoted = method !== undefined && etaDays !== undefined && fee !== null;

  return (
    <section aria-labelledby="checkout-shipping" className="flex flex-col gap-4">
      <h2 id="checkout-shipping" className="font-heading text-2xl">{t.title}</h2>
      {quoted ? (
        <div className="flex items-center gap-4 border border-foreground p-5">
          <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground">
            <span className="size-2.5 rounded-full bg-foreground" />
          </span>
          <Truck aria-hidden className="size-6 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="font-medium">{names[method] ?? method} · {t.days.replace('{n}', String(etaDays))}</p>
            <p className="text-sm text-muted-foreground">{t.arrivesBy.replace('{date}', arrival(etaDays, locale))}</p>
          </div>
          <p className="font-semibold">{fee === 0 ? t.free : formatPrice(fee, currency, locale)}</p>
        </div>
      ) : (
        <p className="border border-dashed p-5 text-sm text-muted-foreground">{t.pending}</p>
      )}
    </section>
  );
}

function arrival(etaDays: number, locale: Locale): string {
  const date = new Date();
  date.setDate(date.getDate() + etaDays);
  // vi-VN's day+month format is "02-10"; Vietnamese shoppers (and the wireframe) write "02/10".
  if (locale === 'vi') return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  return new Intl.DateTimeFormat(toIntlLocale(locale), { day: '2-digit', month: '2-digit' }).format(date);
}
