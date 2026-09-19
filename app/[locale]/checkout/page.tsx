'use client';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { useBuyNow } from '@/features/cart/use-buy-now';
import { useCartStore } from '@/features/cart/cart-store';
import { toPriceLines, usePricedCart } from '@/features/cart/use-priced-cart';
import { useSessionStore } from '@/features/session/session-store';
import { checkoutSchema, type CheckoutForm, type CheckoutFormInput } from '@/lib/checkout/schema';
import { paymentMethods } from '@/lib/payments/methods';
import { apiRequest } from '@/lib/api/client';
import type { Order } from '@/lib/api/schemas/orders';
import { isPhone, type User } from '@/lib/api/schemas/auth';
import type { SavedAddress } from '@/lib/api/schemas/account';
import { OrderSummary } from '@/components/commerce/order-summary';
import { PaymentMethodPicker } from '@/components/commerce/payment-method-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const router = useRouter();
  const { lines: cartLines, hydrated } = useCart();
  const { clearBuyNowLine } = useBuyNow();
  // Buy Now (spec §10): snapshot whatever buyNowLine was set on mount, then
  // clear it immediately — so a *later* visit to this page (real checkout,
  // or a reload) never picks up a stale line from an abandoned buy-now flow.
  // Lazy initializer runs once; it must not mutate the store, so the clear
  // happens in an effect instead.
  const [buyNowLine] = useState(() => useCartStore.getState().buyNowLine);
  useEffect(() => {
    clearBuyNowLine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isBuyNow = buyNowLine !== null;
  // Memoized: an inline `[buyNowLine]` literal would be a new array every
  // render, and `lines` is a dependency of usePricedCart's price-fetch
  // effect below — an unrelated re-render (e.g. the preference fetch
  // resolving) would otherwise abort and needlessly re-debounce the
  // in-flight price request.
  const lines = useMemo(() => (isBuyNow ? [buyNowLine] : cartLines), [isBuyNow, buyNowLine, cartLines]);
  const currency = lines[0]?.currency ?? 'USD';
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Defaults to the first configured method, same posture as VariantSelector
  // pre-selecting a pack — Task 10 (order placement) reads this on submit.
  // Holds a PaymentMethodType (matches paymentIntentRequestSchema's `method`).
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods[0].type);
  // A logged-in shopper's own choice always wins over their account's
  // preference (M5.3, issue #20) — this ref, set only by the picker's
  // onChange, guards the effect below from clobbering a selection they
  // already made before the account fetch resolves.
  const paymentMethodTouched = useRef(false);
  const sessionStatus = useSessionStore((s) => s.status);
  const [preferenceFetchDone, setPreferenceFetchDone] = useState(false);
  // True only for the brief window between a shopper's session resolving as
  // authenticated and their saved preference coming back — placing an order
  // in that window would silently submit the fallback method instead of the
  // one they actually meant (issue #20 code review). Held on this, not on
  // `sessionStatus === 'unknown'`, which is the pre-existing, app-wide
  // session-hydration window every gated page already accepts.
  const preferenceLoading = sessionStatus === 'authenticated' && !preferenceFetchDone;
  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    let cancelled = false;
    apiRequest<User>('/api/account').then((result) => {
      if (cancelled) return;
      if (!paymentMethodTouched.current && result.ok && result.data.preferredPaymentMethod) {
        setPaymentMethod(result.data.preferredPaymentMethod);
      }
      setPreferenceFetchDone(true);
    });
    return () => { cancelled = true; };
  }, [sessionStatus]);
  // `label` carries a zod .default('home'), so the resolver's output (CheckoutForm)
  // is not what useForm manages — CheckoutFormInput (pre-default) is.
  const { register, control, getValues, setValue, handleSubmit, formState: { errors, isSubmitted, isSubmitting } } = useForm<
    CheckoutFormInput,
    unknown,
    CheckoutForm
  >({ resolver: zodResolver(checkoutSchema) });

  // Logged-in checkout personalization (M5.5, issue #22) — prefills the
  // form from the account's default saved Address, same session-gated
  // fetch-on-mount posture as the preferred-payment effect above. Only
  // fields still blank are filled: a shopper who starts typing before this
  // resolves keeps what they typed rather than having it clobbered, and a
  // signed-out shopper or one with no saved Address never fetches/changes
  // anything — the form stays exactly today's blank, editable one. This
  // never writes back to the saved Address (story 15) — it's a read-only
  // prefill of otherwise-uncontrolled `register`ed inputs.
  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    let cancelled = false;
    apiRequest<SavedAddress[]>('/api/account/addresses').then((result) => {
      if (cancelled || !result.ok) return;
      const defaultAddress = result.data.find((a) => a.isDefault);
      if (!defaultAddress) return;
      const current = getValues();
      (['recipient', 'phone', 'line1', 'ward', 'district', 'province'] as const).forEach((key) => {
        if (current[key]) return;
        // The address book's own save form only requires a non-empty phone
        // (addresses-manager.tsx), not the Vietnamese format checkout's
        // schema enforces via `isPhone` — an address saved before/without
        // that check could carry a phone this form would otherwise reject
        // on a field the shopper never touched. Leave it blank rather than
        // prefill a value that fails validation out from under them.
        if (key === 'phone' && !isPhone(defaultAddress.phone)) return;
        setValue(key, defaultAddress[key]);
      });
    });
    return () => { cancelled = true; };
  }, [sessionStatus, getValues, setValue]);

  // Live price preview (M5.4, issue #21) — reuses the cart's own pricing
  // hook and posture (debounced, first-price-included), gated on the
  // address being complete enough to quote rather than on cart hydration
  // alone, since `usePricedCart` treats `shipping: null` as "nothing to
  // price yet" the same way it already treats an empty cart.
  const watchedProvince = useWatch({ control, name: 'province' });
  const watchedDistrict = useWatch({ control, name: 'district' });
  const shippingAddress = watchedProvince && watchedDistrict
    ? { province: watchedProvince, district: watchedDistrict }
    : null;
  const { result: priced } = usePricedCart(lines, hydrated || isBuyNow, sessionStatus, shippingAddress);
  // Order placement refuses a cart with an unavailable line (ADR-0012), so
  // the button is blocked here rather than letting the shopper fill the whole
  // form and fail at submit. The cart page is where the line can be removed.
  const hasUnavailableLines = (priced?.unavailableLines?.length ?? 0) > 0;

  const fields = [
    { name: 'recipient' as const, label: dict.checkout.recipient, message: dict.checkout.errors.required, autoComplete: 'name', type: 'text' },
    { name: 'email' as const, label: dict.checkout.email, message: dict.checkout.errors.invalidEmail, autoComplete: 'email', type: 'email' },
    { name: 'phone' as const, label: dict.checkout.phone, message: dict.checkout.errors.invalidPhone, autoComplete: 'tel', type: 'tel' },
    { name: 'line1' as const, label: dict.checkout.line1, message: dict.checkout.errors.required, autoComplete: 'street-address', type: 'text' },
    { name: 'ward' as const, label: dict.checkout.ward, message: dict.checkout.errors.required, autoComplete: 'address-level3', type: 'text' },
    { name: 'district' as const, label: dict.checkout.district, message: dict.checkout.errors.required, autoComplete: 'address-level2', type: 'text' },
    { name: 'province' as const, label: dict.checkout.province, message: dict.checkout.errors.required, autoComplete: 'address-level1', type: 'text' },
  ];
  const erroredFields = fields.filter((f) => errors[f.name]);

  // `begin_checkout` carries a server-owned value; it fires in M2 Task 7/10
  // once pricing and order placement land.

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitError(null);
    const result = await apiRequest<Order>('/api/orders', {
      method: 'POST',
      body: {
        lines: toPriceLines(lines),
        address: {
          recipient: data.recipient, phone: data.phone, line1: data.line1,
          ward: data.ward, district: data.district, province: data.province, label: data.label,
        },
        email: data.email,
        paymentMethod,
      },
    });
    if (!result.ok) {
      setSubmitError(dict.checkout.errors.orderFailed);
      return;
    }
    // Snapshot for the success page's effect, which fires `purchase` (its
    // `value` is what gates that — never null once a real order exists),
    // clears the cart, and cleans this entry up. `lines` still has display
    // fields (sku/name) the order's re-priced lines don't carry.
    //
    // `isBuyNow` tells the success page NOT to clear the real cart — a
    // buy-now order was never drawn from it (spec §10).
    sessionStorage.setItem(
      'vivimoon-last-order',
      JSON.stringify({
        orderId: result.data.code,
        currency: result.data.totals.currency,
        value: result.data.totals.total,
        lines,
        isBuyNow,
      }),
    );
    router.push(`/${locale}/checkout/success`);
  };

  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-12">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="md:col-span-2">
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-semibold tracking-tight">{dict.checkout.title}</h1>

          {isSubmitted && erroredFields.length > 0 ? (
            <Alert variant="destructive" className="border-destructive/40">
              <AlertTitle>{dict.checkout.errors.summary}</AlertTitle>
              <AlertDescription>
                <ul className="flex list-disc flex-col gap-1 pl-4">
                  {erroredFields.map((f) => (
                    <li key={f.name}>
                      <a href={`#${f.name}`} className="underline underline-offset-4">{f.label}</a>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}

          {submitError ? (
            <Alert variant="destructive" className="border-destructive/40">
              <AlertTitle>{submitError}</AlertTitle>
            </Alert>
          ) : null}

          <FieldGroup>
            {fields.map((f) => {
              const hasError = Boolean(errors[f.name]);
              return (
                <Field key={f.name} data-invalid={hasError || undefined}>
                  <FieldLabel htmlFor={f.name}>{f.label}</FieldLabel>
                  <Input
                    id={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${f.name}-error` : undefined}
                    className="h-11"
                    {...register(f.name)}
                  />
                  {hasError ? <FieldError id={`${f.name}-error`}>{f.message}</FieldError> : null}
                </Field>
              );
            })}
          </FieldGroup>

          <PaymentMethodPicker
            value={paymentMethod}
            onChange={(type) => { paymentMethodTouched.current = true; setPaymentMethod(type); }}
            label={dict.checkout.paymentMethod}
          />

          <p className="text-sm text-muted-foreground">{dict.checkout.payNote}</p>
          {hasUnavailableLines ? (
            <p className="text-sm font-medium text-destructive">{dict.cart.unavailableBlocksCheckout}</p>
          ) : null}
          <Button
            type="submit"
            disabled={isSubmitting || preferenceLoading || hasUnavailableLines}
            className="h-12 w-full text-base"
          >
            {dict.checkout.placeOrder}
          </Button>
        </div>
      </form>
      <OrderSummary
        subtotal={priced?.subtotal ?? null}
        discount={priced?.discount ?? null}
        shipping={priced?.shipping ?? null}
        total={priced?.total ?? null}
        currency={currency} locale={locale} dict={dict}
        note={hasUnavailableLines ? dict.cart.unavailableNote : undefined}
      />
    </div>
  );
}
