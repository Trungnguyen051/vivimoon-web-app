'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ShieldCheck, Sparkles, Tag } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { useBuyNow } from '@/features/cart/use-buy-now';
import { useCartStore } from '@/features/cart/cart-store';
import { toPriceLines, usePricedCart } from '@/features/cart/use-priced-cart';
import { useSessionStore } from '@/features/session/session-store';
import { checkoutSchema, type CheckoutForm, type CheckoutFormInput } from '@/lib/checkout/schema';
import { paymentMethods } from '@/lib/payments/methods';
import { apiRequest } from '@/lib/api/client';
import type { Order } from '@/lib/api/schemas/orders';
import type { PaymentMethodType } from '@/lib/api/schemas/payments';
import type { GiftLine } from '@/lib/api/schemas/cart';
import type { User } from '@/lib/api/schemas/auth';
import type { LoyaltyBalance } from '@/lib/api/schemas/loyalty';
import type { SavedAddress } from '@/lib/api/schemas/account';
import { formatPrice } from '@/lib/utils/format';
import { POINT_VALUE } from '@/lib/loyalty/rules';
import { cn } from '@/lib/utils/cn';
import { ShippingBlock } from '@/components/commerce/shipping-block';
import { OrderSummary } from '@/components/commerce/order-summary';
import { formatLineSummary, lineTitle } from '@/components/commerce/line-summary';
import { PaymentMethodPicker } from '@/components/commerce/payment-method-picker';
import { StepHeading } from '@/components/commerce/step-heading';
import { VoucherPicker } from '@/components/commerce/voucher-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AddressCards } from './address-cards';

const RETURNS_FAQ = 'support/faq?category=doi-tra-va-bao-hanh#faq-dieu-kien-doi-tra';
const ADDRESS_FIELDS = ['recipient', 'phone', 'line1', 'ward', 'district', 'province', 'label'] as const;
type FieldName = 'recipient' | 'phone' | 'email' | 'province' | 'district' | 'ward' | 'line1' | 'note';

/**
 * Where placing an order lands (ADR-0025). COD goes to success. E-wallet keeps its
 * redirect intent on the order, but the mock's `redirectUrl` is a placeholder host,
 * so it lands on success until a real gateway is wired.
 */
function placedOrderPath(order: Order, locale: Locale): string {
  // #205: point this at the QR transfer page, `/${locale}/checkout/qr/${order.code}`, once it exists.
  if (order.payment.method === 'qr') return `/${locale}/checkout/success`;
  return `/${locale}/checkout/success`;
}

