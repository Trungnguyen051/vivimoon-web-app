'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput, type User } from '@/lib/api/schemas/auth';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SignUpForm({ locale, dict }: { locale: Locale; dict: Dictionary['auth'] }) {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const result = await apiRequest<{ user: User }>('/api/auth/register', {
      method: 'POST', body: values,
    });
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    setUser(result.data.user);
    router.push(`/${locale}/account`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {serverError ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="name">{dict.name}</FieldLabel>
          <Input
            id="name" type="text" autoComplete="name" className="h-11"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
          {errors.name ? <FieldError id="name-error">{dict.errors.name}</FieldError> : null}
        </Field>

        <Field data-invalid={Boolean(errors.identifier) || undefined}>
          <FieldLabel htmlFor="identifier">{dict.identifier}</FieldLabel>
          <Input
            id="identifier" type="text" autoComplete="username" className="h-11"
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
            id="password" type="password" autoComplete="new-password" className="h-11"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password ? (
            <FieldError id="password-error">{dict.errors.password}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {dict.submitSignUp}
      </Button>

      <p className="text-sm text-muted-foreground">
        {dict.hasAccount}{' '}
        <Link href={`/${locale}/sign-in`} className="underline underline-offset-4">
          {dict.signInInstead}
        </Link>
      </p>
    </form>
  );
}
