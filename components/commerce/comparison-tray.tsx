'use client';
import { useState } from 'react';
import Image from 'next/image';
import { XIcon, Scale } from 'lucide-react';
import { useCompareStore } from '@/features/compare/compare-store';
import { useComparisonMatrix } from '@/features/compare/use-comparison';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { ComparisonDialog } from './comparison-dialog';

/**
 * Mounted once in `app/[locale]/layout.tsx` (spec Task 3 Step 4) so it's
 * genuinely persistent across page navigations, not per-page. Renders
 * nothing once `productIds` is empty — including on first paint, since the
 * store's default state is already `[]` before `CompareHydrator` restores
 * anything, so there's no empty→populated flash of the wrong content.
 *
 * Owns the single `useComparisonMatrix` fetch for both the thumbnail strip
 * and the Dialog (Task 4) — one fetch, two consumers, rather than fetching
 * again on "Compare" click. The hook already re-fires on every `productIds`
 * change, which is what makes a removed column re-fetch live (spec §10)
 * rather than just disappearing against stale data.
 */
export function ComparisonTray({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const productIds = useCompareStore((s) => s.productIds);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const { matrix, isPending, error } = useComparisonMatrix(productIds);
  const [open, setOpen] = useState(false);

  if (productIds.length === 0) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {productIds.map((id) => {
              const product = matrix?.products.find((p) => p.id === id);
              return (
                <div key={id} className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {product ? (
                    <Image src={product.image} alt={product.name} fill sizes="44px" className="object-cover" />
                  ) : null}
                  <button
                    type="button"
                    aria-label={`${dict.compare.remove}: ${product?.name ?? id}`}
                    onClick={() => remove(id)}
                    className="absolute inset-0 flex items-center justify-center bg-background/0 text-transparent transition-colors hover:bg-background/70 hover:text-foreground"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            {dict.compare.clearAll}
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
            <Scale className="size-4" />
            {dict.compare.tray} ({productIds.length})
          </Button>
        </div>
      </div>

      <ComparisonDialog
        open={open}
        onOpenChange={setOpen}
        matrix={matrix}
        isPending={isPending}
        error={error}
        locale={locale}
        dict={dict}
        onRemove={remove}
      />
    </>
  );
}
