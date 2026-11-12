import { notFound, redirect } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import { toIntlLocale } from '@/lib/utils/format';
import type { ApiResult } from '@/lib/api/client';
import type { User } from '@/lib/api/schemas/auth';
import type { Order } from '@/lib/api/schemas/orders';
import { AccountShell } from './account-shell';

/** Same-origin round-trip for mutable state, as in profile/page.tsx (ADR-0002). */
async function fetchData<T>(path: string, locale: string): Promise<T> {
  const result = (await (await fetchViaSelf(path)).json()) as ApiResult<T>;
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account`)}`);
  return result.data;
}

export default async function AccountLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const [user, orders] = await Promise.all([fetchData<User>('/api/account', locale), fetchData<Order[]>('/api/orders', locale)]);
  const date = new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'medium' }).format(new Date(user.createdAt));

  return (
    <AccountShell
      locale={locale}
      name={user.name}
      memberSince={dict.account.memberSince.replace('{date}', date)}
      orderCount={orders.length}
      dict={{
        accountInfo: dict.account.accountInfo, orders: dict.orders.title, favorites: dict.favorites.title,
        addresses: dict.addresses.title, backToAccount: dict.account.backToAccount,
      }}
    >
      {children}
    </AccountShell>
  );
}
