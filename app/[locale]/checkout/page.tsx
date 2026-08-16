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

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = use(params);
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const router = useRouter();
  const { lines, subtotal, currency } = useCart();
  const { track } = useAnalytics();
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  useEffect(() => {
    track({ name: 'begin_checkout', params: { currency, value: subtotal, items: cartLinesToGa4Items(lines) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = () => {
    const orderId = `VVM-${Date.now()}`;
    // Persist a minimal order snapshot for the success page.
    sessionStorage.setItem('vivimoon-last-order', JSON.stringify({ orderId, currency, value: subtotal, lines }));
    router.push(`/${locale}/checkout/success`);
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:col-span-2">
        <h1 className="text-2xl font-bold">{dict.checkout.title}</h1>
        <div><Input placeholder={dict.checkout.fullName} {...register('fullName')} />{errors.fullName && <p className="text-xs text-red-600">{dict.checkout.errors.required}</p>}</div>
        <div><Input placeholder={dict.checkout.email} {...register('email')} />{errors.email && <p className="text-xs text-red-600">{dict.checkout.errors.invalidEmail}</p>}</div>
        <div><Input placeholder={dict.checkout.address} {...register('address')} />{errors.address && <p className="text-xs text-red-600">{dict.checkout.errors.required}</p>}</div>
        <div><Input placeholder={dict.checkout.city} {...register('city')} />{errors.city && <p className="text-xs text-red-600">{dict.checkout.errors.required}</p>}</div>
        <div><Input placeholder={dict.checkout.phone} {...register('phone')} />{errors.phone && <p className="text-xs text-red-600">{dict.checkout.errors.required}</p>}</div>
        <p className="text-sm text-muted-foreground">{dict.checkout.payNote}</p>
        <Button type="submit" className="w-full">{dict.checkout.placeOrder}</Button>
      </form>
      <OrderSummary subtotal={subtotal} currency={currency} locale={locale} dict={dict} />
    </div>
  );
}
