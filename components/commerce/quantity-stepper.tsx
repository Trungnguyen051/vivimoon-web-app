import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Shared quantity control with 44px touch targets. Emits the raw next value;
 * the parent decides clamping (PDP clamps at 1) or removal (cart removes at 0).
 */
export function QuantityStepper({
  value, onChange, decreaseLabel, increaseLabel, className,
}: {
  value: number;
  onChange: (next: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
  className?: string;
}) {
  const btn =
    'flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  return (
    <div className={cn('inline-flex items-center rounded-md border', className)}>
      <button type="button" aria-label={decreaseLabel} onClick={() => onChange(value - 1)} className={btn}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label={increaseLabel} onClick={() => onChange(value + 1)} className={btn}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
