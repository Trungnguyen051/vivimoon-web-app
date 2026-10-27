import Link from 'next/link';
import { defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * The last-resort 404: a URL with no locale prefix, or one whose prefix is not a
 * locale at all. The second case is why this cannot show the header and footer —
 * it is the locale layout itself that rejected the prefix, so there is no locale
 * to build chrome from, and rendering it is exactly what failed.
 *
 * Copy falls back to the default locale for the same reason. Everything under a
 * valid locale is answered by `[locale]/not-found.tsx`, which does keep the
 * storefront around it.
 */
export default function RootNotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <p className="text-6xl font-semibold tracking-tight">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{dict.notFound.title}</h1>
      <p className="max-w-md text-muted-foreground">{dict.notFound.body}</p>
      <Link href={`/${defaultLocale}`} className={cn(buttonVariants())}>
        {dict.notFound.back}
      </Link>
    </main>
  );
}
