import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Separator } from '@/components/ui/separator';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const policyLinks = [
    { label: dict.footer.shipping, href: `/${locale}` },
    { label: dict.footer.returns, href: `/${locale}` },
    { label: dict.footer.privacy, href: `/${locale}` },
  ];

  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 md:gap-8">
          <div className="max-w-sm">
            <p className="text-2xl font-semibold tracking-[0.15em] uppercase">Vivimoon</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {dict.footer.tagline}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:justify-items-end">
            <nav aria-label={dict.footer.policies} className="flex flex-col gap-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {dict.footer.policies}
              </p>
              {policyLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {dict.footer.customerCare}
              </p>
              <a
                href="mailto:hello@vivimoon.com"
                className="text-sm text-foreground/80 transition-colors hover:text-foreground"
              >
                hello@vivimoon.com
              </a>
              <span className="text-sm text-muted-foreground">
                {dict.footer.hotline}: 1900 0000
              </span>
              <Link
                href={`/${locale}/orders/track`}
                className="text-sm text-foreground/80 transition-colors hover:text-foreground"
              >
                {dict.tracking.title}
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <p className="text-xs text-muted-foreground">{dict.footer.rights}</p>
      </div>
    </footer>
  );
}
