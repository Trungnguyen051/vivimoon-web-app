import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * The one search box this storefront has — three surfaces, one shape.
 *
 * A GET form, so searching works with JavaScript disabled: the same URL-as-state the
 * collection filters use, which is also what makes a result linkable and shareable.
 * Shared because the Support hub, the FAQ page and the Knowledge index all draw it, and
 * three copies would be three chances for one of them to lose its label, its
 * `type="search"` or its no-JS submit without anything failing to say so.
 *
 * It is not storefront search. Each caller's `action` points at the page that filters
 * its own content (ADR-0020) — this component owns the control, never the query.
 */
export function SearchForm({
  action,
  label,
  placeholder,
  defaultValue,
  size = 'default',
  className,
  children,
}: {
  /** The page that reads `?q=` — never a search endpoint, because there isn't one. */
  action: string;
  /** The accessible name. Required: the icon is decorative and the placeholder is not a label. */
  label: string;
  placeholder: string;
  defaultValue?: string;
  /** The hub's hero box is drawn taller than the two that sit above a list. */
  size?: 'default' | 'lg';
  /** Width, which is the only thing that varies by surface. */
  className?: string;
  /**
   * Hidden fields that ride along on submit. The Knowledge index carries its Reading
   * Theme and sort this way so searching narrows the view rather than resetting it;
   * the FAQ page deliberately passes none, because a query there replaces the Topic.
   */
  children?: ReactNode;
}) {
  return (
    <form action={action} className={cn('flex items-center gap-2 rounded-md border px-3', className)}>
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        aria-label={label}
        placeholder={placeholder}
        className={cn('flex-1 bg-transparent text-sm outline-none', size === 'lg' ? 'h-12' : 'h-11')}
      />
      {children}
    </form>
  );
}
