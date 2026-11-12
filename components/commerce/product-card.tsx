import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { PriceTag } from './price-tag';
import { CompareToggle } from './compare-toggle';
import { FavoriteButton } from './favorite-button';
import { RatingStars } from './rating-stars';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { formatCount } from '@/lib/utils/format';
import { distinctColorVariants } from '@/lib/products/variant-colors';
import { cheapestVariant } from '@/lib/products/cheapest-variant';
import { specLine } from '@/lib/products/plp-card';

const SWATCHES_SHOWN = 3;

/**
 * The PLP card (Figma 55:233 / 194:431). `image` is the "Xem ảnh" view's photo and
 * `hoverImage` what a hover swaps to; without them the product's own first two images.
 */
export function ProductCard({
  product, locale, dict, onSelect, image, hoverImage,
}: {
  product: Product; locale: Locale; dict: Dictionary; onSelect?: () => void; image?: string; hoverImage?: string;
}) {
  const v = cheapestVariant(product);
  const primary = image ?? product.images[0];
  const secondary = hoverImage ?? product.images[1] ?? product.images[0];
  const colors = distinctColorVariants(product.variants);
  const href = `/${locale}/product/${product.slug}`;
  const spec = specLine(product, dict);
  const discount = v.compareAtPrice && v.compareAtPrice > v.price ? Math.round((1 - v.price / v.compareAtPrice) * 100) : 0;

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative">
        <Link
          href={href}
          onClick={onSelect}
          className="relative block aspect-[4/5] overflow-hidden bg-muted md:aspect-square"
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
            <span className="absolute left-2 top-2 bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background md:left-3 md:top-3 md:px-2 md:py-1 md:text-xs">
              {dict.pdp.badges[product.badges[0]]}
            </span>
          ) : null}
        </Link>
        <div className="absolute right-2 top-2 flex flex-col gap-2 md:right-3 md:top-3">
          <FavoriteButton
            productId={product.id}
            locale={locale}
            dict={dict.favorites}
            iconOnly
            label={dict.favorites.addNamed.replace('{name}', product.name)}
            className="size-8 rounded-full border-0 bg-background hover:bg-background/90 md:size-9"
          />
          <CompareToggle productId={product.id} dict={dict} className="size-8 border-0 bg-background md:size-9" />
        </div>
      </div>

      <div className="flex flex-col gap-1 md:gap-1.5">
        <Link
          href={href}
          onClick={onSelect}
          className="text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary md:text-base"
        >
          {product.name}
        </Link>
        {spec ? <p className="text-xs text-muted-foreground md:text-sm">{spec}</p> : null}
        {colors.length > 0 ? (
          <div className="flex items-center gap-1.5">
            {colors.slice(0, SWATCHES_SHOWN).map((c) => (
              <span
                key={c.color}
                title={c.colorLabel}
                className="size-3.5 rounded-full ring-1 ring-border ring-offset-1 ring-offset-background md:size-4"
                style={{ backgroundColor: c.color }}
              />
            ))}
            {colors.length > SWATCHES_SHOWN ? (
              <span className="text-xs text-muted-foreground">
                {dict.collection.card.moreColors.replace('{n}', String(colors.length - SWATCHES_SHOWN))}
              </span>
            ) : null}
          </div>
        ) : null}
        {product.reviewCount > 0 || product.soldCount ? (
          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground md:text-sm">
            {product.reviewCount > 0 ? (
              <>
                <RatingStars rating={product.rating} label={dict.common.rating} outOfLabel={dict.common.outOf} className="[&_svg]:size-3 md:[&_svg]:size-3.5" />
                <span>{product.rating.toFixed(1)}</span>
              </>
            ) : null}
            {product.reviewCount > 0 && product.soldCount ? <span aria-hidden>·</span> : null}
            {product.soldCount ? <span>{dict.pdp.sold.replace('{n}', formatCount(product.soldCount, locale))}</span> : null}
          </div>
        ) : null}
        {/* As the frame draws it: price, "/ chiếc", then the discount as a boxed chip — no struck-through price. */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 md:gap-x-2">
          <PriceTag price={v.price} currency={v.currency} locale={locale} className="text-base md:text-lg" />
          <span className="text-xs text-muted-foreground">{dict.pdp.perUnit.single}</span>
          {discount > 0 ? (
            <span className="border border-foreground px-1 text-[10px] font-medium leading-4 md:text-xs">-{discount}%</span>
          ) : null}
        </div>
      </div>

      {/* Links to the PDP until Quick add (#197) lands. */}
      <Link
        href={href}
        onClick={onSelect}
        aria-label={`${dict.common.addToCart} ${product.name}`}
        className={cn(buttonVariants({ variant: 'outline' }), 'mt-auto h-10 w-full gap-2 rounded-none border-foreground text-sm')}
      >
        <ShoppingBag className="size-4 md:size-5" aria-hidden />
        {dict.common.addToCart}
      </Link>
    </div>
  );
}
