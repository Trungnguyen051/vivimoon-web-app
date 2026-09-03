import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { readSessionUserId } from '@/lib/auth/cookie';
import { fetchViaSelf } from '@/lib/api/server-fetch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { formatPrice, toIntlLocale } from '@/lib/utils/format';
import type { ApiResult } from '@/lib/api/client';
import type { Voucher } from '@/lib/api/schemas/cart';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * Goes through the same-origin route handler rather than importing the
 * vouchers resource directly — see app/[locale]/account/page.tsx for why.
 */
async function fetchVouchers(locale: string): Promise<Voucher[]> {
  const response = await fetchViaSelf('/api/vouchers');
  const result = (await response.json()) as ApiResult<Voucher[]>;
  if (!result.ok) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/vouchers`)}`);
  return result.data;
}

function discountLabel(v: Voucher, locale: Locale, dict: Dictionary['vouchers']): string {
  if (v.type === 'percent') return `${v.value}% ${dict.off}`;
  if (v.type === 'shipping') return dict.freeShipping;
  return `${formatPrice(v.value, 'USD', locale)} ${dict.off}`;
}

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'medium' }).format(new Date(iso));
}

export default async function VouchersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const userId = await readSessionUserId();
  if (!userId) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/account/vouchers`)}`);

  const vouchers = await fetchVouchers(locale);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.vouchers.title}</h1>

      {vouchers.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Ticket />
            </EmptyMedia>
            <EmptyTitle>{dict.vouchers.empty}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {vouchers.map((v) => (
            <li key={v.code}>
              <Card>
                <CardContent className="flex flex-col gap-2 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold tracking-wide">{v.code}</span>
                    <Badge>{discountLabel(v, locale, dict.vouchers)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                  <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                    {v.minSpend !== undefined ? (
                      <span>{dict.vouchers.minSpend}: {formatPrice(v.minSpend, 'USD', locale)}</span>
                    ) : null}
                    <span>{dict.vouchers.expires}: {formatDate(v.expiresAt, locale)}</span>
                  </div>
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
