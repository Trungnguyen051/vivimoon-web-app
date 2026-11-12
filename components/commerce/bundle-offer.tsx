'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Accessory } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/use-cart';
import { useBuyBoxStore } from '@/features/cart/buy-box-store';
import { usePricedCart } from '@/features/cart/use-priced-cart';
import { lineKey } from '@/lib/cart/line-key';
import { formatPrice } from '@/lib/utils/format';
import type { CartLine } from '@/features/cart/cart.types';

/**
 * "Mua kèm tiết kiệm hơn" (CONTEXT.md "Bundle"): the lens as set up in the buy
 * box plus the Bundle's accessories, each tickable. Only the whole set goes in
 * as a Bundle, the one case the server charges the Bundle price for; the total
 * shown is the server's price of whatever is ticked (ADR-0003).
 */
export function BundleOffer({
  product, accessories, locale, dict,
}: {
  product: Product; accessories: Accessory[]; locale: Locale; dict: Dictionary;
}) {
  const t = dict.pdp.bundle;
  const { add } = useCart();
  const buyBoxLine = useBuyBoxStore((s) => s.line);
  // A line left by the previous PDP until this one's buy box publishes its own.
  const lensLine = buyBoxLine?.productId === product.id ? buyBoxLine : null;
  const [unticked, setUnticked] = useState<ReadonlySet<string>>(new Set());

  const items = useMemo(() => {
    const accessoryLines = accessories.map((a): CartLine => {
      const v = a.variants[0];
      return {
        lineKey: lineKey(v.id), productId: a.id, variantId: v.id,
        name: a.option === 'volume' ? `${a.name} ${v.label}` : a.name,
        sku: v.sku, unitPrice: v.price, currency: v.currency, quantity: 1, image: a.images[0], variantLabel: v.label,
      };
    });
    return lensLine ? [lensLine, ...accessoryLines] : accessoryLines;
  }, [accessories, lensLine]);

  const ticked = useMemo(() => {
    const picked = items.filter((l) => !unticked.has(l.productId));
    // Tagged only as the complete set: anything less is ordinary lines.
    if (!lensLine || picked.length < items.length) return picked;
    return picked.map((l) => ({ ...l, bundle: product.id, lineKey: lineKey(l.variantId, l.rx, product.id) }));
  }, [items, unticked, lensLine, product.id]);

  const { result } = usePricedCart(ticked, true);
  const saving = result?.bundleSaving ?? 0;
  const price = (n: number) => formatPrice(n, product.variants[0].currency, locale);

  const toggle = (id: string) =>
    setUnticked((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const lensName = `${product.name} · ${dict.filters.replacements[product.replacement]}`;

  return (
    <section className="flex flex-col gap-5 md:gap-10">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">{t.title}</h2>
        <p className="text-sm text-muted-foreground md:text-base">{t.subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-muted/60 p-4 lg:flex-row lg:items-center lg:p-8">
        <ul className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          {items.map((l, i) => (
            <li key={l.productId} className="flex items-center gap-4">
              {i > 0 ? <Plus className="hidden size-6 shrink-0 text-muted-foreground lg:block" aria-hidden /> : null}
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={!unticked.has(l.productId)}
                  onChange={() => toggle(l.productId)}
                  className="size-5 shrink-0 cursor-pointer accent-foreground"
                />
                <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-background lg:size-16">
                  {l.image ? <Image src={l.image} alt="" fill className="object-cover" sizes="64px" /> : null}
                </span>
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:flex-col lg:items-start lg:gap-1">
                  <span className="text-sm font-medium lg:text-base">{l.productId === product.id ? lensName : l.name}</span>
                  {/* Display only, as in the buy box; the total below is the server's. */}
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{price(l.unitPrice)}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 lg:flex-1 lg:items-end lg:gap-2">
          <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:gap-2">
            <span className="text-sm text-muted-foreground">{t.total}</span>
            <span className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tabular-nums lg:text-2xl">
                {result && ticked.length > 0 ? price(result.bundledSubtotal ?? result.subtotal) : '—'}
              </span>
              {result && saving > 0 ? (
                <span className="text-sm tabular-nums text-muted-foreground line-through">{price(result.subtotal)}</span>
              ) : null}
            </span>
          </div>
          <Button
            size="xl"
            className="w-full lg:w-auto"
            disabled={ticked.length === 0}
            onClick={() => ticked.forEach((l) => add(l))}
          >
            {ticked.length === items.length ? t.add : t.addSome}
          </Button>
        </div>
      </div>
    </section>
  );
}
