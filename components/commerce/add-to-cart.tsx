'use client';
import { useEffect, useState } from 'react';
import type { Product, Variant } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { VariantSelector } from './variant-selector';
import { PriceTag } from './price-tag';
import { QuantityStepper } from './quantity-stepper';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/use-cart';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { toGa4Items } from '@/lib/analytics/events';

export function AddToCart({ product, locale, dict }: { product: Product; locale: Locale; dict: Dictionary }) {
  const { add } = useCart();
  const { track } = useAnalytics();
  const [variant, setVariant] = useState<Variant>(product.variants[0]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    track({ name: 'view_item', params: { items: toGa4Items([{ product, variant: product.variants[0] }]) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const onAdd = () => {
    add({
      productId: product.id, variantId: variant.id, name: product.name, sku: variant.sku,
      color: variant.colorLabel, packSize: variant.packSize, unitPrice: variant.price,
      currency: variant.currency, quantity: qty, image: product.images[0],
    });
    track({ name: 'add_to_cart', params: { currency: variant.currency, value: variant.price * qty, items: toGa4Items([{ product, variant, quantity: qty }]) } });
  };

  return (
    <div className="space-y-6">
      <PriceTag price={variant.price} compareAtPrice={variant.compareAtPrice} currency={variant.currency} locale={locale} className="text-2xl" />
      <VariantSelector product={product} dict={dict} onVariantChange={setVariant} />
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{dict.pdp.quantity}</span>
        <QuantityStepper
          value={qty}
          onChange={(next) => setQty(Math.max(1, next))}
          decreaseLabel={dict.common.decreaseQty}
          increaseLabel={dict.common.increaseQty}
        />
      </div>
      <Button onClick={onAdd} className="h-11 w-full text-base">{dict.common.addToCart}</Button>
    </div>
  );
}
