'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { getNavItems } from './nav-items';
import { cn } from '@/lib/utils/cn';

export function MegaNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getNavItems(dict);
  const pathname = usePathname();
  return (
    <nav className="hidden min-w-0 items-center gap-7 md:flex">
      {items.map((it) => {
        const href = `/${locale}/collection/${it.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={it.slug}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-sm transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
