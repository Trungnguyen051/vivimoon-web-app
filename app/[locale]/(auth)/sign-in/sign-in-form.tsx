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

// Mock-mode dev token: the mock reads it as an email. Production routes refuse it.
const DEV_SOCIAL_TOKEN = 'mai@example.vn';

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

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex-1 border-t border-dashed" />
        {dict.or}
        <span className="flex-1 border-t border-dashed" />
      </div>

      <div className="flex gap-4">
        <Button
          type="button" variant="outline" size="xl" className="flex-1" aria-label={dict.continueWithGoogle}
          onClick={() => authenticate('/api/auth/google', { idToken: DEV_SOCIAL_TOKEN })}
        >
          <GoogleIcon /><span className="hidden md:inline">{dict.continueWithGoogle}</span>
        </Button>
        <Button
          type="button" size="xl" className="flex-1 bg-black text-white hover:bg-black/90" aria-label={dict.continueWithApple}
          onClick={() => authenticate('/api/auth/apple', { idToken: DEV_SOCIAL_TOKEN })}
        >
          <AppleIcon /><span className="hidden md:inline">{dict.continueWithApple}</span>
        </Button>
      </div>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.700 3.300-8Z" />
      <path fill="#34A853" d="M12 23c3 0 5.500-1 7.300-2.700l-3.500-2.700c-1 .7-2.200 1.100-3.800 1.100-2.900 0-5.400-2-6.300-4.600H2.100v2.800A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.700 14.100a6.600 6.600 0 0 1 0-4.200V7.100H2.100a11 11 0 0 0 0 9.800l3.600-2.800Z" />
      <path fill="#EA4335" d="M12 5.400c1.600 0 3.100.6 4.200 1.700l3.100-3.100A11 11 0 0 0 2.100 7.100l3.600 2.800C6.600 7.400 9.100 5.400 12 5.400Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M16.400 12.800c0-2.400 2-3.500 2.100-3.600-1.200-1.700-3-1.900-3.600-2-1.500-.2-3 .9-3.800.9s-2-.9-3.300-.9c-1.700 0-3.300 1-4.200 2.500-1.800 3.100-.5 7.700 1.300 10.200.9 1.200 1.900 2.600 3.200 2.500 1.300-.1 1.800-.8 3.300-.8s2 .8 3.300.8c1.400 0 2.200-1.200 3.100-2.500a11 11 0 0 0 1.400-2.900c0 0-2.800-1.100-2.800-4.200ZM13.900 5.500c.7-.9 1.200-2 1-3.200-1 0-2.300.7-3 1.600-.7.800-1.200 2-1.100 3.100 1.100.1 2.300-.6 3.100-1.500Z" />
    </svg>
  );
}
