'use client';
import { useEffect } from 'react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { ProductCard } from './product-card';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { toGa4Items } from '@/lib/analytics/events';

export function ProductGrid({ products, locale, listId }: { products: Product[]; locale: Locale; listId: string }) {
  const { track } = useAnalytics();
  useEffect(() => {
    track({ name: 'view_item_list', params: { item_list_id: listId, items: toGa4Items(products.map((p) => ({ product: p }))) } });
  }, [listId, products, track]);

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          locale={locale}
          onSelect={() => track({ name: 'select_item', params: { item_list_id: listId, items: toGa4Items([{ product: p }]) } })}
        />
      ))}
    </div>
  );
}
