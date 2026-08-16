'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Product, Variant } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils/cn';

export function VariantSelector({
  product, dict, onVariantChange,
}: {
  product: Product; dict: Dictionary; onVariantChange: (v: Variant) => void;
}) {
  const colors = useMemo(
    () => Array.from(new Map(product.variants.filter((v) => v.color).map((v) => [v.color, v])).values()),
    [product.variants],
  );
  const [color, setColor] = useState<string | undefined>(colors[0]?.color);
  const packs = product.variants.filter((v) => (color ? v.color === color : true));
  const [variantId, setVariantId] = useState<string>(packs[0]?.id ?? product.variants[0].id);

  useEffect(() => {
    const v = product.variants.find((x) => x.id === variantId) ?? product.variants[0];
    onVariantChange(v);
  }, [variantId, product.variants, onVariantChange]);

  return (
    <div className="space-y-4">
      {colors.length > 0 ? (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{dict.pdp.color}</p>
          <div className="flex gap-2.5">
            {colors.map((c) => (
              <button
                key={c.color}
                aria-label={c.colorLabel}
                aria-pressed={color === c.color}
                title={c.colorLabel}
                onClick={() => { setColor(c.color); const first = product.variants.find((v) => v.color === c.color); if (first) setVariantId(first.id); }}
                className={cn(
                  'size-8 rounded-full ring-offset-2 ring-offset-background transition-shadow',
                  color === c.color ? 'ring-2 ring-primary' : 'ring-1 ring-border hover:ring-foreground/30',
                )}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>
      ) : null}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{dict.pdp.packSize}</p>
        <div className="flex flex-wrap gap-2">
          {packs.map((v) => (
            <button
              key={v.id}
              aria-pressed={variantId === v.id}
              onClick={() => setVariantId(v.id)}
              className={cn(
                'min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors',
                variantId === v.id
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-input text-muted-foreground hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {v.packSize}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
