'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/features/cart/use-cart';
import { RxSummary } from './rx-summary';
import { PriceTag } from './price-tag';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Order, OrderLine } from '@/lib/api/schemas/orders';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/** An order line plus the catalogue facts the card shows; `product` is null once the variant is gone (ADR-0012). */
export type HistoryLine = OrderLine & {
  product: { id: string; slug: string; name: string; image?: string; sku: string; color?: string; compareAtPrice?: number } | null;
};

const fill = (template: string, n: number) => template.replace('{n}', String(n));

export function OrderHistoryCard({
  order, lines, locale, dict,
}: { order: Order; lines: HistoryLine[]; locale: Locale; dict: Dictionary }) {
  const t = dict.orders;
  const router = useRouter();
  const { add } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(0);

  const shown = expanded ? lines : lines.slice(0, 1);
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const cancellable = order.status === 'placed' || order.status === 'confirmed';
  const reviewSlug = lines.find((l) => l.product)?.product?.slug;

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: 'POST' });
      const body = (await res.json()) as { ok: boolean };
      if (!body.ok) throw new Error('rejected');
      setConfirming(false);
      router.refresh();
    } catch {
      setError(t.cancelFailed);
    } finally {
      setBusy(false);
    }
  };

  const buyAgain = () => {
    let unavailable = 0;
    for (const l of lines) {
      if (!l.product) { unavailable++; continue; }
      add({
        lineKey: l.lineKey, productId: l.product.id, variantId: l.variantId, name: l.product.name,
        sku: l.product.sku, color: l.product.color, unitPrice: l.unitPrice, currency: l.currency,
        quantity: l.quantity, image: l.product.image, rx: l.rx,
      });
    }
    setMissing(unavailable);
    // Stay put when something was skipped, so the shopper reads why.
    if (unavailable === 0) router.push(`/${locale}/cart`);
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/${locale}/account/orders/${order.id}`} className="font-semibold hover:underline">{order.code}</Link>
          <span className={cn('text-sm font-medium', order.status === 'delivered' ? 'text-primary' : 'text-muted-foreground')}>
            {t.statuses[order.status]}
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {shown.map((l) => (
            <li key={l.lineKey} className="flex gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {l.product?.image ? <Image src={l.product.image} alt="" fill className="object-cover" sizes="64px" /> : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium leading-snug">{l.product?.name ?? l.variantId}</span>
                {l.product?.color ? <span className="text-sm text-muted-foreground">{l.product.color}</span> : null}
                {l.rx ? <RxSummary rx={l.rx} dict={dict} /> : null}
                <PriceTag price={l.unitPrice} compareAtPrice={l.product?.compareAtPrice} currency={l.currency} locale={locale} className="text-sm" />
              </div>
              <span className="text-sm text-muted-foreground">×{l.quantity}</span>
            </li>
          ))}
        </ul>

        {lines.length > 1 ? (
          <button type="button" onClick={() => setExpanded((e) => !e)} className="self-start text-sm text-muted-foreground underline underline-offset-4">
            {expanded ? t.showLess : fill(t.showMore, lines.length - 1)}
          </button>
        ) : null}

        <div className="flex items-center justify-between border-t pt-3 font-medium">
          <span>{fill(t.totalItems, itemCount)}</span>
          <span>{formatPrice(order.totals.total, order.totals.currency, locale)}</span>
        </div>

        {cancellable ? (
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => { setError(null); setConfirming(true); }}>{t.cancelOrder}</Button>
          </div>
        ) : null}

        {order.status === 'delivered' ? (
          <div className="grid grid-cols-3 gap-2">
            <Link href={`/${locale}/support/faq?category=doi-tra-va-bao-hanh`} className={buttonVariants({ variant: 'outline' })}>{t.returnItems}</Link>
            {reviewSlug ? (
              <Link href={`/${locale}/product/${reviewSlug}#reviews`} className={buttonVariants({ variant: 'outline' })}>{t.review}</Link>
            ) : <span />}
            <Button onClick={buyAgain}>{t.buyAgain}</Button>
          </div>
        ) : null}

        {missing > 0 ? (
          <p role="alert" className="text-sm text-destructive">
            {fill(t.unavailable, missing)}{' '}
            <Link href={`/${locale}/cart`} className="underline underline-offset-4">{t.viewCart}</Link>
          </p>
        ) : null}
      </CardContent>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.cancelTitle}</DialogTitle>
            <DialogDescription>{t.cancelBody}</DialogDescription>
          </DialogHeader>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)}>{t.cancelKeep}</Button>
            <Button onClick={cancel} disabled={busy}>{t.cancelConfirm}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
