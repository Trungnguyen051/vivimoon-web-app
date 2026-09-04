'use client';
import Link from 'next/link';
import { XIcon } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ComparisonMatrix, ComparisonRow } from '@/lib/api/schemas/catalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PriceTag } from './price-tag';

/**
 * Pure presentational (spec Task 4): takes the already-fetched `matrix` and
 * loading/error state as props, fetches nothing itself — `ComparisonTray`
 * owns the `useComparisonMatrix` call and re-fetches when `productIds`
 * changes, including a column removed from in here via `onRemove`.
 */
export function ComparisonDialog({
  open, onOpenChange, matrix, isPending, error, locale, dict, onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrix: ComparisonMatrix | null;
  isPending: boolean;
  error: string | null;
  locale: Locale;
  dict: Dictionary;
  onRemove: (productId: string) => void;
}) {
  const products = matrix?.products ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dict.compare.title}</DialogTitle>
        </DialogHeader>

        {isPending && products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-destructive">{error}</p>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{dict.compare.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="grid gap-px overflow-hidden rounded-xl border bg-border"
              style={{ gridTemplateColumns: `repeat(${products.length}, minmax(11rem, 1fr))` }}
            >
              {products.map((product) => (
                <ProductColumn key={product.id} product={product} locale={locale} dict={dict} onRemove={onRemove} />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProductColumn({
  product, locale, dict, onRemove,
}: {
  product: ComparisonRow; locale: Locale; dict: Dictionary; onRemove: (productId: string) => void;
}) {
  const rows: [string, React.ReactNode][] = [
    [dict.pdp.color, product.color ? (
      <span className="inline-flex items-center gap-1.5">
        <span
          className="size-3.5 rounded-full ring-1 ring-border ring-offset-1 ring-offset-background"
          style={{ backgroundColor: product.color }}
        />
        {product.colorLabel}
      </span>
    ) : '—'],
    [dict.pdp.diameter, product.diameter],
    [dict.compare.eyeEnlargement, dict.compare.bands[product.eyeEnlargement]],
    [dict.compare.lifespan, dict.filters.replacements[product.lifespan]],
    [dict.compare.price, <PriceTag key="price" price={product.price} currency={product.currency} locale={locale} />],
  ];

  return (
    <div className="flex flex-col gap-1.5 bg-background p-4">
      <div className="relative mb-2 flex items-start justify-between gap-2">
        <Link href={`/${locale}/product/${product.slug}`} className="text-sm font-medium leading-snug hover:text-primary">
          {product.name}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`${dict.compare.remove}: ${product.name}`}
          onClick={() => onRemove(product.id)}
        >
          <XIcon />
        </Button>
      </div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-0.5 border-t pt-1.5 first:border-t-0 first:pt-0">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium text-foreground">{value}</dd>
        </div>
      ))}
    </div>
  );
}
