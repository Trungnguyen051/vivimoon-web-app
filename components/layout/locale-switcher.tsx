'use client';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const switchTo = (locale: Locale) => {
    const rest = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '');
    router.push(`/${locale}${rest || ''}`);
  };
  return (
    <select
      aria-label="Language"
      value={currentLocale}
      onChange={(e) => switchTo(e.target.value as Locale)}
      className="rounded border bg-transparent px-2 py-1 text-sm"
    >
      {locales.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>
  );
}
