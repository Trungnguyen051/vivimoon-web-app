'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { PriceTag } from './price-tag';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

function minVariant(product: Product) {
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}

export function ProductCard({
  product, locale, onSelect,
}: {
  product: Product; locale: Locale; onSelect?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const v = minVariant(product);
  const secondary = product.images[1] ?? product.images[0];
  const src = hover ? secondary : product.images[0];
  const colors = product.variants.filter((x) => x.color);

  return (
    <div className="group flex flex-col gap-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link
        href={`/${locale}/product/${product.slug}`}
        onClick={onSelect}
        className="relative block aspect-square overflow-hidden rounded-md bg-muted"
        aria-hidden="true"
      >
        {src ? <Image src={src} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" /> : null}
        {product.badges[0] ? <Badge className="absolute left-2 top-2 capitalize">{product.badges[0]}</Badge> : null}
      </Link>
      {colors.length > 0 ? (
        <div className="flex gap-1">
          {Array.from(new Map(colors.map((c) => [c.color, c])).values()).map((c) => (
            <span key={c.color} title={c.colorLabel} className={cn('h-4 w-4 rounded-full border')} style={{ backgroundColor: c.color }} />
          ))}
        </div>
      ) : null}
      <Link href={`/${locale}/product/${product.slug}`} onClick={onSelect} className="font-medium hover:underline">
        {product.name}
      </Link>
      <PriceTag price={v.price} compareAtPrice={v.compareAtPrice} currency={v.currency} locale={locale} />
    </div>
  );
}
