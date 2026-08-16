import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { getNavItems } from './nav-items';

export function MegaNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getNavItems(dict);
  return (
    <nav className="hidden min-w-0 gap-6 overflow-x-auto md:flex">
      {items.map((it) => (
        <Link key={it.slug} href={`/${locale}/collection/${it.slug}`} className="text-sm font-medium hover:text-primary">
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
