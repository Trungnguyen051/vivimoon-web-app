import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
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
  const hdrs = await headers();
  const host = hdrs.get('host');
  const protocol = hdrs.get('x-forwarded-proto') ?? 'http';
  const cookieHeader = (await cookies()).getAll().map((c) => `${c.name}=${c.value}`).join('; ');

  const response = await fetch(`${protocol}://${host}/api/account`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
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
      <h2 className="text-lg font-medium">{dict.account.infoTitle}</h2>
      <AccountForm user={user} dict={dict.account} />
    </div>
  );
}
