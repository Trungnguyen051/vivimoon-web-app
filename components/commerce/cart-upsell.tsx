'use client';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import type { Accessory, Product } from '@/lib/api/schemas/catalog';
import type { NextSpendTier } from '@/lib/api/schemas/cart';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { CartLine } from '@/features/cart/cart.types';
import { accessoryLine } from '@/features/cart/accessory-line';
import { lensLineOf } from '@/lib/products/lens-facets';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { lineTitle } from './line-summary';
import { QuickAdd } from './quick-add';

/** How many cards the row shows: four on desktop (Figma 57:807), the first two on a phone (206:1043). */
const CARDS = 4;

type Card =
  | { kind: 'accessory'; key: string; line: CartLine }
  | { kind: 'lens'; key: string; product: Product };

/**
 * "Mua thêm để được giảm 50K": accessories and lenses not yet in the cart. An accessory
 * goes straight in with "+ Thêm vào giỏ"; a lens opens Quick add for its unit and power.
 * The heading names the next Spend Tier's reward.
 */
export function CartUpsell({
  accessories, lenses, inCart, next, onAdd, locale, dict,
}: {
  accessories: Accessory[]; lenses: Product[]; inCart: string[]; next: NextSpendTier | undefined;
  onAdd: (line: CartLine) => void; locale: Locale; dict: Dictionary;
}) {
  const t = dict.spendTier;
  const short = (n: number) => `${n / 1000}K`;
  const acc: Card[] = accessories
    // Never offer a Gift for sale (CONTEXT.md "Gift").
    .filter((a) => !a.giftOnly && !inCart.includes(a.id))
    .map((a) => ({ kind: 'accessory', key: a.id, line: accessoryLine(a) }));
  const lens: Card[] = lenses.filter((p) => !inCart.includes(p.id)).map((p) => ({ kind: 'lens', key: p.id, product: p }));
  // Accessories first, one lens third, as the frame lays them out.
  const cards = [...acc.slice(0, 2), ...lens.slice(0, 1), ...acc.slice(2), ...lens.slice(1)].slice(0, CARDS);
  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="cart-upsell" className="w-full bg-muted/60 px-4 py-12 md:px-10 md:py-20">
      <h2 id="cart-upsell" className="font-heading text-2xl tracking-tight md:text-4xl">
        {next ? t.upsell[next.reward].replace('{value}', short(next.value ?? 0)) : t.upsellDone}
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:mt-10 md:grid-cols-4 md:gap-6">
        {cards.map((card, i) => {
          const title = card.kind === 'accessory'
            ? lineTitle(card.line, dict)
            : lineTitle({ name: card.product.name, lensLine: lensLineOf(card.product.specs.material), replacement: card.product.replacement }, dict);
          const image = card.kind === 'accessory' ? card.line.image : card.product.images[0];
          const v = card.kind === 'accessory' ? { price: card.line.unitPrice, currency: card.line.currency } : card.product.variants[0];
          return (
            <li key={card.key} className={i >= 2 ? 'hidden md:flex md:flex-col' : 'flex flex-col'}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-background">
                {image ? <Image src={image} alt="" fill className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" /> : null}
              </div>
              <p className="mt-3 text-sm font-medium md:text-base">{title}</p>
              {/* The listed price, as on any product card; totals stay the server's (ADR-0003). */}
              <p className="mt-1 text-sm font-semibold tabular-nums md:text-base">
                {formatPrice(v.price, v.currency, locale)}{card.kind === 'lens' ? ` ${dict.pdp.perUnit.single}` : ''}
              </p>
              {card.kind === 'lens' ? (
                <QuickAdd product={card.product} locale={locale} dict={dict} className="mt-3 h-10 w-full gap-2 border-foreground md:h-11" />
              ) : (
                <Button
                  variant="outline"
                  className="mt-3 h-10 w-full border-foreground md:h-11"
                  aria-label={dict.miniCart.addItem.replace('{name}', title)}
                  onClick={() => onAdd(card.line)}
                >
                  <Plus className="size-4" aria-hidden />
                  {dict.common.addToCart}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
