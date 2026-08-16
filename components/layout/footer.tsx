import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="mb-3 font-semibold">{dict.footer.about}</h3>
          <p className="text-sm text-muted-foreground">{dict.footer.tagline}</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{dict.footer.policies}</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href={`/${locale}`}>{dict.footer.shipping}</Link></li>
            <li><Link href={`/${locale}`}>{dict.footer.returns}</Link></li>
            <li><Link href={`/${locale}`}>{dict.footer.privacy}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{dict.footer.customerCare}</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>hello@vivimoon.com</li>
            <li>{dict.footer.hotline}: 1900 0000</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">{dict.footer.rights}</div>
    </footer>
  );
}
