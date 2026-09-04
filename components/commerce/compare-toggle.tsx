'use client';
import { Scale } from 'lucide-react';
import { useCompareStore, COMPARE_CAP } from '@/features/compare/compare-store';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * Two visual forms, one store-backed toggle: `icon` is the small circular
 * overlay used on `ProductCard` (matches the badge corner treatment), `button`
 * is a labeled outline button matching `FavoriteButton`'s PDP styling.
 */
export function CompareToggle({
  productId, dict, variant = 'icon', className,
}: {
  productId: string;
  dict: Dictionary;
  variant?: 'icon' | 'button';
  className?: string;
}) {
  const isSelected = useCompareStore((s) => s.productIds.includes(productId));
  const isFull = useCompareStore((s) => s.productIds.length >= COMPARE_CAP);
  const add = useCompareStore((s) => s.add);
  const remove = useCompareStore((s) => s.remove);
  const disabled = isFull && !isSelected;
  const label = isSelected ? dict.compare.remove : disabled ? dict.compare.full : dict.compare.add;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) remove(productId);
    else if (!disabled) add(productId);
  }

  if (variant === 'button') {
    return (
      <Button type="button" variant="outline" disabled={disabled} onClick={handleClick} aria-pressed={isSelected} className={cn('gap-2', className)}>
        <Scale className={cn('size-4', isSelected && 'text-primary')} />
        {label}
      </Button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-full border bg-background/90 backdrop-blur-sm transition-colors',
        isSelected ? 'border-primary text-primary' : 'border-border text-foreground hover:bg-muted',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-background/90',
        className,
      )}
    >
      <Scale className="size-4" />
    </button>
  );
}
