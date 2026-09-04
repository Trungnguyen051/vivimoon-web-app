import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Heart } from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ProductGrid } from '@/components/commerce/product-grid';
import type { ApiResult } from '@/lib/api/client';
import type { Product } from '@/lib/api/schemas/catalog';

/**
 * Goes through the same-origin route handler rather than importing the
 * account resource directly — see app/[locale]/account/page.tsx for why.
 */
async function fetchFavorites(locale: string): Promise<Product[]> {
  const response = await fetchViaSelf('/api/account/favorites');
  const result = (await response.json()) as ApiResult<Product[]>;
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/favorites`)}`);
  return result.data;
}

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/favorites`)}`);

  const products = await fetchFavorites(locale);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.favorites.title}</h1>

      {products.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart />
            </EmptyMedia>
            <EmptyTitle>{dict.favorites.empty}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ProductGrid products={products} locale={locale} dict={dict} listId="favorites" />
      )}

      <Link href={`/${locale}/account`} className="text-sm text-muted-foreground underline underline-offset-4">
        {dict.account.title}
      </Link>
    </div>
  );
}
