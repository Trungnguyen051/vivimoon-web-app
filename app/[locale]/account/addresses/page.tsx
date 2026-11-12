import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import type { ApiResult } from '@/lib/api/client';
import type { SavedAddress } from '@/lib/api/schemas/account';
import { AddressesManager } from './addresses-manager';

/**
 * Goes through the same-origin route handler rather than importing the
 * account resource directly — see app/[locale]/account/page.tsx for why.
 */
async function fetchAddresses(locale: string): Promise<SavedAddress[]> {
  const response = await fetchViaSelf('/api/account/addresses');
  const result = (await response.json()) as ApiResult<SavedAddress[]>;
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/addresses`)}`);
  return result.data;
}

export default async function AddressesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/addresses`)}`);

  const addresses = await fetchAddresses(locale);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold uppercase tracking-wide">{dict.addresses.title}</h1>
      <AddressesManager initialAddresses={addresses} dict={dict.addresses} />
    </div>
  );
}
