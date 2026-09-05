'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema, type RegisterInput, type User, type OtpChallenge, type OtpVerifyResult,
} from '@/lib/api/schemas/auth';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * The account is created (and the session started) the moment `onSubmit`
 * succeeds — `verify-prompt`/`verify-code` are an optional add-on afterward,
 * never a gate on it. `verifyOtp` (purpose `signup`) requires an existing
 * account to match against (lib/api/resources/auth/mock.ts), so OTP has to
 * come after registration, not before it.
 */
type Stage =
  | { name: 'form' }
  | { name: 'verify-prompt'; identifier: string }
  | { name: 'verify-code'; identifier: string; otpId: string; devCode?: string };

export function SignUpForm({ locale, dict }: { locale: Locale; dict: Dictionary['auth'] }) {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [stage, setStage] = useState<Stage>({ name: 'form' });
  const [serverError, setServerError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  // `busy` state alone doesn't block a second click that fires before the
  // first's re-render commits — this ref is updated synchronously so the
  // second call sees it immediately (same guard as quiz-flow.tsx).
  const isSubmittingRef = useRef(false);
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function goToAccount() {
    router.push(`/${locale}/account`);
  }

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    // `values` still carries `confirmPassword` — the route's own `registerSchema`
    // parse (parseBody) re-validates the match server-side too, so it must ride
    // along rather than be stripped.
    const result = await apiRequest<{ user: User }>('/api/auth/register', {
      method: 'POST', body: values,
    });
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    setUser(result.data.user);
    setStage({ name: 'verify-prompt', identifier: values.identifier });
  }

  async function startVerification() {
    if (stage.name !== 'verify-prompt') return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setServerError(null);
    setBusy(true);
    const result = await apiRequest<OtpChallenge>('/api/auth/otp/request', {
      method: 'POST', body: { identifier: stage.identifier, purpose: 'signup' },
    });
    isSubmittingRef.current = false;
    setBusy(false);
    if (!result.ok) {
      // The shopper is already registered and signed in regardless — surface
      // the failure and let them retry or skip, never redirect silently, so
      // a real bug or transient failure here isn't swallowed.
      setServerError(result.error.message);
      return;
    }
    setStage({
      name: 'verify-code', identifier: stage.identifier,
      otpId: result.data.otpId, devCode: result.data.devCode,
    });
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (stage.name !== 'verify-code') return;
    if (isSubmittingRef.current) return;
    setCodeError(null);
    setServerError(null);
    if (!/^\d{6}$/.test(code)) {
      setCodeError(dict.errors.code);
      return;
    }
    isSubmittingRef.current = true;
    setBusy(true);
    const result = await apiRequest<OtpVerifyResult>('/api/auth/otp/verify', {
      method: 'POST', body: { otpId: stage.otpId, code },
    });
    isSubmittingRef.current = false;
    setBusy(false);
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    goToAccount();
  }

  if (stage.name === 'verify-prompt') {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-muted-foreground">{dict.accountCreated}</p>
        <p>{dict.verifyPrompt}</p>
        {serverError ? (
          <Alert variant="destructive" className="border-destructive/40">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-col gap-3">
          <Button type="button" disabled={busy} onClick={startVerification} className="h-12 w-full text-base">
            {dict.verifyNow}
          </Button>
          <Button type="button" variant="outline" onClick={goToAccount} className="h-12 w-full text-base">
            {dict.skipForNow}
          </Button>
        </div>
      </div>
    );
  }

  if (stage.name === 'verify-code') {
    return (
      <form onSubmit={verifyCode} noValidate className="flex flex-col gap-6">
        <p className="text-muted-foreground">{dict.otpIntro}</p>
        {stage.devCode ? (
          <Alert><AlertDescription>{dict.devCodeNotice} {stage.devCode}</AlertDescription></Alert>
        ) : null}
        {serverError ? (
          <Alert variant="destructive" className="border-destructive/40">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}
        <FieldGroup>
          <Field data-invalid={Boolean(codeError) || undefined}>
            <FieldLabel htmlFor="code">{dict.otpCode}</FieldLabel>
            <Input
              id="code" type="text" inputMode="numeric" autoComplete="one-time-code"
              maxLength={6} className="h-11"
              value={code} onChange={(e) => setCode(e.target.value)}
              aria-invalid={Boolean(codeError)}
              aria-describedby={codeError ? 'code-error' : undefined}
            />
            {codeError ? <FieldError id="code-error">{codeError}</FieldError> : null}
          </Field>
        </FieldGroup>
        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={busy} className="h-12 w-full text-base">{dict.verify}</Button>
          <Button type="button" variant="outline" onClick={goToAccount} className="h-12 w-full text-base">
            {dict.skipForNow}
          </Button>
        </div>
      </form>
    );
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

        <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
          <FieldLabel htmlFor="confirmPassword">{dict.confirmPassword}</FieldLabel>
          <Input
            id="confirmPassword" type="password" autoComplete="new-password" className="h-11"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <FieldError id="confirmPassword-error">{dict.errors.confirmPassword}</FieldError>
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
