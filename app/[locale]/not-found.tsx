'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { defaultLocale, isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';

/**
 * The 404 for anything under a valid locale, rendered inside the locale layout so
 * the header and footer stay around a shopper who mistyped — they can carry on
 * browsing instead of reaching for the back button.
 *
 * A client component on purpose. `not-found` receives no `params`, so the locale
 * has to come from the path, and `usePathname` is what the Next docs point at for
 * exactly this. The dictionary is a static import, so there is nothing to fetch.
 */
export default function LocaleNotFound() {
  const pathname = usePathname();
  const segment = pathname.split('/')[1] ?? '';
  // An invalid locale never reaches here — the layout rejects it before this
  // renders, and that 404 comes from the root boundary instead.
  const locale: Locale = isLocale(segment) ? segment : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <PageContainer>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 py-20 text-center">
        <p className="text-6xl font-semibold tracking-tight">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.notFound.title}</h1>
        <p className="text-muted-foreground">{dict.notFound.body}</p>
        <Button asChild>
          <Link href={`/${locale}`}>{dict.notFound.back}</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
