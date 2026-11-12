import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import type { User } from '@/lib/api/schemas/auth';
import { AccountInfo } from '../account-info';

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
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/profile`)}`);
  return result.data;
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  // The real check. Middleware only tested that a cookie existed; this
  // verifies the signature and is what actually protects the page.
  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/profile`)}`);

  const user = await fetchAccount(locale);

  return (
    <div className="w-full max-w-2xl">
      <AccountInfo user={user} locale={locale} dict={dict.account} welcome={dict.welcome} />
    </div>
  );
}
