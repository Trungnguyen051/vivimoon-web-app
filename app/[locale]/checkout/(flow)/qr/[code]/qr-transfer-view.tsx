'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Download, Info, MessageSquare, QrCode } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { PaymentAction, PaymentOrder } from '@/lib/api/schemas/orders';
import { apiRequest } from '@/lib/api/client';
import { QR_HOLD_MINUTES, qrExpiresAt } from '@/lib/orders/qr-hold';
import { BANK_TRANSFER, formatAccountNumber } from '@/lib/payments/bank-transfer';
import { formatPrice } from '@/lib/utils/format';
import { CopyButton } from '@/components/commerce/copy-button';
import { Button } from '@/components/ui/button';

/** An order line as the summary shows it; titles and images are looked up by the server page. */
export type QrLine = { lineKey: string; title: string; image?: string; summary: string | null; lineTotal: number };

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * "Quét mã để thanh toán" (Figma 59:2 / 206:2158). The countdown runs from the order's
 * own times, so a reload resumes it; `now` is the server's clock for the first render.
 */
export function QrTransferView({
  order: initial, lines, now: serverNow, locale, dict,
}: { order: PaymentOrder; lines: QrLine[]; now: number; locale: Locale; dict: Dictionary }) {
  const t = dict.qrPayment;
  const router = useRouter();
  const [order, setOrder] = useState(initial);
  const [now, setNow] = useState(serverNow);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const remaining = qrExpiresAt(order) - now;
  const expired = order.payment.status === 'expired' || remaining <= 0;

  useEffect(() => {
    if (expired) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expired]);

  const act = async (action: PaymentAction) => {
    setBusy(true);
    setError(false);
    const result = await apiRequest<PaymentOrder>('/api/orders/payment', { method: 'POST', body: { code: order.code, action } });
    if (!result.ok) {
      setError(true);
      setBusy(false);
      return;
    }
    if (action === 'renew') {
      setOrder(result.data);
      setNow(Date.now());
      setBusy(false);
      return;
    }
    router.push(`/${locale}/checkout/success`);
  };

  // shortcut: the mock's `qrCode` is not a VietQR payload, so this draws a placeholder mark
  // and saves that; render the gateway's real QR image here once one is wired.
  const saveQr = () => {
    if (!qrRef.current) return;
    const blob = new Blob([new XMLSerializer().serializeToString(qrRef.current)], { type: 'image/svg+xml' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${order.code}.svg` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const { currency, total } = order.totals;
  const price = (n: number) => formatPrice(n, currency, locale);
  const details = [
    { label: t.bank, shown: BANK_TRANSFER.bank },
    { label: t.accountNumber, shown: formatAccountNumber(BANK_TRANSFER.accountNumber), copy: BANK_TRANSFER.accountNumber },
    { label: t.accountHolder, shown: BANK_TRANSFER.accountHolder },
    { label: t.amount, shown: price(total), copy: String(total) },
    { label: t.reference, shown: order.code, copy: order.code },
  ];
  const { address } = order;

  return (
    <div className="mx-auto grid max-w-[1280px] gap-4 px-4 pt-4 pb-6 md:gap-6 md:px-10 md:pt-10 md:pb-20 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-10">
      <section aria-labelledby="qr-title" className="flex min-w-0 flex-col items-center gap-5 bg-background px-5 py-8 text-center md:gap-6 md:px-10 md:py-12">
        <div className="flex flex-col gap-3">
          <h1 id="qr-title" className="font-heading text-[28px] leading-tight md:text-[40px]">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {expired ? (
          <div role="alert" className="flex w-full flex-col items-center gap-2 border bg-muted/60 px-5 py-8">
            <Clock aria-hidden className="size-8 text-muted-foreground" strokeWidth={1.5} />
            <p className="font-heading text-2xl">{t.expiredTitle}</p>
            <p className="max-w-md text-sm text-muted-foreground">{t.expiredBody}</p>
          </div>
        ) : (
          <>
            <p className="flex items-center gap-2 bg-muted px-4 py-2 text-sm">
              <Clock aria-hidden className="size-4" strokeWidth={1.5} />
              {t.expiresIn}
              <time role="timer" aria-live="off" className="text-base font-semibold tabular-nums">{mmss(remaining)}</time>
            </p>
            <figure className="flex flex-col items-center gap-3 border p-4 pb-3">
              <svg
                ref={qrRef} role="img" aria-label={t.qrLabel.replace('{code}', order.code)} data-qr={order.payment.intent?.qrCode}
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="size-52 bg-muted text-foreground md:size-60"
              >
                <rect width="240" height="240" fill="#f3f3f3" />
                <QrCode x="60" y="44" width="120" height="120" strokeWidth={1} color="currentColor" />
                <text x="120" y="196" textAnchor="middle" fontSize="16" fontFamily="sans-serif" fill="#737373">VietQR</text>
              </svg>
              <button type="button" onClick={saveQr} className="flex items-center gap-1.5 text-sm underline underline-offset-4">
                <Download aria-hidden className="size-4" strokeWidth={1.5} />{t.saveQr}
              </button>
            </figure>
            <dl className="flex w-full flex-col divide-y border px-4 text-left text-sm md:px-6 md:text-base">
              {details.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-3 py-3.5">
                  <dt className="text-muted-foreground">{d.label}</dt>
                  <dd className="flex items-center gap-2 text-right font-medium">
                    <span>{d.shown}</span>
                    {d.copy ? (
                      <CopyButton
                        value={d.copy}
                        label={t.copy.replace('{label}', d.label)}
                        copiedLabel={t.copied.replace('{label}', d.label)}
                      />
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="flex w-full items-start gap-3 bg-muted/60 p-4 text-left text-sm text-muted-foreground">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
              {t.note.replace('{n}', String(QR_HOLD_MINUTES))}
            </p>
          </>
        )}

        {error ? <p role="alert" className="text-sm font-medium text-destructive">{t.failed}</p> : null}
        <div className="grid w-full grid-cols-2 gap-3 md:gap-4">
          <Button type="button" variant="outline" size="xl" disabled={busy} onClick={() => act('cod')} className="rounded-none px-2 max-md:text-sm">
            {t.switchToCod}
          </Button>
          {expired ? (
            <Button type="button" size="xl" disabled={busy} onClick={() => act('renew')} className="rounded-none px-2 max-md:text-sm">{t.newQr}</Button>
          ) : (
            <Button type="button" size="xl" disabled={busy} onClick={() => act('confirm')} className="rounded-none px-2 max-md:text-sm">{t.paid}</Button>
          )}
        </div>
      </section>

      <aside aria-labelledby="qr-order" className="flex flex-col gap-5 self-start bg-background p-5 md:p-8">
        <div className="flex flex-col gap-2">
          <h2 id="qr-order" className="font-heading text-2xl md:text-[28px]">{t.order.replace('{code}', order.code)}</h2>
          <p className="text-sm text-muted-foreground">{expired ? t.expired : t.awaiting}</p>
        </div>
        <ul className="flex flex-col max-lg:divide-y lg:gap-4">
          {lines.map((l) => (
            <li key={l.lineKey} className="flex items-center gap-3 py-3 first:pt-0 lg:py-0">
              <span className="relative size-12 shrink-0 overflow-hidden bg-muted">
                {l.image ? <Image src={l.image} alt="" fill className="object-cover" sizes="48px" /> : null}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium">{l.title}</p>
                {l.summary ? <p className="text-xs text-muted-foreground">{l.summary}</p> : null}
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums lg:hidden">{price(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between gap-4 border-t pt-5">
          <span className="font-medium lg:font-normal lg:text-muted-foreground">{t.total}</span>
          <span className="text-2xl font-semibold tabular-nums">{price(total)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t.deliverTo.replace('{address}', [address.recipient, address.phone, `${address.district}, ${address.province}`].join(' · '))}
        </p>
        <Link href={`/${locale}/support`} className="flex items-center gap-2 self-center text-sm underline underline-offset-4 lg:self-start">
          <MessageSquare aria-hidden className="size-4" strokeWidth={1.5} />{t.help}
        </Link>
      </aside>
    </div>
  );
}
