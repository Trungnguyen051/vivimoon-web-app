'use client';
import { Fragment, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

/**
 * A compact `EN / VI` toggle rather than a bordered `select`. The design's action
 * cluster is three bare glyphs, and a form control sitting among them read as a
 * fourth kind of thing (#74). It stays leftmost so those three stay contiguous:
 * language is a site setting, not a shopping action.
 *
 * Links, not buttons calling `router.push`. Each locale genuinely is a different
 * URL, so this keeps middle-click, open-in-new-tab and hover preview working, and
 * the current one is marked with `aria-current` instead of relying on colour.
 *
 * Dropping the `select` loses its implicit semantics, so they are replaced rather
 * than left out: the group carries the dictionary's label (#64/#65), and each
 * target is 44px tall even though the text is small.
 *
 * The query string comes along, so a filtered collection stays filtered. Reading it
 * needs a Suspense boundary on a prerendered page; until it resolves the links carry
 * the path alone, which is what they did before.
 */
export function LocaleSwitcher(props: { currentLocale: Locale; label: string }) {
  return (
    <Suspense fallback={<LocaleLinks {...props} search="" />}>
      <LocaleLinksWithQuery {...props} />
    </Suspense>
  );
}

function LocaleLinksWithQuery(props: { currentLocale: Locale; label: string }) {
  const search = useSearchParams().toString();
  return <LocaleLinks {...props} search={search ? `?${search}` : ''} />;
}

function LocaleLinks({
  currentLocale,
  label,
  search,
}: {
  currentLocale: Locale;
  label: string;
  search: string;
}) {
  const pathname = usePathname();
  const rest = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '');

  return (
    <div role="group" aria-label={label} className="flex items-center">
      {locales.map((locale, i) => (
        <Fragment key={locale}>
          {i > 0 ? (
            <span aria-hidden className="text-xs text-muted-foreground/40">
              /
            </span>
          ) : null}
          <Link
            href={`/${locale}${rest || ''}${search}`}
            aria-current={locale === currentLocale ? 'true' : undefined}
            className={cn(
              'inline-flex min-h-11 items-center rounded-md px-1.5 text-xs font-medium uppercase transition-colors',
              locale === currentLocale
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {locale}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
