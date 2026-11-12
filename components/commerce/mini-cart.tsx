'use client';
import Image from 'next/image';
import Link from 'next/link';
import { CircleCheck, Lock, Plus, X } from 'lucide-react';
import type { Accessory } from '@/lib/api/schemas/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCart } from '@/features/cart/use-cart';
import { usePricedCart } from '@/features/cart/use-priced-cart';
import { useMiniCartStore } from '@/features/cart/mini-cart-store';
import { accessoryLine } from '@/features/cart/accessory-line';
import { useSessionStore } from '@/features/session/session-store';
import type { CartLine } from '@/features/cart/cart.types';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { TIER_GIFT_VARIANT_ID } from '@/lib/api/resources/pricing/spend-tiers';
import { CartLineItem } from './cart-line-item';
import { SpendTierProgress } from './spend-tier-progress';
import { formatPowers } from './line-summary';

/** How many accessories "Thêm để đủ Freeship" suggests. */
const SUGGESTIONS = 2;

/**
 * The mini cart drawer (Figma 57:2 desktop, 197:431 mobile). Opened by the
 * cart-UI signal (features/cart/mini-cart-store.ts) after Thêm vào giỏ, never
 * after Mua ngay. Mounted once in the locale layout.
 */
export function MiniCart({ locale, dict, accessories }: { locale: Locale; dict: Dictionary; accessories: Accessory[] }) {
  const open = useMiniCartStore((s) => s.open);
  const setOpen = useMiniCartStore((s) => s.setOpen);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 bg-background data-[side=right]:w-[calc(100%-2rem)] data-[side=right]:sm:max-w-[480px]"
      >
        {/* Mounted only while open, so a closed drawer never prices the cart. */}
        <MiniCartBody locale={locale} dict={dict} accessories={accessories} close={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

function MiniCartBody({ locale, dict, accessories, close }: {
  locale: Locale; dict: Dictionary; accessories: Accessory[]; close: () => void;
}) {
  const t = dict.miniCart;
  const added = useMiniCartStore((s) => s.added);
  const { lines, hydrated, count, currency, add, updateQty, remove, edit } = useCart();
  const sessionStatus = useSessionStore((s) => s.status);
  const { result } = usePricedCart(lines, hydrated, sessionStatus);
  const price = (n: number) => formatPrice(n, result?.currency ?? currency, locale);
  const unavailable = new Set(result?.unavailableLines.map((l) => l.lineKey));

  const suggestions = result?.nextSpendTier?.reward === 'freeShipping'
    ? accessories
      // Never suggest a Gift: the gift-only kit, or the tray the 500.000₫ tier gives free.
      .filter((a) => !a.giftOnly && a.variants[0].id !== TIER_GIFT_VARIANT_ID && !lines.some((l) => l.productId === a.id))
      .sort((a, b) => a.variants[0].price - b.variants[0].price)
      .slice(0, SUGGESTIONS)
    : [];

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-6 pb-4 sm:px-6">
        <SheetTitle className="text-2xl font-semibold tracking-tight sm:text-[28px]">
          {t.title.replace('{count}', String(count))}
        </SheetTitle>
        <SheetClose render={<Button variant="ghost" size="icon-sm" />}>
          <X className="size-5" />
          <span className="sr-only">{t.close}</span>
        </SheetClose>
      </div>

      {added.length > 0 ? (
        <p role="status" className="mx-0 flex items-center gap-2.5 bg-foreground px-4 py-3 text-sm text-background sm:mx-6 sm:rounded-md">
          <CircleCheck aria-hidden className="size-5 shrink-0" />
          {added.length === 1
            ? t.added.replace('{item}', describe(added[0], dict))
            : t.addedMany.replace('{count}', String(added.length))}
        </p>
      ) : null}

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {result ? (
          <SpendTierProgress
            next={result.nextSpendTier} currency={result.currency ?? currency} locale={locale} dict={dict}
            // Full-bleed between dividers on a phone (197:431), a card from sm up (57:2).
            className="-mx-4 -mt-4 rounded-none border-b bg-transparent sm:mx-0 sm:mt-0 sm:rounded-lg sm:border-0 sm:bg-muted/60"
          />
        ) : null}

        {lines.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">{dict.cart.empty}</p>
        ) : (
          lines.map((l) => (
            <CartLineItem
              key={l.lineKey}
              compact
              line={l}
              locale={locale}
              dict={dict}
              lineTotal={result?.lines.find((pl) => pl.lineKey === l.lineKey)?.lineTotal ?? null}
              unavailable={unavailable.has(l.lineKey)}
              onQty={(key, q) => (q < 1 ? remove(key) : updateQty(key, q))}
              onRemove={remove}
              onEdit={edit}
              accessory={accessories.find((a) => a.id === l.productId)}
              // unitPrice is a display snapshot only; pricing re-reads the variant (ADR-0003).
              onVariant={(key, v) => edit(key, { ...l, variantId: v.id, sku: v.sku, variantLabel: v.label, unitPrice: v.price })}
            />
          ))
        )}

        {suggestions.length > 0 ? (
          <section className="flex flex-col gap-3 pt-5">
            <h3 className="text-sm font-semibold">{t.upsell}</h3>
            {suggestions.map((a) => {
              const line = accessoryLine(a);
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image src={line.image!} alt="" fill className="object-cover" sizes="56px" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
                    <span className="font-medium">{line.name}</span>
                    {/* The listed price, as on any product card; totals stay the server's. */}
                    <span className="text-muted-foreground tabular-nums">{price(line.unitPrice)}</span>
                  </span>
                  <Button variant="outline" size="icon" aria-label={t.addItem.replace('{name}', line.name)} onClick={() => add(line)}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              );
            })}
          </section>
        ) : null}
      </div>

      {lines.length > 0 ? (
        <div className="flex flex-col gap-3 border-t px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">{dict.cart.subtotal}</span>
            <span className="tabular-nums" aria-live="polite">
              {result ? price(result.bundledSubtotal ?? result.subtotal) : '—'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t.note}</p>
          <Link href={`/${locale}/checkout`} onClick={close} className={buttonVariants({ size: 'xl', className: 'w-full' })}>
            <Lock aria-hidden className="size-4.5" />
            {dict.cart.checkout}
          </Link>
          <Link href={`/${locale}/cart`} onClick={close} className={cn(buttonVariants({ size: 'xl', variant: 'outline' }), 'w-full border-foreground')}>
            {t.viewCart}
          </Link>
        </div>
      ) : null}
    </>
  );
}

/** "Sandkiss (L −2.50 · R −3.00)" — the name, and the powers for a lens. */
function describe(line: CartLine, dict: Dictionary): string {
  return line.rx ? `${line.name} (${formatPowers(line.rx, dict)})` : line.name;
}
