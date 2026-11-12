'use client';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import type { Accessory, Product } from '@/lib/api/schemas/catalog';
import type { NextSpendTier } from '@/lib/api/schemas/cart';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { CartLine } from '@/features/cart/cart.types';
import { accessoryLine } from '@/features/cart/accessory-line';
import { lineKey } from '@/lib/cart/line-key';
import { lensLineOf } from '@/lib/products/lens-facets';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { lineTitle } from './line-summary';

/** How many cards the row shows: four on desktop (Figma 57:807), the first two on a phone (206:1043). */
const CARDS = 4;

/**
 * One lens at Không độ, the buy box's own default (spec #190 story 29). The cart line above
 * lets the shopper set the unit and power in place.
 * shortcut: adds straight to the cart; open Quick add instead once #197 lands.
 */
function plainLensLine(p: Product): CartLine {
  const v = p.variants[0];
  const rx = { sph: 0 };
  return {
    lineKey: lineKey(v.id, rx),
    productId: p.id, variantId: v.id, name: p.name, sku: v.sku, color: v.colorLabel,
    unitPrice: v.price, currency: v.currency, quantity: 1, image: p.images[0],
    lensLine: lensLineOf(p.specs.material), replacement: p.replacement,
    purchaseUnit: 'single', rx,
  };
}

/**
 * "Mua thêm để được giảm 50K": accessories and lenses not yet in the cart, each with
 * "+ Thêm vào giỏ". The heading names the next Spend Tier's reward.
 */
export function CartUpsell({
  accessories, lenses, inCart, next, onAdd, locale, dict,
}: {
  accessories: Accessory[]; lenses: Product[]; inCart: string[]; next: NextSpendTier | undefined;
  onAdd: (line: CartLine) => void; locale: Locale; dict: Dictionary;
}) {
  const t = dict.spendTier;
  const short = (n: number) => `${n / 1000}K`;
  const acc = accessories
    // Never offer a Gift for sale (CONTEXT.md "Gift").
    .filter((a) => !a.giftOnly && !inCart.includes(a.id))
    .map((a) => ({ line: accessoryLine(a), perLens: false }));
  const lens = lenses.filter((p) => !inCart.includes(p.id)).map((p) => ({ line: plainLensLine(p), perLens: true }));
  // Accessories first, one lens third, as the frame lays them out.
  const cards = [...acc.slice(0, 2), ...lens.slice(0, 1), ...acc.slice(2), ...lens.slice(1)].slice(0, CARDS);
  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="cart-upsell" className="w-full bg-muted/60 px-4 py-12 md:px-10 md:py-20">
      <h2 id="cart-upsell" className="font-heading text-2xl tracking-tight md:text-4xl">
        {next ? t.upsell[next.reward].replace('{value}', short(next.value ?? 0)) : t.upsellDone}
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:mt-10 md:grid-cols-4 md:gap-6">
        {cards.map(({ line, perLens }, i) => {
          const title = lineTitle(line, dict);
          return (
            <li key={line.lineKey} className={i >= 2 ? 'hidden md:flex md:flex-col' : 'flex flex-col'}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-background">
                {line.image ? <Image src={line.image} alt="" fill className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" /> : null}
              </div>
              <p className="mt-3 text-sm font-medium md:text-base">{title}</p>
              {/* The listed price, as on any product card; totals stay the server's (ADR-0003). */}
              <p className="mt-1 text-sm font-semibold tabular-nums md:text-base">
                {formatPrice(line.unitPrice, line.currency, locale)}{perLens ? ` ${dict.pdp.perUnit.single}` : ''}
              </p>
              <Button
                variant="outline"
                className="mt-3 h-10 w-full border-foreground md:h-11"
                aria-label={dict.miniCart.addItem.replace('{name}', title)}
                onClick={() => onAdd(line)}
              >
                <Plus className="size-4" aria-hidden />
                {dict.common.addToCart}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
