'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, Variant } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { ShoppingBag } from 'lucide-react';
import { VariantSelector } from './variant-selector';
import { RxSelector, defaultRxDraft, draftToRx, type RxDraft } from './rx-selector';
import { PriceTag } from './price-tag';
import { QuantityStepper } from './quantity-stepper';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/features/cart/use-cart';
import { useBuyNow } from '@/features/cart/use-buy-now';
import { useBuyBoxStore } from '@/features/cart/buy-box-store';
import { useMiniCartStore } from '@/features/cart/mini-cart-store';
import { lineKey } from '@/lib/cart/line-key';
import { lensesIn } from '@/lib/api/schemas/rx';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { toGa4Items } from '@/lib/analytics/events';
import type { CartLine } from '@/features/cart/cart.types';
import { lensLineOf } from '@/lib/products/lens-facets';

/** The support guide behind "Hướng dẫn chọn độ" (content/mock/support.ts). */
const POWER_GUIDE_SLUG = 'chon-do-can-the-nao';

export function AddToCart({
  product, locale, dict, children, favorite,
}: {
  product: Product; locale: Locale; dict: Dictionary;
  /** The PDP's promo chips and comfort block, which the frame draws between the price and the options. */
  children?: ReactNode;
  /** The favourite toggle, beside the buttons from md up. */
  favorite?: ReactNode;
}) {
  const { add } = useCart();
  const { setBuyNowLine } = useBuyNow();
  const showMiniCart = useMiniCartStore((s) => s.show);
  const router = useRouter();
  const { track } = useAnalytics();
  const [variant, setVariant] = useState<Variant>(product.variants[0]);
  const [qty, setQty] = useState(1);
  // Every power defaults to 0.00, so the draft is always a valid Rx and the
  // buttons are never gated on it (designer note "Dev: default độ cận").
  const [rxDraft, setRxDraft] = useState<RxDraft>(defaultRxDraft);

  useEffect(() => {
    track({ name: 'view_item', params: { items: toGa4Items([{ product, variant: product.variants[0] }]) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // A product that collects no Rx has no Purchase Unit either (ADR-0023).
  const unit = product.requiresRx ? rxDraft.unit : undefined;
  // Display only (the ticket asks for the per-pair price in pair mode): the
  // listed price is per lens and the buy box shows it per unit. Every amount
  // the shopper pays comes from POST /api/cart/price.
  const lenses = lensesIn(unit);

  const buildLine = (): CartLine => {
    const rx = product.requiresRx ? draftToRx(rxDraft) : undefined;
    return {
      lineKey: lineKey(variant.id, rx),
      productId: product.id, variantId: variant.id, name: product.name, sku: variant.sku,
      color: variant.colorLabel, unitPrice: variant.price * lenses,
      currency: variant.currency, quantity: qty, image: product.images[0],
      lensLine: lensLineOf(product.specs.material), replacement: product.replacement,
      ...(unit ? { purchaseUnit: unit, rx } : {}),
    };
  };

  // Hands the Bundle block the lens as set up here, one unit of it.
  const setBuyBoxLine = useBuyBoxStore((s) => s.setLine);
  useEffect(() => {
    setBuyBoxLine({ ...buildLine(), quantity: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, rxDraft]);

  const trackAddToCart = () => {
    track({
      name: 'add_to_cart',
      params: {
        currency: variant.currency,
        // Sanctioned analytics snapshot (Global Constraint): GA4 requires a
        // `value` at add time, before any server price exists. Not a figure
        // shown to the shopper.
        value: variant.price * lenses * qty,
        items: toGa4Items([{ product, variant, quantity: qty }]),
      },
    });
  };

  const onAdd = () => {
    const line = buildLine();
    add(line);
    trackAddToCart();
    showMiniCart([line]);
  };

  // Buy Now (spec §10): same line as Add to Cart, but it goes into the store's
  // short-lived `buyNowLine` slice instead of `lines` — the real cart is never
  // touched, so it survives an abandoned or completed buy-now checkout
  // unchanged (app/[locale]/checkout/page.tsx). It opens no mini cart.
  const onBuyNow = () => {
    setBuyNowLine(buildLine());
    trackAddToCart();
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-2">
        <PriceTag
          price={variant.price * lenses}
          compareAtPrice={variant.compareAtPrice === undefined ? undefined : variant.compareAtPrice * lenses}
          currency={variant.currency}
          locale={locale}
          className="text-3xl"
        />
        {unit ? <span className="text-base text-muted-foreground">{dict.pdp.perUnit[unit]}</span> : null}
      </div>
      {children}
      <Separator />
      <VariantSelector product={product} dict={dict} onVariantChange={setVariant} />
      {product.requiresRx ? (
        <RxSelector value={rxDraft} onChange={setRxDraft} guideHref={`/${locale}/support/guides/${POWER_GUIDE_SLUG}`} dict={dict} />
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm text-muted-foreground">{dict.pdp.quantity}</span>
        <QuantityStepper
          value={qty}
          onChange={(next) => setQty(Math.max(1, next))}
          decreaseLabel={dict.common.decreaseQty}
          increaseLabel={dict.common.increaseQty}
        />
        {unit ? (
          // Stock counts lenses; a pair takes two.
          <span className="text-sm text-muted-foreground/80">
            {dict.pdp.stockLeft[unit].replace('{count}', String(Math.floor(variant.stock / lenses)))}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:gap-3">
        <Button onClick={onAdd} size="xl" className="w-full md:flex-1">
          <ShoppingBag className="size-4.5" aria-hidden />
          {dict.common.addToCart}
        </Button>
        <Button onClick={onBuyNow} variant="outline" size="xl" className="w-full md:flex-1">
          {dict.common.buyNow}
        </Button>
        {favorite ? <div className="hidden md:flex">{favorite}</div> : null}
      </div>
    </div>
  );
}
