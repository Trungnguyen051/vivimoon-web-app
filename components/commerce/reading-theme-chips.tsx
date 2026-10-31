import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/** One chip: a Reading Theme, or the "all" chip that carries no theme at all. */
export type ReadingThemeChip = { id: string; label: string; href: string; active: boolean };

/**
 * The Knowledge index's filter row.
 *
 * Links rather than buttons, so filtering works before hydration and a narrowed index
 * can be shared or opened in a new tab — the same URL-as-state the collection filters
 * already use. The row scrolls sideways on a phone instead of wrapping into a block that
 * would push the articles off the first screen.
 */
export function ReadingThemeChips({ chips, label }: { chips: ReadingThemeChip[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {chips.map((chip) => (
          <li key={chip.id} className="shrink-0 snap-start">
            <Link
              href={chip.href}
              aria-current={chip.active ? 'true' : undefined}
              className={cn(
                'inline-flex items-center rounded-full border px-4.5 py-2 text-sm transition-colors',
                chip.active
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-muted',
              )}
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
