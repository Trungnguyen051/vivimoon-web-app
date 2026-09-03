import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Gift } from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { toIntlLocale } from '@/lib/utils/format';
import type { ApiResult } from '@/lib/api/client';
import type { LoyaltyBalance } from '@/lib/api/schemas/loyalty';

/**
 * Goes through the same-origin route handler rather than importing the
 * loyalty resource directly — see app/[locale]/account/page.tsx for why.
 */
async function fetchLoyalty(locale: string): Promise<LoyaltyBalance> {
  const response = await fetchViaSelf('/api/loyalty');
  const result = (await response.json()) as ApiResult<LoyaltyBalance>;
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/loyalty`)}`);
  return result.data;
}

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'medium' }).format(new Date(iso));
}

export default async function LoyaltyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/loyalty`)}`);

  const { balance, history } = await fetchLoyalty(locale);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.loyalty.title}</h1>

      <Card>
        <CardContent className="flex flex-col items-center gap-1 py-8">
          <span className="text-sm text-muted-foreground">{dict.loyalty.balance}</span>
          <span className="text-4xl font-semibold tracking-tight">{balance}</span>
        </CardContent>
      </Card>

      <h2 className="text-lg font-medium">{dict.loyalty.historyTitle}</h2>
      {history.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Gift />
            </EmptyMedia>
            <EmptyTitle>{dict.loyalty.empty}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {history.map((entry) => (
            <li key={entry.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{entry.description}</span>
                    <span className="text-sm text-muted-foreground">{formatDate(entry.createdAt, locale)}</span>
                  </div>
                  <span className="font-medium text-primary">+{entry.points}</span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Link href={`/${locale}/account`} className="text-sm text-muted-foreground underline underline-offset-4">
        {dict.account.title}
      </Link>
    </div>
  );
}
