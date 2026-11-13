'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Gift, Play } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { PaymentOrder } from '@/lib/api/schemas/orders';
import type { LoyaltyBalance } from '@/lib/api/schemas/loyalty';
import { apiRequest } from '@/lib/api/client';
import { useCart } from '@/features/cart/use-cart';
import { useSessionStore } from '@/features/session/session-store';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { maskEmail, maskPhone } from '@/lib/orders/mask-contact';
import { shippingMethodName } from '@/lib/orders/shipping-method-name';
import { ARRIVAL_FORMAT } from '@/components/commerce/shipping-block';
import { CopyButton } from '@/components/commerce/copy-button';
import { OrderStatusTimeline } from '@/components/commerce/order-status-timeline';

/** One "Chuẩn bị cho lần đeo đầu tiên" card, already resolved to this locale by the page. */
export type FirstWearRead = { key: string; title: string; image: string; href: string } & (
  | { kind: 'video'; duration: string }
  | { kind: 'article'; minutes: number }
);

/** What checkout left in sessionStorage for this page (checkout-view.tsx `onSubmit`). */
type LastOrder = {
  orderId: string; currency: string; value: number | null;
  lines: { lineKey: string; sku: string; name: string; unitPrice: number; quantity: number }[];
  isBuyNow?: boolean;
  createAccount?: boolean;
  email?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function SuccessView({ order, etaDays, reads, locale, dict }: {
  order: PaymentOrder | null; etaDays?: number; reads: FirstWearRead[]; locale: Locale; dict: Dictionary;
}) {
  const t = dict.orderSuccess;
  const { removeLines, setVoucherCode } = useCart();
  const { track } = useAnalytics();
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('vivimoon-last-order');
    if (raw) {
      const placed = JSON.parse(raw) as LastOrder;
      // Reading sessionStorage must happen post-hydration (SSR has no sessionStorage and
      // an eager read would mismatch the server-rendered empty state), so the setState here
      // is an intentional one-time sync of external storage into render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastOrder(placed);
      // `value` comes from the placed order's server-computed total
      // (app/[locale]/checkout/page.tsx) — a purchase event without it would
      // misreport revenue, so this only fires once a real order exists.
      if (placed.value !== null) {
        track({ name: 'purchase', params: { transaction_id: placed.orderId, currency: placed.currency, value: placed.value, items: cartLinesToGa4Items(placed.lines) } });
      }
      sessionStorage.removeItem('vivimoon-last-order');
      // A buy-now order never drew from the real cart (spec §10) — clearing
      // it here would wipe items the shopper never checked out with.
      // Only the lines this order was placed with leave the cart; unticked ones stay (CONTEXT.md "Cart Line").
      if (!placed.isBuyNow) {
        removeLines(placed.lines.map((l) => l.lineKey));
        setVoucherCode(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The snapshot only describes this order if it is the one in the URL.
  const snapshot = lastOrder && order && lastOrder.orderId === order.code ? lastOrder : null;
  const code = order?.code ?? lastOrder?.orderId;
  const price = (n: number) => formatPrice(n, order?.totals.currency ?? 'VND', locale);

  return (
    <div className="flex w-full flex-col">
      <section className="flex flex-col items-center gap-4 px-4 pt-10 pb-8 text-center md:gap-5 md:px-10 md:pt-16 md:pb-12">
        <span className="flex size-14 items-center justify-center rounded-full bg-foreground text-background md:size-[72px]">
          <Check aria-hidden className="size-7 md:size-9" strokeWidth={1.5} />
        </span>
        <h1 className="font-heading text-[32px] leading-tight md:text-5xl">{t.title}</h1>
        {code ? (
          <p className="flex flex-wrap items-center justify-center gap-x-2 text-base md:text-lg">
            <span className="whitespace-nowrap text-muted-foreground">{t.orderCode}</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">#{code}</span>
              <CopyButton value={code} label={t.copyCode} copiedLabel={t.copied} />
            </span>
          </p>
        ) : null}
        {order ? <p className="max-w-[640px] text-muted-foreground">{confirmationLine(order, snapshot?.email, dict)}</p> : null}
        {order ? (
          // Scrolls inside itself on a phone, as on the wireframe; the page never does.
          <div className="-mx-4 w-[calc(100%+2rem)] max-w-[880px] overflow-x-auto px-4 md:mx-0 md:w-full md:px-0">
            <OrderStatusTimeline status={order.status} payment={order.payment} dict={dict} className="min-w-[560px]" />
          </div>
        ) : null}
        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
          <Link
            href={code ? `/${locale}/orders/track?code=${encodeURIComponent(code)}` : `/${locale}/orders/track`}
            className={cn(buttonVariants({ size: 'xl' }), 'rounded-none px-6 max-md:px-2 max-md:text-sm')}
          >
            {t.track}
          </Link>
          <Link href={`/${locale}`} className={cn(buttonVariants({ variant: 'outline', size: 'xl' }), 'rounded-none border-foreground px-6 max-md:px-2 max-md:text-sm')}>
            {t.continue}
          </Link>
        </div>
      </section>

      {order ? (
        <div className="flex flex-col gap-4 px-4 pb-10 md:px-10 md:pb-20 lg:grid lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start lg:gap-10">
          <PointsBlock order={order} createAccount={snapshot?.createAccount ?? false} locale={locale} dict={dict} />
          <OrderInfo order={order} etaDays={etaDays} price={price} dict={dict} />
        </div>
      ) : null}

      {reads.length > 0 ? <FirstWearReads reads={reads} dict={dict} /> : null}
    </div>
  );
}

/** "Xác nhận đơn đã được gửi qua Zalo 0912 *** 678. Dùng mã đơn để tra cứu bất cứ lúc nào." */
function confirmationLine(order: PaymentOrder, email: string | undefined, dict: Dictionary): string {
  const t = dict.orderSuccess;
  const channel = order.notificationChannel;
  if (!channel) return t.lookupHint;
  // The order keeps no email for anyone holding its code (ADR-0022); only this browser's checkout snapshot has it.
  const contact = channel === 'email' ? email && maskEmail(email) : maskPhone(order.address.phone);
  const name = dict.checkout.contact.channels[channel];
  const sent = contact ? t.sentVia.replace('{channel}', name).replace('{contact}', contact) : t.sentViaChannel.replace('{channel}', name);
  return `${sent} ${t.lookupHint}`;
}

/**
 * The dark points panel. A guest's points are Held Points against their phone (ADR-0024),
 * with the ways into the existing sign-up; a member sees what they earned and their new total.
 */
function PointsBlock({ order, createAccount, locale, dict }: {
  order: PaymentOrder; createAccount: boolean; locale: Locale; dict: Dictionary;
}) {
  const t = dict.orderSuccess;
  const status = useSessionStore((s) => s.status);
  const [balance, setBalance] = useState<number | null>(null);
  const points = order.totals.pointsToEarn ?? 0;

  useEffect(() => {
    if (status !== 'authenticated') return;
    // Placement already credited this order's points (ADR-0024), so the balance is the new total.
    apiRequest<LoyaltyBalance>('/api/loyalty').then((result) => {
      if (result.ok) setBalance(result.data.balance);
    });
  }, [status]);

  // Nothing earned, or the session not known yet: no panel rather than the wrong one.
  if (points === 0 || status === 'unknown') return null;

  const heading = (text: string) => (
    <h2 className="flex items-center gap-2.5 font-heading text-2xl md:text-[32px] md:leading-10">
      <Gift aria-hidden className="size-6 shrink-0" strokeWidth={1.5} />{text}
    </h2>
  );
  const panel = 'order-2 flex flex-col gap-5 bg-foreground p-5 text-background md:p-8 lg:order-none';

  if (status === 'authenticated') {
    return (
      <section data-testid="points-member" className={panel}>
        {heading(balance === null
          ? t.member.earned.replace('{points}', String(points))
          : t.member.total.replace('{points}', String(points)).replace('{total}', String(balance)))}
        <Link href={`/${locale}/account/loyalty`} className="self-start text-sm underline underline-offset-4">{t.member.link}</Link>
      </section>
    );
  }

  // Every button lands on the sign-up page, which verifies the phone that claims the points (ADR-0021).
  const signUp = `/${locale}/sign-up`;
  const buttons = [
    { label: t.guest.zalo, highlighted: false },
    { label: t.guest.google, highlighted: false },
    // Ticked "Tạo tài khoản" at checkout: the phone path is the one they asked for.
    { label: t.guest.otp, highlighted: createAccount },
  ];
  return (
    <section data-testid="points-guest" className={panel}>
      {heading(t.guest.title.replace('{points}', String(points)))}
      <p className="max-w-[560px] text-background/80">{t.guest.body.replace('{phone}', maskPhone(order.address.phone))}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {buttons.map((b) => (
          <Link
            key={b.label} href={signUp} data-highlighted={b.highlighted || undefined}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'xl' }),
              'rounded-none border-background bg-background px-5 text-foreground hover:bg-background/90',
              createAccount && !b.highlighted && 'bg-transparent text-background hover:bg-background/10 hover:text-background',
            )}
          >
            {b.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function OrderInfo({ order, etaDays, price, dict }: {
  order: PaymentOrder; etaDays?: number; price: (n: number) => string; dict: Dictionary;
}) {
  const t = dict.orderSuccess;
  const { address, payment } = order;
  const shipping = order.shippingMethod
    ? [
        shippingMethodName(order.shippingMethod, dict),
        etaDays ? t.info.eta.replace('{date}', ARRIVAL_FORMAT.format(new Date(Date.parse(order.placedAt) + etaDays * DAY_MS))) : null,
      ].filter(Boolean).join(' · ')
    : '—';
  // COD is settled at the door, so it has no status to report.
  const paid = payment.method === 'cod' ? t.methods.cod : `${t.methods[payment.method]} · ${t.paymentStatus[payment.status]}`;
  const rows: [string, string, boolean?][] = [
    [t.info.recipient, address.recipient],
    [t.info.address, [address.ward, address.district, address.province].join(', ')],
    [t.info.shipping, shipping],
    [t.info.payment, paid],
    ...(order.gifts?.length ? [[t.info.gifts, order.gifts.map((g) => g.name).join(', ')] as [string, string]] : []),
    [t.info.total, price(order.totals.total), true],
  ];

  return (
    <section aria-labelledby="order-info" className="order-1 flex flex-col gap-1 bg-secondary p-5 md:p-8 lg:order-none">
      <h2 id="order-info" className="pb-2 font-heading text-2xl md:text-[28px] md:leading-9">{t.info.title}</h2>
      <dl className="flex flex-col max-lg:divide-y lg:gap-3.5">
        {rows.map(([label, value, strong]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 lg:py-0">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className={cn('text-right', strong ? 'font-semibold' : 'font-medium')}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FirstWearReads({ reads, dict }: { reads: FirstWearRead[]; dict: Dictionary }) {
  const t = dict.orderSuccess.reads;
  return (
    <section aria-labelledby="first-wear" className="flex flex-col gap-5 border-t bg-background px-4 py-10 md:gap-10 md:border-t-0 md:bg-secondary md:px-10 md:py-20">
      <div className="flex flex-col gap-1 md:gap-2">
        <h2 id="first-wear" className="font-heading text-2xl md:text-[40px] md:leading-[48px]">{t.title}</h2>
        <p className="text-sm text-muted-foreground md:text-base">{t.subtitle}</p>
      </div>
      <ul className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {reads.map((r) => {
          const external = r.kind === 'video';
          return (
            <li key={r.key} className="w-[140px] shrink-0 snap-start md:w-auto">
              <Link
                href={r.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex flex-col gap-1.5 md:gap-3"
              >
                <span className="relative block aspect-[322/200] overflow-hidden bg-muted">
                  <Image src={r.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 140px, 25vw" />
                  {external ? (
                    <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background md:size-12">
                      <Play aria-hidden className="size-4 md:size-5" strokeWidth={1.5} />
                    </span>
                  ) : null}
                </span>
                <span className="text-[13px] font-medium leading-5 md:text-lg md:leading-6">{r.title}</span>
                <span className="text-xs text-muted-foreground md:text-sm">
                  {r.kind === 'video' ? t.video.replace('{duration}', r.duration) : t.article.replace('{minutes}', String(r.minutes))}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
