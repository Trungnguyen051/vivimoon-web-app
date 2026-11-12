'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { useCart } from '@/features/cart/use-cart';
import { lineKey } from '@/lib/cart/line-key';
import { PriceTag } from '@/components/commerce/price-tag';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { toGa4Items } from '@/lib/analytics/events';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Product } from '@/lib/api/schemas/catalog';

export function FavoritesGrid({
  initialProducts, locale, dict,
}: {
  initialProducts: Product[]; locale: Locale; dict: Dictionary['favorites'];
}) {
  const router = useRouter();
  const { add } = useCart();
  const [products, setProducts] = useState(initialProducts);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { track } = useAnalytics();
  useEffect(() => {
    track({ name: 'view_item_list', params: { item_list_id: 'favorites', items: toGa4Items(initialProducts.map((p) => ({ product: p }))) } });
  }, [initialProducts, track]);
  const select = (p: Product) => track({ name: 'select_item', params: { item_list_id: 'favorites', items: toGa4Items([{ product: p }]) } });

  async function remove(id: string) {
    const result = await apiRequest(`/api/account/favorites/${id}`, { method: 'DELETE' });
    if (result.ok) setProducts((list) => list.filter((p) => p.id !== id));
  }

  function addToCart(p: Product) {
    if (p.requiresRx) {
      select(p);
      return router.push(`/${locale}/product/${p.slug}`);
    }
    const v = p.variants[0];
    add({
      lineKey: lineKey(v.id, undefined),
      productId: p.id, variantId: v.id, name: p.name, sku: v.sku,
      color: v.colorLabel, unitPrice: v.price, currency: v.currency, quantity: 1, image: p.images[0],
    });
    // Analytics snapshot only, as in AddToCart; never shown to the shopper.
    track({ name: 'add_to_cart', params: { currency: v.currency, value: v.price, items: toGa4Items([{ product: p, variant: v, quantity: 1 }]) } });
    setAddedId(p.id);
    setTimeout(() => setAddedId((id) => (id === p.id ? null : id)), 2000);
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {products.map((p) => {
        const v = p.variants[0];
        const href = `/${locale}/product/${p.slug}`;
        return (
          <li key={p.id} className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex gap-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={p.images[0]} alt="" fill className="object-cover" sizes="96px" />
                <Button
                  type="button" size="icon" variant="ghost" aria-label={dict.remove}
                  className="absolute left-1 top-1 size-7 bg-background/90"
                  onClick={() => void remove(p.id)}
                >
                  <Heart className="size-4 fill-current text-destructive" />
                </Button>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <Link href={href} onClick={() => select(p)} className="font-medium">{p.name}</Link>
                {v.colorLabel ? <span className="text-sm text-muted-foreground">{v.colorLabel}</span> : null}
                <PriceTag price={v.price} currency={v.currency} compareAtPrice={v.compareAtPrice} locale={locale} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => addToCart(p)} aria-live="polite">{addedId === p.id ? dict.added : dict.addToCart}</Button>
              <Button type="button" onClick={() => { select(p); router.push(href); }}>{dict.buyNow}</Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
