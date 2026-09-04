import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { PriceTag } from './price-tag';
import { CompareToggle } from './compare-toggle';
import { cn } from '@/lib/utils/cn';

function minVariant(product: Product) {
  return product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
}

export function ProductCard({
  product, locale, dict, onSelect,
}: {
  product: Product; locale: Locale; dict: Dictionary; onSelect?: () => void;
}) {
  const v = minVariant(product);
  const primary = product.images[0];
  const secondary = product.images[1] ?? product.images[0];
  const colors = Array.from(
    new Map(product.variants.filter((x) => x.color).map((c) => [c.color, c])).values(),
  );

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative">
        <Link
          href={`/${locale}/product/${product.slug}`}
          onClick={onSelect}
          className="relative block aspect-square overflow-hidden rounded-lg bg-muted"
          aria-hidden="true"
          tabIndex={-1}
        >
          {primary ? (
            <Image
              src={primary}
              alt=""
              fill
              className="object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-0"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          ) : null}
          {secondary ? (
            <Image
              src={secondary}
              alt=""
              fill
              className="object-cover opacity-0 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          ) : null}
          {product.badges[0] ? (
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground backdrop-blur-sm">
              {product.badges[0]}
            </span>
          ) : null}
        </Link>
        <CompareToggle productId={product.id} dict={dict} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-col gap-2">
        {colors.length > 0 ? (
          <div className="flex gap-1.5">
            {colors.map((c) => (
              <span
                key={c.color}
                title={c.colorLabel}
                className={cn('size-3.5 rounded-full ring-1 ring-border ring-offset-1 ring-offset-background')}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        ) : null}
        <Link
          href={`/${locale}/product/${product.slug}`}
          onClick={onSelect}
          className="text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <PriceTag
          price={v.price}
          compareAtPrice={v.compareAtPrice}
          currency={v.currency}
          locale={locale}
        />
      </div>
    </div>
  );
}
