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
  const [selectedFor, setSelectedFor] = useState(product.id);
  const [color, setColor] = useState<string | undefined>(colors[0]?.color);

  // Re-seed on a product swap, during render (React's documented "adjust state
  // when a prop changes" pattern) rather than in an effect. This makes the
  // component correct standalone rather than only because PDP callers key it
  // by product.id: a caller that reuses one instance across products (a
  // quick-add modal, a carousel) would otherwise render the new product's
  // swatches while the parent still holds the old product's variant.
  if (selectedFor !== product.id) {
    setSelectedFor(product.id);
    setColor(colors[0]?.color);
  }

  // Emits the current product's default variant — on mount, and again whenever
  // the product changes (after the re-seed above has landed).
  useEffect(() => {
    onVariantChange(resolveVariant(product, colors[0]?.color));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

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
