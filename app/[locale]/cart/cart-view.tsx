'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, Lock, RefreshCw, ShoppingBag, Sparkles } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Accessory, Product } from '@/lib/api/schemas/catalog';
import type { GiftLine } from '@/lib/api/schemas/cart';
import { apiRequest } from '@/lib/api/client';
import { useCart } from '@/features/cart/use-cart';
import { usePricedCart } from '@/features/cart/use-priced-cart';
import { useSessionStore } from '@/features/session/session-store';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { CartLineItem } from '@/components/commerce/cart-line-item';
import { CartUpsell } from '@/components/commerce/cart-upsell';
import { OrderSummary } from '@/components/commerce/order-summary';
import { SpendTierProgress } from '@/components/commerce/spend-tier-progress';
import { VoucherPicker } from '@/components/commerce/voucher-picker';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';
import { formatPrice } from '@/lib/utils/format';
import { PageContainer } from '@/components/layout/page-container';

const RETURNS_FAQ = 'faq?category=doi-tra-va-bao-hanh';

export function CartView({ locale, dict, accessories = [], lenses = [] }: {
  locale: Locale; dict: Dictionary; accessories?: Accessory[];
  /** Lenses the "Mua thêm" row may offer. */
  lenses?: Product[];
}) {
  const router = useRouter();
  const {
    lines, tickedLines, hydrated, count, currency, add, updateQty, remove, edit, tick, tickAll, removeLines,
    voucherCode, setVoucherCode,
  } = useCart();
  const sessionStatus = useSessionStore((s) => s.status);
  // Guest→member cart merge (spec §9): lines already survive login (the
  // cart lives in localStorage, untouched by auth), so re-pricing on a
  // session-status change is what "merge" reduces to here — it lets a
  // `memberOnly` voucher apply the moment a shopper signs in without a
  // page reload.
  // Only ticked lines are priced (CONTEXT.md "Cart Line"); an unticked one shows no total.
  const { result, isError } = usePricedCart(tickedLines, hydrated, sessionStatus, undefined, voucherCode);
  // Lines the catalogue can no longer price (ADR-0012). Excluded from every
  // total server-side; here they stay visible and removable so nothing the
  // shopper put in their cart disappears without them seeing it.
  const unavailableKeys = new Set(result?.unavailableLines?.map((l) => l.lineKey) ?? []);
  const tickedKeys = new Set(tickedLines.map((l) => l.lineKey));
  const { track } = useAnalytics();
  const [moved, setMoved] = useState<number | null>(null);
  const price = (n: number) => formatPrice(n, result?.currency ?? currency, locale);

  // `view_cart` fires exactly once per cart view, the moment the first server
  // price answers — not on every re-price, or a rapid `+` click would fire a
  // duplicate. `value` is the subtotal (GA4 convention: pre-shipping,
  // pre-discount item value), never a client-computed total.
  const viewCartFiredRef = useRef(false);
  useEffect(() => {
    // `currency` is absent only when no line priced at all — there is no
    // cart value to report, so the event is skipped rather than sent with a
    // zero in a guessed currency.
    if (!result || !result.currency || viewCartFiredRef.current) return;
    viewCartFiredRef.current = true;
    track({
      name: 'view_cart',
      params: { currency: result.currency, value: result.subtotal, items: cartLinesToGa4Items(tickedLines) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const handleRemove = (key: string) => {
    const line = lines.find((l) => l.lineKey === key);
    if (line) {
      track({
        name: 'remove_from_cart',
        params: { currency: line.currency, value: line.unitPrice, items: cartLinesToGa4Items([line]) },
      });
    }
    remove(key);
  };

  // Members move unticked lenses to Favorites; a guest signs in first. Accessories stay in the
  // cart: Favorites lists catalog lenses only, so one moved there would silently disappear.
  const movable = lines.filter((l) => !tickedKeys.has(l.lineKey) && l.rx);
  async function moveToFavorites() {
    if (sessionStatus !== 'authenticated') {
      router.push(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/cart`)}`);
      return;
    }
    const ids = [...new Set(movable.map((l) => l.productId))];
    const results = await Promise.all(
      ids.map((productId) => apiRequest('/api/account/favorites', { method: 'POST', body: { productId } })),
    );
    // Only lines whose favorite was saved leave the cart: a failed save loses nothing.
    const saved = new Set(ids.filter((_, i) => results[i].ok));
    const gone = movable.filter((l) => saved.has(l.productId));
    removeLines(gone.map((l) => l.lineKey));
    setMoved(gone.length);
  }

  // The cart lives in localStorage behind zustand `persist` with
  // `skipHydration: true` — unreadable until rehydrate() runs. Gate on
  // `hydrated` first so a shopper with a persisted, non-empty cart never
  // flashes the empty state for a frame on load.
  if (!hydrated) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <Skeleton className="h-9 w-48" />
          <div className="grid gap-10 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (lines.length === 0) {
    return (
      <PageContainer>
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBag />
            </EmptyMedia>
            <EmptyTitle>{dict.cart.empty}</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Link href={`/${locale}`} className={buttonVariants({ size: 'xl' })}>
              {dict.common.shopNow}
            </Link>
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  const gifts = result?.gifts ?? [];
  const giftTitle = (g: GiftLine) => {
    const forLine = g.forProductId ? tickedLines.find((l) => l.productId === g.forProductId) : undefined;
    if (!forLine) return dict.cart.gift.replace('{name}', g.name);
    const product = [forLine.name, forLine.replacement && dict.filters.replacements[forLine.replacement]].filter(Boolean).join(' ');
    return dict.cart.giftWith.replace('{name}', g.name).replace('{product}', product);
  };
  const giftThreshold = result?.spendTiers?.find((t) => t.reward === 'gift')?.threshold ?? 0;
  const appliedVoucher = result?.appliedVouchers[0];
  const tickedCount = tickedLines.reduce((sum, l) => sum + l.quantity, 0);
  const allTicked = tickedLines.length === lines.length;

  return (
    <>
      <PageContainer className="pb-12 md:pb-20">
        <div className="flex items-end justify-between gap-4 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {dict.cart.titleCount.replace('{count}', String(count))}
          </h1>
          <Link href={`/${locale}`} className="flex items-center gap-1.5 pb-1 text-sm underline underline-offset-4 md:text-base">
            <ChevronLeft aria-hidden className="hidden size-4 md:block" />
            <span className="hidden md:inline">{dict.cart.continueShopping}</span>
            <span className="md:hidden">{dict.cart.continueShort}</span>
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
          <div className="min-w-0">
            {result ? (
              <SpendTierProgress
                next={result.nextSpendTier} tiers={result.spendTiers} currency={result.currency ?? currency} locale={locale} dict={dict}
                className="gap-3 rounded-lg p-4 md:p-5"
              />
            ) : null}

            <label className="flex cursor-pointer items-center gap-3 border-b py-5 text-sm md:text-base">
              <input
                type="checkbox"
                checked={allTicked}
                onChange={(e) => tickAll(e.target.checked)}
                className="size-5 shrink-0 cursor-pointer accent-foreground"
              />
              {dict.cart.selectAll.replace('{count}', String(lines.length))}
            </label>

            {lines.map((l) => {
              const pricedLine = result?.lines.find((pl) => pl.lineKey === l.lineKey);
              return (
                <CartLineItem key={l.lineKey} line={pricedLine ? { ...l, currency: pricedLine.currency } : l} locale={locale} dict={dict}
                  ticked={tickedKeys.has(l.lineKey)}
                  onTick={tick}
                  lineTotal={pricedLine?.lineTotal ?? null}
                  unavailable={unavailableKeys.has(l.lineKey)}
                  onQty={(key, q) => (q < 1 ? handleRemove(key) : updateQty(key, q))}
                  onRemove={handleRemove}
                  onEdit={edit}
                  accessory={accessories.find((a) => a.id === l.productId)}
                  // unitPrice is a display snapshot only; pricing re-reads the variant (ADR-0003).
                  onVariant={(key, v) => edit(key, { ...l, variantId: v.id, sku: v.sku, variantLabel: v.label, unitPrice: v.price })} />
              );
            })}

            {gifts.map((g) => (
              <div key={g.variantId} className="mt-4 flex items-center gap-4 rounded-lg bg-muted/60 p-4 sm:pl-9">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-background">
                  {g.image ? <Image src={g.image} alt="" fill className="object-cover" sizes="64px" /> : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                  <span className="font-medium">{giftTitle(g)}</span>
                  {g.description ? <span className="text-muted-foreground">{g.description}</span> : null}
                </span>
                <span className="self-start text-sm font-semibold tabular-nums sm:self-center">{price(0)}</span>
              </div>
            ))}

            <div className="flex flex-col gap-1 py-5">
              <button
                type="button"
                onClick={moveToFavorites}
                disabled={sessionStatus === 'authenticated' && movable.length === 0}
                className="flex w-fit items-center gap-2 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Heart aria-hidden className="size-5" />
                {dict.cart.moveToFavorites}
              </button>
              {moved !== null ? (
                <p role="status" className="text-sm">{dict.cart.movedToFavorites.replace('{count}', String(moved))}</p>
              ) : null}
            </div>
          </div>

          <OrderSummary
            className="gap-5 rounded-lg bg-muted/60 py-6 ring-0 max-lg:bg-transparent max-lg:[--card-spacing:0px] md:py-8 lg:[--card-spacing:--spacing(8)] [&_[data-slot=card-footer]]:border-0 [&_[data-slot=card-footer]]:bg-transparent [&_[data-slot=card-footer]]:pt-0 [&_[data-slot=card-title]]:text-2xl"
            subtotal={result?.subtotal ?? null}
            subtotalLabel={dict.cart.subtotalCount.replace('{count}', String(tickedCount))}
            bundleSaving={result?.bundleSaving}
            gifts={gifts.map((g) => ({
              label: g.reason === 'product'
                ? dict.cart.giftRows.product
                : dict.cart.giftRows.spendTier.replace('{threshold}', price(giftThreshold)),
              name: g.name,
            }))}
            discount={result?.discount ?? null}
            discountLabel={appliedVoucher ? dict.cart.voucherRow.replace('{code}', appliedVoucher.code) : undefined}
            tierDiscount={result?.tierDiscount}
            spendTiers={result?.spendTiers}
            shipping={result?.shipping ?? null}
            total={result?.total ?? null}
            saved={result?.saved}
            currency={result?.currency ?? currency} locale={locale} dict={dict}
            ctaHref={`/${locale}/checkout`} ctaLabel={dict.cart.proceed}
            ctaIcon={<Lock aria-hidden className="size-4.5" />}
            note={unavailableKeys.size > 0 ? dict.cart.unavailableNote : undefined}
            // Checkout is blocked, not silently partial: order placement
            // refuses an unavailable line anyway (ADR-0012), so sending the
            // shopper on would only fail later, further from the fix.
            ctaBlockedReason={
              tickedLines.length === 0
                ? dict.cart.nothingSelected
                : unavailableKeys.size > 0
                  ? dict.cart.unavailableBlocksCheckout
                  : isError ? dict.cart.priceError : undefined
            }
            footer={(
              <>
                <ul aria-label={dict.cart.paymentMethods} className="flex flex-wrap justify-center gap-2 lg:justify-start">
                  {(['cod', 'transfer', 'ewallet'] as const).map((m) => (
                    <li key={m} className="rounded-md border bg-background px-2 py-0.5 text-xs">{dict.cart.payments[m]}</li>
                  ))}
                </ul>
                <div className="flex flex-col gap-1.5 rounded-lg bg-background px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <RefreshCw aria-hidden className="size-4.5 shrink-0" />
                    {dict.returnPolicy.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{dict.returnPolicy.terms}</p>
                  <Link href={`/${locale}/support/${RETURNS_FAQ}#faq-dieu-kien-doi-tra`} className="w-fit text-xs underline underline-offset-4">
                    {dict.returnPolicy.details}
                  </Link>
                </div>
              </>
            )}
          >
            <p className="text-sm font-medium">{dict.cart.voucher.label}</p>
            <VoucherPicker
              vouchers={result?.vouchers ?? []}
              applied={appliedVoucher?.code}
              error={result?.voucherError}
              onChoose={setVoucherCode}
              currency={result?.currency ?? currency} locale={locale} dict={dict}
            />
            {sessionStatus === 'anonymous' && result?.pointsUsable ? (
              <Link
                href={`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/cart`)}`}
                className="flex items-center gap-3 rounded-lg bg-background px-4 py-3 text-sm"
              >
                <Sparkles aria-hidden className="size-4.5 shrink-0" strokeWidth={1.5} />
                <span className="min-w-0 flex-1">
                  {dict.cart.pointsPrompt
                    .replace('{points}', String(result.pointsUsable))
                    .replace('{earn}', String(result.pointsToEarn ?? 0))}
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0" />
              </Link>
            ) : null}
          </OrderSummary>
        </div>
      </PageContainer>

      <CartUpsell
        accessories={accessories} lenses={lenses} inCart={lines.map((l) => l.productId)}
        next={result?.nextSpendTier} onAdd={add} locale={locale} dict={dict}
      />
    </>
  );
}
