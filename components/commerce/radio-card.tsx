import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * One checkout option card (Figma 58:115 / 58:138 / 58:265): a native radio drawn as
 * the wireframe's dot, an optional icon, a title and hint, and a trailing slot. The
 * trailing slot (a fee, a "Sửa" button) sits outside the label, so pressing it never
 * also picks the card.
 */
export function RadioCard({
  name, value, checked, onChange, icon: Icon, title, hint, children, trailing, className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  icon?: LucideIcon;
  title: React.ReactNode;
  hint?: React.ReactNode;
  /** Extra lines under the title, e.g. an Address card's street. */
  children?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex gap-3 border bg-background p-4 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 md:p-5',
        // A card with extra lines reads top-down, like the Address cards; a one-liner centres.
        children ? 'items-start' : 'items-center',
        checked ? 'border-foreground' : 'hover:border-foreground/40',
        className,
      )}
    >
      <label className={cn('flex min-w-0 flex-1 cursor-pointer gap-3 md:gap-4', children ? 'items-start' : 'items-center')}>
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
        <span aria-hidden className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground">
          {checked ? <span className="size-2.5 rounded-full bg-foreground" /> : null}
        </span>
        {Icon ? <Icon aria-hidden className="size-6 shrink-0" strokeWidth={1.5} /> : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-medium">{title}</span>
          {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
          {children}
        </span>
      </label>
      {trailing}
    </div>
  );
}
