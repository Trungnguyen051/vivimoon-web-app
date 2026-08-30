'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isLocale, type Locale, defaultLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { useCart } from '@/features/cart/use-cart';
import { checkoutSchema, type CheckoutForm } from '@/lib/checkout/schema';
import { OrderSummary } from '@/components/commerce/order-summary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Module-scope helper: keeps the impure Date.now() call out of the component body
// so it isn't evaluated during render.
function generateOrderId(): string {
  return `VVM-${Date.now()}`;
}

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const router = useRouter();
  const { lines, currency } = useCart();
  const { register, handleSubmit, formState: { errors, isSubmitted } } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  const fields = [
    { name: 'fullName' as const, label: dict.checkout.fullName, message: dict.checkout.errors.required, autoComplete: 'name', type: 'text' },
    { name: 'email' as const, label: dict.checkout.email, message: dict.checkout.errors.invalidEmail, autoComplete: 'email', type: 'email' },
    { name: 'address' as const, label: dict.checkout.address, message: dict.checkout.errors.required, autoComplete: 'street-address', type: 'text' },
    { name: 'city' as const, label: dict.checkout.city, message: dict.checkout.errors.required, autoComplete: 'address-level2', type: 'text' },
    { name: 'phone' as const, label: dict.checkout.phone, message: dict.checkout.errors.required, autoComplete: 'tel', type: 'tel' },
  ];
  const erroredFields = fields.filter((f) => errors[f.name]);

  // `begin_checkout` carries a server-owned value; it fires in M2 Task 7/10
  // once pricing and order placement land.

  const onSubmit = () => {
    const orderId = generateOrderId();
    // Persist a minimal order snapshot for the success page.
    // Interim snapshot. M2 Task 10 replaces this with the placed order returned
    // by POST /api/orders, which is where the authoritative total comes from.
    sessionStorage.setItem('vivimoon-last-order', JSON.stringify({ orderId, currency, value: null, lines }));
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

          <p className="text-sm text-muted-foreground">{dict.checkout.payNote}</p>
          <Button type="submit" className="h-12 w-full text-base">{dict.checkout.placeOrder}</Button>
        </div>
      </form>
      <OrderSummary subtotal={null} currency={currency} locale={locale} dict={dict} />
    </div>
  );
}
