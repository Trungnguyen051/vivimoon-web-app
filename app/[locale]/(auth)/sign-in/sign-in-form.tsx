'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput, type User } from '@/lib/api/schemas/auth';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SocialAuth } from '../social-auth';

export function SignInForm({ locale, dict }: { locale: Locale; dict: Dictionary['auth'] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useSessionStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const next = searchParams.get('next');

  async function authenticate(path: string, body: unknown) {
    setServerError(null);
    const result = await apiRequest<{ user: User }>(path, { method: 'POST', body });
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    setUser(result.data.user);
    router.push(next && next.startsWith(`/${locale}`) ? next : `/${locale}/account`);
  }

  const onSubmit = (values: LoginInput) => authenticate('/api/auth/login', values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {serverError ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.identifier) || undefined}>
          <FieldLabel htmlFor="identifier">{dict.phone}</FieldLabel>
          <Input
            id="identifier" type="text" autoComplete="username" className="h-11"
            placeholder={dict.phonePlaceholder}
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            {...register('identifier')}
          />
          {errors.identifier ? (
            <FieldError id="identifier-error">{dict.errors.identifier}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor="password">{dict.password}</FieldLabel>
          <Input
            id="password" type="password" autoComplete="current-password" className="h-11"
            placeholder={dict.passwordPlaceholder}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password ? (
            <FieldError id="password-error">{dict.errors.passwordRequired}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Link href={`/${locale}/forgot-password`} className="-mt-3 self-end text-xs underline underline-offset-4">
        {dict.forgotPassword}
      </Link>

      <Button type="submit" disabled={isSubmitting} size="xl" className="w-full">
        {dict.submitSignIn}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {dict.noAccount}{' '}
        <Link href={`/${locale}/sign-up`} className="text-primary underline underline-offset-4">
          {dict.createOne}
        </Link>
      </p>

      <SocialAuth dict={dict} authenticate={authenticate} />
    </form>
  );
}
