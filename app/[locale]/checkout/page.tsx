'use client';
import { use, useEffect } from 'react';
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
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { cartLinesToGa4Items } from '@/lib/analytics/events';

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
  const { lines, subtotal, currency } = useCart();
  const { track } = useAnalytics();
  const { register, handleSubmit, formState: { errors, isSubmitted } } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  const fields = [
    { name: 'fullName' as const, label: dict.checkout.fullName, message: dict.checkout.errors.required, autoComplete: 'name', type: 'text' },
    { name: 'email' as const, label: dict.checkout.email, message: dict.checkout.errors.invalidEmail, autoComplete: 'email', type: 'email' },
    { name: 'address' as const, label: dict.checkout.address, message: dict.checkout.errors.required, autoComplete: 'street-address', type: 'text' },
    { name: 'city' as const, label: dict.checkout.city, message: dict.checkout.errors.required, autoComplete: 'address-level2', type: 'text' },
    { name: 'phone' as const, label: dict.checkout.phone, message: dict.checkout.errors.required, autoComplete: 'tel', type: 'tel' },
  ];
  const erroredFields = fields.filter((f) => errors[f.name]);

  useEffect(() => {
    track({ name: 'begin_checkout', params: { currency, value: subtotal, items: cartLinesToGa4Items(lines) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = () => {
    const orderId = generateOrderId();
    // Persist a minimal order snapshot for the success page.
    sessionStorage.setItem('vivimoon-last-order', JSON.stringify({ orderId, currency, value: subtotal, lines }));
    router.push(`/${locale}/checkout/success`);
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 md:col-span-2">
        <h1 className="text-2xl font-bold">{dict.checkout.title}</h1>

        {isSubmitted && erroredFields.length > 0 ? (
          <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <p className="font-medium text-destructive">{dict.checkout.errors.summary}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {erroredFields.map((f) => (
                <li key={f.name}>
                  <a href={`#${f.name}`} className="text-destructive underline">{f.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {fields.map((f) => {
          const hasError = Boolean(errors[f.name]);
          return (
            <div key={f.name} className="space-y-1.5">
              <label htmlFor={f.name} className="text-sm font-medium">{f.label}</label>
              <Input
                id={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${f.name}-error` : undefined}
                className="h-11"
                {...register(f.name)}
              />
              {hasError ? <p id={`${f.name}-error`} className="text-xs text-destructive">{f.message}</p> : null}
            </div>
          );
        })}

        <p className="text-sm text-muted-foreground">{dict.checkout.payNote}</p>
        <Button type="submit" className="h-11 w-full text-base">{dict.checkout.placeOrder}</Button>
      </form>
      <OrderSummary subtotal={subtotal} currency={currency} locale={locale} dict={dict} />
    </div>
  );
}
