'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { defaultLocale, isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PageContainer } from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * The error boundary for everything under a locale. The prop is `retry`, not
 * `reset` — `reset` is the pre-16 name, and most published examples still use it,
 * so it silently arrives `undefined` and the button does nothing (#73).
 *
 * This wraps the pages below it but *not* `[locale]/layout.tsx` itself: an error
 * file never wraps the layout in its own segment. A throw in that layout would
 * need `global-error.js`, which is a different decision and not this ticket's.
 *
 * `error.message` is the real message in development and a generic one in
 * production, so the digest is what matches a user's report to a server log.
 */
export default function LocaleError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname.split('/')[1] ?? '';
  const locale: Locale = isLocale(segment) ? segment : defaultLocale;
  const dict = getDictionary(locale);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.errorPage.title}</h1>
        <p className="text-muted-foreground">{dict.errorPage.body}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => retry()}>{dict.errorPage.retry}</Button>
          <Link href={`/${locale}`} className={cn(buttonVariants({ variant: 'outline' }))}>
            {dict.errorPage.back}
          </Link>
        </div>
        {/* The only thing that ties a shopper's "it broke" to a line in the logs. */}
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">{error.digest}</p>
        ) : null}
      </div>
    </PageContainer>
  );
}
