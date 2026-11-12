'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { SocialAuth } from '../social-auth';

type Dict = Dictionary['auth'];
const CODE_LENGTH = 6;
const RESEND_AFTER_S = 60;

/** Registration only issues a challenge; the account (and session) exist after `verify` (ADR-0021). */
export function SignUpForm({ locale, dict }: { locale: Locale; dict: Dict }) {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const setUser = useSessionStore((s) => s.setUser);
  const [challenge, setChallenge] = useState<(OtpChallenge & { values: RegisterInput }) | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function done(user: User) {
    setUser(user);
    router.push(next && next.startsWith(`/${locale}`) ? next : `/${locale}/account`);
  }

  async function authenticate(path: string, body: unknown) {
    setServerError(null);
    const result = await apiRequest<{ user: User }>(path, { method: 'POST', body });
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    done(result.data.user);
  }

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const result = await apiRequest<OtpChallenge>('/api/auth/register', { method: 'POST', body: values });
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    setChallenge({ ...result.data, values });
  }

  if (challenge) {
    return (
      <OtpStage
        dict={dict} challenge={challenge} onVerified={done}
        onChallenge={(c) => setChallenge({ ...c, values: challenge.values })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold uppercase tracking-tight">{dict.signUpTitle}</h1>
        <p className="text-sm text-muted-foreground">{dict.signUpSubtitle}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        {serverError ? (
          <Alert variant="destructive" className="border-destructive/40">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <div className="grid gap-6 md:grid-cols-2">
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

            <Field data-invalid={Boolean(errors.phone) || undefined}>
              <FieldLabel htmlFor="phone">{dict.phone}</FieldLabel>
              <Input
                id="phone" type="tel" autoComplete="tel" className="h-11"
                placeholder={dict.phonePlaceholder}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                {...register('phone')}
              />
              {errors.phone ? <FieldError id="phone-error">{dict.errors.phone}</FieldError> : null}
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.password) || undefined}>
            <FieldLabel htmlFor="password">{dict.password}</FieldLabel>
            <Input
              id="password" type="password" autoComplete="new-password" className="h-11"
              placeholder={dict.passwordPlaceholder}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password ? <FieldError id="password-error">{dict.errors.password}</FieldError> : null}
          </Field>
        </FieldGroup>

        <Button type="submit" disabled={isSubmitting} size="xl" className="w-full">
          {dict.submitSignUp}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {dict.hasAccount}{' '}
          <Link href={`/${locale}/sign-in`} className="text-primary underline underline-offset-4">
            {dict.signInInstead}
          </Link>
        </p>

        <SocialAuth dict={dict} authenticate={authenticate} />
      </form>
    </div>
  );
}

function OtpStage({ dict, challenge, onChallenge, onVerified }: {
  dict: Dict;
  challenge: OtpChallenge & { values: RegisterInput };
  onChallenge: (c: OtpChallenge) => void;
  onVerified: (user: User) => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER_S);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  // A ref flips synchronously, so a double-click can't fire two verifies before `busy` re-renders.
  const inFlight = useRef(false);

  // Restarts with each new challenge, so a resend gets a fresh phase as well as a fresh 60s.
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [challenge.otpId]);

  function fill(from: number, chars: string) {
    const next = [...digits];
    for (let i = 0; i < chars.length && from + i < CODE_LENGTH; i++) next[from + i] = chars[i];
    setDigits(next);
    boxes.current[Math.min(from + chars.length, CODE_LENGTH - 1)]?.focus();
  }

  async function resend() {
    setError(null);
    // Re-register rather than request a bare OTP: the new challenge then carries this shopper's own details.
    const result = await apiRequest<OtpChallenge>('/api/auth/register', { method: 'POST', body: challenge.values });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    onChallenge(result.data);
    setDigits(Array(CODE_LENGTH).fill(''));
    setSecondsLeft(RESEND_AFTER_S);
    boxes.current[0]?.focus();
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    const code = digits.join('');
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError(dict.errors.code);
      return;
    }
    inFlight.current = true;
    setBusy(true);
    const result = await apiRequest<OtpVerifyResult>('/api/auth/otp/verify', {
      method: 'POST', body: { otpId: challenge.otpId, code },
    });
    inFlight.current = false;
    setBusy(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    if (result.data.kind === 'session') onVerified(result.data.user);
  }

  return (
    <form onSubmit={verify} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold uppercase tracking-tight">{dict.otpHeading}</h1>
        <p className="text-sm text-muted-foreground">{dict.otpSent.replace('{phone}', challenge.values.phone)}</p>
      </div>
      {challenge.devCode ? (
        <Alert><AlertDescription>{dict.devCodeNotice} {challenge.devCode}</AlertDescription></Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex justify-center gap-2" role="group" aria-label={dict.otpCode}>
        {digits.map((d, i) => (
          <Input
            key={i} ref={(el) => { boxes.current[i] = el; }}
            type="text" inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={dict.otpDigit.replace('{n}', String(i + 1))}
            className="size-12 px-0 text-center text-lg"
            value={d}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(-1);
              if (v) fill(i, v);
              else setDigits(digits.map((x, j) => (j === i ? '' : x)));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !d && i > 0) boxes.current[i - 1]?.focus();
            }}
            onPaste={(e) => {
              e.preventDefault();
              fill(0, e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH));
            }}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {secondsLeft > 0 ? (
          dict.otpExpires.replace('{n}', String(secondsLeft))
        ) : (
          <button type="button" onClick={resend} className="text-primary underline underline-offset-4">
            {dict.resendCode}
          </button>
        )}
      </p>

      <Button type="submit" disabled={busy} size="xl" className="w-full">{dict.continue}</Button>
    </form>
  );
}
