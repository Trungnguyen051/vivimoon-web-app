import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { SignUpForm } from './sign-up-form';

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  // useSearchParams() in SignUpForm needs a Suspense boundary for static prerendering.
  return (
    <Suspense>
      <SignUpForm locale={locale} dict={dict.auth} />
    </Suspense>
  );
}
