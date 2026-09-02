'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, Variant } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Truck } from 'lucide-react';
import { VariantSelector } from './variant-selector';
import { RxSelector, emptyRxDraft, type RxDraft } from './rx-selector';
import { PriceTag } from './price-tag';
import { QuantityStepper } from './quantity-stepper';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/features/cart/use-cart';
import { useBuyNow } from '@/features/cart/use-buy-now';
import { lineKey } from '@/lib/cart/line-key';
import { rxSchemaForLensType } from '@/lib/api/schemas/rx';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { toGa4Items } from '@/lib/analytics/events';
import type { CartLine } from '@/features/cart/cart.types';

export function AddToCart({ product, locale, dict }: { product: Product; locale: Locale; dict: Dictionary }) {
  const { add } = useCart();
  const { setBuyNowLine } = useBuyNow();
  const router = useRouter();
  const { track } = useAnalytics();
  const [variant, setVariant] = useState<Variant>(product.variants[0]);
  const [qty, setQty] = useState(1);
  const [rxDraft, setRxDraft] = useState<RxDraft>(emptyRxDraft);
  // Tracks whether the shopper has touched the Rx controls at all. The button
  // is `disabled` while invalid, which blocks its own click handler, so a
  // "did they try to submit" flag can never fire from onAdd — the validation
  // hint has to key off interaction with RxSelector instead.
  const [touchedRx, setTouchedRx] = useState(false);

  useEffect(() => {
    track({ name: 'view_item', params: { items: toGa4Items([{ product, variant: product.variants[0] }]) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Only meaningful (and only parsed) when the product requires a prescription;
  // a cosmetic product that doesn't collect one is never gated by this.
  const parsedRx = product.requiresRx ? rxSchemaForLensType(product.type).safeParse(rxDraft) : undefined;
  const canAdd = !product.requiresRx || parsedRx?.success === true;

  const buildLine = (): CartLine => {
    const rx = product.requiresRx && parsedRx?.success ? parsedRx.data : undefined;
    return {
      lineKey: lineKey(variant.id, rx),
      productId: product.id, variantId: variant.id, name: product.name, sku: variant.sku,
      color: variant.colorLabel, packSize: variant.packSize, unitPrice: variant.price,
      currency: variant.currency, quantity: qty, image: product.images[0], rx,
    };
  };

  const trackAddToCart = () => {
    track({
      name: 'add_to_cart',
      params: {
        currency: variant.currency,
        // Sanctioned analytics snapshot (Global Constraint): GA4 requires a
        // `value` at add time, before any server price exists. Not a figure
        // shown to the shopper.
        value: variant.price * qty,
        items: toGa4Items([{ product, variant, quantity: qty }]),
      },
    });
  };

  const onAdd = () => {
    if (product.requiresRx && !parsedRx?.success) return;
    add(buildLine());
    trackAddToCart();
  };

  // Buy Now (spec §10): same Rx selection and validation as Add to Cart, but
  // the line goes into the store's short-lived `buyNowLine` slice instead of
  // `lines` — the real cart is never touched, so it survives an abandoned or
  // completed buy-now checkout unchanged (app/[locale]/checkout/page.tsx).
  const onBuyNow = () => {
    if (product.requiresRx && !parsedRx?.success) return;
    setBuyNowLine(buildLine());
    trackAddToCart();
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PriceTag price={variant.price} compareAtPrice={variant.compareAtPrice} currency={variant.currency} locale={locale} className="text-3xl" />
      <Separator />
      <VariantSelector product={product} dict={dict} onVariantChange={setVariant} />
      {product.requiresRx ? (
        <RxSelector
          value={rxDraft}
          onChange={(next) => { setRxDraft(next); setTouchedRx(true); }}
          lensType={product.type}
          dict={dict}
        />
      ) : null}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{dict.pdp.quantity}</span>
        <QuantityStepper
          value={qty}
          onChange={(next) => setQty(Math.max(1, next))}
          decreaseLabel={dict.common.decreaseQty}
          increaseLabel={dict.common.increaseQty}
        />
      </div>
      <div className="flex flex-col gap-3">
        <Button onClick={onAdd} disabled={!canAdd} className="h-12 w-full text-base">{dict.common.addToCart}</Button>
        <Button onClick={onBuyNow} disabled={!canAdd} variant="outline" className="h-12 w-full text-base">
          {dict.common.buyNow}
        </Button>
      </div>
      {product.requiresRx && touchedRx && !canAdd ? (
        <p role="alert" className="-mt-4 text-sm text-destructive">{dict.rx.required}</p>
      ) : null}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Truck className="size-4" />
        {dict.pdp.freeship}
      </div>
    </div>
  );
}
