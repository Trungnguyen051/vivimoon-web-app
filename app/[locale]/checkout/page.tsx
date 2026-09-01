'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { toPriceLines } from '@/features/cart/use-priced-cart';
import { checkoutSchema, type CheckoutForm, type CheckoutFormInput } from '@/lib/checkout/schema';
import { paymentMethods } from '@/lib/payments/methods';
import { apiRequest } from '@/lib/api/client';
import type { Order } from '@/lib/api/schemas/orders';
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
  const { lines, currency } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Defaults to the first configured method, same posture as VariantSelector
  // pre-selecting a pack — Task 10 (order placement) reads this on submit.
  // Holds a PaymentMethodType (matches paymentIntentRequestSchema's `method`).
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods[0].type);
  // `label` carries a zod .default('home'), so the resolver's output (CheckoutForm)
  // is not what useForm manages — CheckoutFormInput (pre-default) is.
  const { register, handleSubmit, formState: { errors, isSubmitted, isSubmitting } } = useForm<
    CheckoutFormInput,
    unknown,
    CheckoutForm
  >({ resolver: zodResolver(checkoutSchema) });

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
    sessionStorage.setItem(
      'vivimoon-last-order',
      JSON.stringify({
        orderId: result.data.code,
        currency: result.data.totals.currency,
        value: result.data.totals.total,
        lines,
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

          <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} dict={dict} />

          <p className="text-sm text-muted-foreground">{dict.checkout.payNote}</p>
          <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
            {dict.checkout.placeOrder}
          </Button>
        </div>
      </form>
      <OrderSummary subtotal={null} currency={currency} locale={locale} dict={dict} />
    </div>
  );
}