export function CheckoutView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.checkout;
  const router = useRouter();
  // Only the ticked lines go to checkout; unticked ones stay in the cart (CONTEXT.md "Cart Line").
  const { tickedLines: cartLines, hydrated, voucherCode, setVoucherCode } = useCart();
  const { clearBuyNowLine } = useBuyNow();
  // Buy Now (spec §10): snapshot whatever buyNowLine was set on mount, then clear it
  // immediately, so a later visit never picks up a stale line. The lazy initializer
  // must not mutate the store, so the clear happens in an effect.
  const [buyNowLine] = useState(() => useCartStore.getState().buyNowLine);
  useEffect(() => {
    clearBuyNowLine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isBuyNow = buyNowLine !== null;
  // Memoized: `lines` is a dependency of usePricedCart's price-fetch effect.
  const lines = useMemo(() => (isBuyNow ? [buyNowLine] : cartLines), [isBuyNow, buyNowLine, cartLines]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Loyalty (CONTEXT.md): a member's "Dùng N điểm" toggle, and a guest's pre-ticked
  // "Tạo tài khoản" box, which only tells the success page which path to highlight (ADR-0024).
  const [usePoints, setUsePoints] = useState(false);
  const [createAccount, setCreateAccount] = useState(true);

  const sessionStatus = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);
  const isMember = sessionStatus === 'authenticated';

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(paymentMethods[0].type);
  // A shopper's own choice always wins over the account's preference (issue #20):
  // set only by the picker, it stops the effect below from clobbering it.
  const paymentMethodTouched = useRef(false);
  // "Đã chọn sẵn theo lần mua trước" shows while the preselected method stands.
  const [remembered, setRemembered] = useState(false);
  const [preferenceFetchDone, setPreferenceFetchDone] = useState(false);
  // Placing an order before the preference arrives would submit the fallback method
  // instead of the one the member meant (issue #20).
  const preferenceLoading = isMember && !preferenceFetchDone;
  const [points, setPoints] = useState<number | null>(null);
  useEffect(() => {
    if (!isMember) return;
    let cancelled = false;
    apiRequest<User>('/api/account').then((result) => {
      if (cancelled) return;
      const preferred = result.ok ? result.data.preferredPaymentMethod : undefined;
      if (!paymentMethodTouched.current && preferred && paymentMethods.some((m) => m.type === preferred)) {
        setPaymentMethod(preferred);
        setRemembered(true);
      }
      setPreferenceFetchDone(true);
    });
    apiRequest<LoyaltyBalance>('/api/loyalty').then((result) => {
      if (!cancelled && result.ok && typeof result.data.balance === 'number') setPoints(result.data.balance);
    });
    return () => { cancelled = true; };
  }, [isMember]);

  const { register, control, getValues, setValue, trigger, handleSubmit, formState: { errors, isSubmitted, isSubmitting } } = useForm<
    CheckoutFormInput,
    unknown,
    CheckoutForm
  >({ resolver: zodResolver(checkoutSchema), defaultValues: { label: 'home', notificationChannel: 'zalo' } });

  // A member's saved Addresses (Figma 58:251): the default is picked on arrival and
  // the chosen card fills the form's address fields, which are then not shown.
  // `editing` is a card being edited inline, or 'new' for "+ Thêm địa chỉ mới".
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressBusy, setAddressBusy] = useState(false);
  const fillAddress = (a: Partial<SavedAddress>) => {
    ADDRESS_FIELDS.forEach((key) => setValue(key, a[key] ?? (key === 'label' ? 'home' : ''), { shouldValidate: isSubmitted }));
  };
  const selectAddress = (a: SavedAddress) => {
    setSelectedAddressId(a.id);
    fillAddress(a);
  };
  const showAddressBook = (list: SavedAddress[], pick?: SavedAddress) => {
    setAddresses(list);
    const chosen = pick ?? list.find((a) => a.isDefault) ?? list[0];
    // No saved Address: the inline form is the only way to give one.
    if (chosen) selectAddress(chosen);
    else setEditing('new');
  };
  useEffect(() => {
    if (!isMember) return;
    let cancelled = false;
    apiRequest<SavedAddress[]>('/api/account/addresses').then((result) => {
      if (cancelled) return;
      showAddressBook(result.ok ? result.data : []);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMember]);

  async function saveAddress() {
    if (!(await trigger(['recipient', 'phone', 'line1', 'ward', 'district', 'province']))) return;
    const body = Object.fromEntries(ADDRESS_FIELDS.map((k) => [k, getValues(k) ?? 'home']));
    const isNew = editing === 'new';
    setAddressBusy(true);
    setAddressError(null);
    const result = await apiRequest<SavedAddress[]>(
      isNew ? '/api/account/addresses' : `/api/account/addresses/${editing}`,
      { method: isNew ? 'POST' : 'PATCH', body },
    );
    setAddressBusy(false);
    if (!result.ok) return setAddressError(t.address.saveFailed);
    const known = new Set(addresses?.map((a) => a.id));
    const saved = isNew ? result.data.find((a) => !known.has(a.id)) : result.data.find((a) => a.id === editing);
    setEditing(null);
    showAddressBook(result.data, saved);
  }
  function cancelAddress() {
    setEditing(null);
    setAddressError(null);
    const current = addresses?.find((a) => a.id === selectedAddressId);
    if (current) fillAddress(current);
  }

  async function signOut() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    useSessionStore.getState().clear();
    setAddresses(null);
    setSelectedAddressId(null);
    setEditing(null);
    setRemembered(false);
    fillAddress({});
  }

  // Live price preview (issue #21), gated on an address complete enough to quote.
  const watchedProvince = useWatch({ control, name: 'province' });
  const watchedDistrict = useWatch({ control, name: 'district' });
  const shippingAddress = watchedProvince && watchedDistrict
    ? { province: watchedProvince, district: watchedDistrict }
    : null;
  const { result: priced, isPending: pricePending, isError: priceFailed } = usePricedCart(lines, hydrated || isBuyNow, sessionStatus, shippingAddress, voucherCode, isMember && usePoints);
  // The server's currency, not the line snapshot (a catalogue currency change).
  const currency = priced?.currency ?? lines[0]?.currency ?? 'VND';
  const price = (n: number) => formatPrice(n, currency, locale);
  // The delivery promise is withheld while a re-quote is in flight or failed.
  // shortcut: the hook's 300ms debounce isn't reported as pending, so an address edit can show the
  // previous option for that long; upgrade by having usePricedCart flag pending when it schedules.
  const shippingQuote = !pricePending && !priceFailed && priced?.shippingMethod && priced.shippingEtaDays
    ? { method: priced.shippingMethod, etaDays: priced.shippingEtaDays, fee: priced.shipping }
    : null;
  // Placement refuses a cart with an unavailable line (ADR-0012), so the button is blocked here.
  const hasUnavailableLines = (priced?.unavailableLines?.length ?? 0) > 0;

  const labels: Record<FieldName, string> = {
    recipient: t.recipient, phone: t.phone, email: t.email, province: t.province,
    district: t.district, ward: t.ward, line1: t.line1, note: t.contact.note,
  };
  const messages: Partial<Record<FieldName, string>> = {
    phone: t.errors.invalidPhone,
    email: getValues('notificationChannel') === 'email' && !getValues('email') ? t.errors.emailForChannel : t.errors.invalidEmail,
  };
  const erroredFields = (Object.keys(labels) as FieldName[]).filter((f) => errors[f]);

  const field = (name: FieldName, opts: {
    type?: string; autoComplete?: string; placeholder?: string; hint?: string; required?: boolean; className?: string;
  } = {}) => {
    const hasError = Boolean(errors[name]);
    return (
      <Field data-invalid={hasError || undefined} className={cn('gap-2', opts.className)}>
        {/* The asterisk is drawn, so the label's text stays the field's plain name. */}
        <FieldLabel htmlFor={name} className={opts.required !== false ? "after:-ml-1.5 after:content-['*']" : undefined}>
          {labels[name]}
        </FieldLabel>
        <Input
          id={name}
          type={opts.type ?? 'text'}
          autoComplete={opts.autoComplete}
          placeholder={opts.placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className="h-12 bg-background px-4"
          {...register(name)}
        />
        {opts.hint ? <FieldDescription className="text-xs">{opts.hint}</FieldDescription> : null}
        {hasError ? <FieldError id={`${name}-error`}>{messages[name] ?? t.errors.required}</FieldError> : null}
      </Field>
    );
  };
  const addressFields = (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {field('recipient', { autoComplete: 'name' })}
        {field('phone', { type: 'tel', autoComplete: 'tel', hint: t.contact.phoneHint })}
      </div>
      {isMember ? null : field('email', { type: 'email', autoComplete: 'email', placeholder: t.contact.emailPlaceholder, required: false })}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {field('province', { autoComplete: 'address-level1' })}
        {field('district', { autoComplete: 'address-level2' })}
        {field('ward', { autoComplete: 'address-level3', className: 'max-md:col-span-2' })}
      </div>
      {field('line1', { autoComplete: 'street-address', placeholder: t.contact.line1Placeholder })}
    </>
  );

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitError(null);
    const email = data.email || user?.email;
    const note = data.note?.trim();
    const result = await apiRequest<Order>('/api/orders', {
      method: 'POST',
      body: {
        lines: toPriceLines(lines),
        address: {
          recipient: data.recipient, phone: data.phone, line1: data.line1,
          ward: data.ward, district: data.district, province: data.province, label: data.label,
        },
        ...(email ? { email } : {}),
        notificationChannel: data.notificationChannel,
        ...(note ? { note } : {}),
        paymentMethod,
        ...(voucherCode ? { voucherCode } : {}),
        ...(isMember && usePoints ? { usePoints: true } : {}),
      },
    });
    if (!result.ok) {
      setSubmitError(t.errors.orderFailed);
      return;
    }
    // Snapshot for the success page, which fires `purchase`, clears the cart (not for
    // a buy-now order, spec §10) and cleans this entry up. `lines` still has the
    // display fields the order's re-priced lines don't carry.
    sessionStorage.setItem(
      'vivimoon-last-order',
      JSON.stringify({
        orderId: result.data.code,
        currency: result.data.totals.currency,
        value: result.data.totals.total,
        lines,
        isBuyNow,
        ...(isMember ? {} : { createAccount }),
      }),
    );
    router.push(placedOrderPath(result.data, locale));
  };

  const gifts = priced?.gifts ?? [];
  const giftThreshold = priced?.spendTiers?.find((s) => s.reward === 'gift')?.threshold ?? 0;
  const giftLabel = (g: GiftLine) =>
    g.reason === 'product' ? dict.cart.giftRows.product : dict.cart.giftRows.spendTier.replace('{threshold}', price(giftThreshold));
  const appliedVoucher = priced?.appliedVouchers[0];
  // "Đơn này tích N điểm" under the total; a guest's are held against their phone (ADR-0024).
  const earnNote = priced?.pointsToEarn
    ? (isMember ? t.loyalty.earn : t.loyalty.earnHeld).replace('{points}', String(priced.pointsToEarn))
    : undefined;
  const [voucherOpen, setVoucherOpen] = useState(false);
  const showVoucherPicker = voucherOpen || Boolean(priced?.voucherError);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const section = 'flex flex-col gap-5 bg-background p-5 md:p-8';

  return (
    <div className="grid gap-4 px-4 pt-4 pb-6 md:gap-6 md:px-10 md:pt-10 md:pb-20 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_520px]">
      <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-w-0 flex-col gap-4 md:gap-6">
        <h1 className="sr-only">{t.title}</h1>

        {isSubmitted && erroredFields.length > 0 ? (
          <Alert variant="destructive" className="border-destructive/40">
            <AlertTitle>{t.errors.summary}</AlertTitle>
            <AlertDescription>
              <ul className="flex list-disc flex-col gap-1 pl-4">
                {erroredFields.map((f) => (
                  <li key={f}><a href={`#${f}`} className="underline underline-offset-4">{labels[f]}</a></li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}
        {submitError ? (
          <Alert variant="destructive" className="border-destructive/40"><AlertTitle>{submitError}</AlertTitle></Alert>
        ) : null}

        {isMember ? (
          <div className="flex items-center gap-4 bg-background px-5 py-5 md:px-6">
            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium">
              {user?.avatarUrl ? <Image src={user.avatarUrl} alt="" fill className="object-cover" sizes="48px" /> : user?.name.charAt(0)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="font-semibold">{t.member.greeting.replace('{name}', user?.name ?? '')}</p>
              <p className="text-sm text-muted-foreground">
                {[points !== null && t.member.points.replace('{points}', points.toLocaleString(locale)), selectedAddressId && t.member.prefilled]
                  .filter(Boolean).join(' · ')}
              </p>
            </div>
            <button type="button" onClick={signOut} className="shrink-0 self-start text-sm underline underline-offset-4 md:self-center">
              {t.member.notYou}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 border bg-background px-4 py-4 md:flex-row md:items-center md:px-6 md:py-5">
            <div className="flex flex-1 items-start gap-4 md:items-center">
              <Sparkles aria-hidden className="mt-0.5 size-6 shrink-0 md:mt-0" strokeWidth={1.5} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="font-medium">{t.signInPrompt.title}</p>
                <p className="text-sm text-muted-foreground">{t.signInPrompt.optional}</p>
              </div>
            </div>
            {/* Google and Zalo sign-in live on the sign-in page; each button lands there and comes back. */}
            <div className="grid grid-cols-3 gap-2 md:flex md:shrink-0">
              {[
                { label: t.signInPrompt.google, variant: 'outline' as const },
                { label: t.signInPrompt.zalo, variant: 'outline' as const },
                { label: t.signInPrompt.signIn, variant: 'default' as const },
              ].map((b) => (
                <Link
                  key={b.label}
                  href={`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/checkout`)}`}
                  className={cn(buttonVariants({ variant: b.variant, size: 'lg' }), 'h-11 rounded-none border-foreground px-4')}
                >
                  {b.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <section aria-labelledby="checkout-contact" className={section}>
          <StepHeading id="checkout-contact" step={1}>{isMember ? t.address.title : t.contact.title}</StepHeading>
          {isMember ? (
            addresses === null ? null : (
              <AddressCards
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={selectAddress}
                editing={editing}
                onEdit={(a) => { setEditing(a.id); fillAddress(a); }}
                onAdd={() => { setEditing('new'); fillAddress({}); }}
                dict={dict}
                form={(
                  <div className="flex flex-col gap-4 border border-foreground p-4 md:p-5">
                    {addressFields}
                    {addressError ? <p role="alert" className="text-sm text-destructive">{addressError}</p> : null}
                    <div className="flex gap-2">
                      <Button type="button" size="lg" disabled={addressBusy} onClick={saveAddress} className="rounded-none">{t.address.save}</Button>
                      {addresses.length > 0 ? (
                        <Button type="button" size="lg" variant="outline" disabled={addressBusy} onClick={cancelAddress} className="rounded-none">
                          {t.address.cancel}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )}
              />
            )
          ) : (
            <>
              {addressFields}
              <Field className="gap-2">
                <FieldLabel htmlFor="note">{t.contact.note}</FieldLabel>
                <Input id="note" placeholder={t.contact.notePlaceholder} className="h-12 bg-background px-4" {...register('note')} />
              </Field>
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2.5 text-sm font-medium">{t.contact.channel}</legend>
                <div className="flex flex-wrap gap-2">
                  {(['zalo', 'sms', 'email'] as const).map((c) => (
                    <label
                      key={c}
                      className="cursor-pointer border px-3.5 py-2 text-sm transition-colors has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                    >
                      <input type="radio" value={c} className="sr-only" {...register('notificationChannel')} />
                      {t.contact.channels[c]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </section>

        <ShippingBlock quote={shippingQuote} failed={priceFailed} currency={currency} locale={locale} dict={dict} step={2} className={section} />

        <section aria-labelledby="checkout-payment" className={section}>
          <StepHeading id="checkout-payment" step={3}>{t.payment.title}</StepHeading>
          <PaymentMethodPicker
            value={paymentMethod}
            remembered={remembered}
            onChange={(type) => { paymentMethodTouched.current = true; setRemembered(false); setPaymentMethod(type); }}
            dict={dict}
          />
        </section>

        {!isMember && priced?.pointsToEarn ? (
          <label className="flex cursor-pointer items-start gap-4 bg-background p-5 md:px-6">
            <input
              type="checkbox"
              checked={createAccount}
              onChange={(e) => setCreateAccount(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-foreground"
            />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">{t.loyalty.createAccount.replace('{points}', String(priced.pointsToEarn))}</span>
              <span className="text-sm text-muted-foreground">{t.loyalty.createAccountHint}</span>
            </span>
          </label>
        ) : null}
      </form>

      {/* `contents` below lg lets the place-order bar stick to the bottom of the whole page. */}
      <div className="flex flex-col max-lg:contents lg:sticky lg:top-6 lg:self-start lg:bg-background lg:pb-8">
        <OrderSummary
          className="gap-5 rounded-none bg-background py-5 ring-0 md:py-8 [--card-spacing:--spacing(5)] md:[--card-spacing:--spacing(8)] lg:pb-0"
          title={(
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-2xl md:text-[1.75rem]">{t.summary.title.replace('{count}', String(itemCount))}</h2>
              <Link href={`/${locale}/cart`} className="text-sm underline underline-offset-4">{t.summary.editCart}</Link>
            </div>
          )}
          subtotal={priced?.subtotal ?? null}
          bundleSaving={priced?.bundleSaving}
          gifts={gifts.map((g) => ({ label: giftLabel(g), name: g.name }))}
          discount={priced?.discount ?? null}
          discountLabel={appliedVoucher ? dict.cart.voucherRow.replace('{code}', appliedVoucher.code) : undefined}
          tierDiscount={priced?.tierDiscount}
          spendTiers={priced?.spendTiers}
          shipping={priced?.shipping ?? null}
          total={priced?.total ?? null}
          currency={currency} locale={locale} dict={dict}
          pointsValue={priced?.pointsValue}
          note={hasUnavailableLines ? dict.cart.unavailableNote : earnNote}
        >
          <ul className="flex flex-col divide-y max-lg:border-b lg:gap-1 lg:divide-y-0">
            {lines.map((l) => {
              const lineTotal = priced?.lines.find((p) => p.lineKey === l.lineKey)?.lineTotal;
              const summary = [formatLineSummary(l, dict), l.rx && l.quantity > 1 ? `x${l.quantity}` : null].filter(Boolean).join(' · ');
              return (
                <li key={l.lineKey} className="flex items-center gap-4 py-3 first:pt-0 lg:py-2">
                  <span className="relative size-12 shrink-0 overflow-hidden bg-muted md:size-16">
                    {l.image ? <Image src={l.image} alt="" fill className="object-cover" sizes="64px" /> : null}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="font-medium">{lineTitle(l, dict)}</p>
                    {summary ? <p className="text-xs text-muted-foreground">{summary}</p> : null}
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">{lineTotal === undefined ? '—' : price(lineTotal)}</span>
                </li>
              );
            })}
          </ul>
          {appliedVoucher || priced?.vouchers?.length || priced?.voucherError ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 bg-muted/60 px-4 py-3">
                <Tag aria-hidden className="size-5 shrink-0" strokeWidth={1.5} />
                <p className="min-w-0 flex-1">
                  {appliedVoucher
                    ? `${appliedVoucher.code} · ${voucherCode === appliedVoucher.code ? appliedVoucher.title : t.summary.bestVoucher}`
                    : t.summary.addVoucher}
                </p>
                <button
                  type="button" aria-expanded={showVoucherPicker} onClick={() => setVoucherOpen((o) => !o)}
                  className="shrink-0 underline underline-offset-4"
                >
                  {showVoucherPicker ? t.summary.closeVoucher : t.summary.changeVoucher}
                </button>
              </div>
              {showVoucherPicker ? (
                <VoucherPicker
                  vouchers={priced?.vouchers ?? []}
                  applied={appliedVoucher?.code}
                  error={priced?.voucherError}
                  onChoose={setVoucherCode}
                  currency={currency} locale={locale} dict={dict}
                />
              ) : null}
            </div>
          ) : null}
          {isMember && priced?.pointsUsable ? (
            <div className="flex items-center gap-3 border border-foreground px-4 py-3">
              <Sparkles aria-hidden className="size-5 shrink-0" strokeWidth={1.5} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p id="checkout-use-points" className="font-medium">
                  {t.loyalty.use.replace('{points}', String(usePoints && priced.pointsUsed ? priced.pointsUsed : priced.pointsUsable))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.loyalty.balance
                    .replace('{balance}', (priced.pointsBalance ?? 0).toLocaleString(locale))
                    .replace('{value}', price(POINT_VALUE))}
                </p>
              </div>
              <button
                type="button" role="switch" aria-checked={usePoints} aria-labelledby="checkout-use-points"
                onClick={() => setUsePoints((on) => !on)}
                className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full bg-input transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-checked:bg-foreground"
              >
                <span className={cn('absolute top-1 left-1 size-5 rounded-full bg-background shadow-sm transition-transform', usePoints && 'translate-x-5')} />
              </button>
            </div>
          ) : null}
        </OrderSummary>
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 bg-muted/95 px-4 py-3 backdrop-blur-sm md:-mx-10 md:px-10 lg:static lg:mx-0 lg:bg-transparent lg:px-8 lg:pt-5 lg:pb-0 lg:backdrop-blur-none">
          {hasUnavailableLines ? (
            <p className="text-sm font-medium text-destructive">{dict.cart.unavailableBlocksCheckout}</p>
          ) : null}
          <Button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting || preferenceLoading || hasUnavailableLines}
            size="xl"
            className="w-full rounded-none"
          >
            <Lock aria-hidden className="size-5" />
            {priced ? t.placeOrderTotal.replace('{total}', price(priced.total)) : t.placeOrder}
          </Button>
        </div>
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground lg:justify-start lg:px-8 lg:pt-4">
          <ShieldCheck aria-hidden className="size-4" strokeWidth={1.5} />
          {dict.returnPolicy.refundWindow} ·
          <Link href={`/${locale}/${RETURNS_FAQ}`} className="text-foreground underline underline-offset-4">{dict.returnPolicy.link}</Link>
        </p>
      </div>
    </div>
  );
}
