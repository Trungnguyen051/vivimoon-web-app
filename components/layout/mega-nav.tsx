import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function MegaNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { label: dict.collection.newArrivals, slug: 'new-arrivals' },
    { label: dict.collection.bestsellers, slug: 'bestsellers' },
    { label: dict.collection.colored, slug: 'colored-lenses' },
    { label: dict.collection.daily, slug: 'daily-lenses' },
    { label: dict.nav.sale, slug: 'sale' },
  ];
  return (
    <nav className="flex min-w-0 gap-6 overflow-x-auto">
      {items.map((it) => (
        <Link key={it.slug} href={`/${locale}/collection/${it.slug}`} className="text-sm font-medium hover:text-primary">
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
