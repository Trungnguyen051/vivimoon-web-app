'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Product, Variant } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils/cn';
import { distinctColorVariants } from '@/lib/products/variant-colors';

function resolveVariant(product: Product, color: string | undefined): Variant {
  if (!color) return product.variants[0];
  return product.variants.find((v) => v.color === color) ?? product.variants[0];
}

export function VariantSelector({
  product, dict, onVariantChange,
}: {
  product: Product; dict: Dictionary; onVariantChange: (v: Variant) => void;
}) {
  const colors = useMemo(() => distinctColorVariants(product.variants), [product.variants]);
  const [color, setColor] = useState<string | undefined>(colors[0]?.color);

  // Emits the initial variant on mount. Callers key AddToCart by product.id
  // (app/[locale]/product/[slug]/page.tsx) so a product swap remounts this
  // component rather than reusing it — this only ever runs once per instance.
  useEffect(() => {
    onVariantChange(resolveVariant(product, color));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectColor(next: string | undefined) {
    setColor(next);
    onVariantChange(resolveVariant(product, next));
  }

  // Must come after the hooks above (Rules of Hooks) — a colorless product
  // still needs the mount effect to fire so its sole variant is emitted.
  if (colors.length === 0) return null;

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{dict.pdp.color}</p>
      <div className="flex gap-2.5">
        {colors.map((c) => (
          <button
            key={c.color}
            aria-label={c.colorLabel}
            aria-pressed={color === c.color}
            title={c.colorLabel}
            onClick={() => selectColor(c.color)}
            className={cn(
              'size-8 rounded-full ring-offset-2 ring-offset-background transition-shadow',
              color === c.color ? 'ring-2 ring-primary' : 'ring-1 ring-border hover:ring-foreground/30',
            )}
            style={{ backgroundColor: c.color }}
          />
        ))}
      </div>
    </div>
  );
}
