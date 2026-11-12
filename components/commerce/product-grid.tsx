'use client';
import { Fragment, useEffect, type ReactNode } from 'react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { ProductCard } from './product-card';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { toGa4Items } from '@/lib/analytics/events';
import { cn } from '@/lib/utils/cn';

export function ProductGrid({
  products, locale, dict, listId, className, images, fourth,
}: {
  products: Product[]; locale: Locale; dict: Dictionary; listId: string; className?: string;
  /** Each card's "Xem ảnh" photo and hover photo, by product id (the PLP). */
  images?: Record<string, { image: string; hoverImage: string }>;
  /** A tile placed at grid position 4 — the PLP's quiz card. */
  fourth?: ReactNode;
}) {
  const { track } = useAnalytics();
  useEffect(() => {
    track({ name: 'view_item_list', params: { item_list_id: listId, items: toGa4Items(products.map((p) => ({ product: p }))) } });
  }, [listId, products, track]);

  return (
    <div className={cn('grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6', className)}>
      {products.map((p, i) => (
        <Fragment key={p.id}>
          {i === 3 && fourth ? <Fragment key="fourth">{fourth}</Fragment> : null}
          <ProductCard
            product={p}
            locale={locale}
            dict={dict}
            {...images?.[p.id]}
            onSelect={() => track({ name: 'select_item', params: { item_list_id: listId, items: toGa4Items([{ product: p }]) } })}
          />
        </Fragment>
      ))}
    </div>
  );
}
