import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import type { User } from '@/lib/api/schemas/auth';
import { AccountForm } from './account-form';

/**
 * Goes through the same-origin route handler rather than importing the
 * account resource directly. Next.js compiles Route Handlers and Server
 * Component pages into separate module instances, so the mock's in-memory
 * store as mutated by PATCH /api/account is invisible to a direct resource
 * call made from here — this round-trip is what keeps a reload showing the
 * value that was actually saved.
 */
async function fetchAccount(locale: string): Promise<User> {
  const response = await fetchViaSelf('/api/account');
  const result = (await response.json()) as ApiResult<User>;
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account`)}`);
  return result.data;
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  // The real check. Middleware only tested that a cookie existed; this
  // verifies the signature and is what actually protects the page.
  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account`)}`);

  const user = await fetchAccount(locale);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.account.title}</h1>
      <div className="flex flex-wrap gap-4">
        <Link href={`/${locale}/account/orders`} className="text-sm text-muted-foreground underline underline-offset-4">
          {dict.account.viewOrders}
        </Link>
        <Link href={`/${locale}/account/addresses`} className="text-sm text-muted-foreground underline underline-offset-4">
          {dict.addresses.title}
        </Link>
        <Link href={`/${locale}/account/favorites`} className="text-sm text-muted-foreground underline underline-offset-4">
          {dict.favorites.title}
        </Link>
        <Link href={`/${locale}/account/vouchers`} className="text-sm text-muted-foreground underline underline-offset-4">
          {dict.vouchers.title}
        </Link>
        <Link href={`/${locale}/account/loyalty`} className="text-sm text-muted-foreground underline underline-offset-4">
          {dict.loyalty.title}
        </Link>
      </div>
      <h2 className="text-lg font-medium">{dict.account.infoTitle}</h2>
      <AccountForm user={user} dict={dict.account} />
    </div>
  );
}
