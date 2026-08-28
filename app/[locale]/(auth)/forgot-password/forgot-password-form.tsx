'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { identifierSchema, type OtpChallenge, type OtpVerifyResult, type User } from '@/lib/api/schemas/auth';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Stage =
  | { name: 'request' }
  | { name: 'verify'; otpId: string; devCode?: string }
  | { name: 'reset'; resetToken: string };

export function ForgotPasswordForm({ locale, dict }: { locale: Locale; dict: Dictionary['auth'] }) {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [stage, setStage] = useState<Stage>({ name: 'request' });
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reportServer(message: string) {
    setServerError(message);
    setBusy(false);
  }

  async function requestCode(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);
    setServerError(null);
    if (!identifierSchema.safeParse(identifier).success) {
      setFieldError(dict.errors.identifier);
      return;
    }
    setBusy(true);
    const result = await apiRequest<OtpChallenge>('/api/auth/otp/request', {
      method: 'POST', body: { identifier, purpose: 'reset' },
    });
    if (!result.ok) return reportServer(result.error.message);
    setBusy(false);
    setStage({ name: 'verify', otpId: result.data.otpId, devCode: result.data.devCode });
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (stage.name !== 'verify') return;
    setFieldError(null);
    setServerError(null);
    if (!/^\d{6}$/.test(code)) {
      setFieldError(dict.errors.code);
      return;
    }
    setBusy(true);
    const result = await apiRequest<OtpVerifyResult>('/api/auth/otp/verify', {
      method: 'POST', body: { otpId: stage.otpId, code },
    });
    if (!result.ok) return reportServer(result.error.message);
    setBusy(false);
    if (result.data.kind !== 'reset') {
      // A reset-purpose OTP always returns a reset token; anything else is a
      // contract violation worth surfacing rather than silently ignoring.
      setServerError(dict.errors.code);
      return;
    }
    setStage({ name: 'reset', resetToken: result.data.resetToken });
  }

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    if (stage.name !== 'reset') return;
    setFieldError(null);
    setServerError(null);
    if (password.length < 8) {
      setFieldError(dict.errors.password);
      return;
    }
    setBusy(true);
    const result = await apiRequest<{ user: User }>('/api/auth/password/reset', {
      method: 'POST', body: { resetToken: stage.resetToken, newPassword: password },
    });
    if (!result.ok) return reportServer(result.error.message);
    setUser(result.data.user);
    router.push(`/${locale}/account`);
  }

  const alert = serverError ? (
    <Alert variant="destructive" className="border-destructive/40">
      <AlertDescription>{serverError}</AlertDescription>
    </Alert>
  ) : null;

  if (stage.name === 'request') {
    return (
      <form onSubmit={requestCode} noValidate className="flex flex-col gap-6">
        <p className="text-muted-foreground">{dict.resetIntro}</p>
        {alert}
        <FieldGroup>
          <Field data-invalid={Boolean(fieldError) || undefined}>
            <FieldLabel htmlFor="identifier">{dict.identifier}</FieldLabel>
            <Input
              id="identifier" type="text" autoComplete="username" className="h-11"
              value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? 'identifier-error' : undefined}
            />
            {fieldError ? <FieldError id="identifier-error">{fieldError}</FieldError> : null}
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={busy} className="h-12 w-full text-base">{dict.sendCode}</Button>
      </form>
    );
  }

  if (stage.name === 'verify') {
    return (
      <form onSubmit={verifyCode} noValidate className="flex flex-col gap-6">
        <p className="text-muted-foreground">{dict.otpIntro}</p>
        {stage.devCode ? (
          <Alert><AlertDescription>{dict.devCodeNotice} {stage.devCode}</AlertDescription></Alert>
        ) : null}
        {alert}
        <FieldGroup>
          <Field data-invalid={Boolean(fieldError) || undefined}>
            <FieldLabel htmlFor="code">{dict.otpCode}</FieldLabel>
            <Input
              id="code" type="text" inputMode="numeric" autoComplete="one-time-code"
              maxLength={6} className="h-11"
              value={code} onChange={(e) => setCode(e.target.value)}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? 'code-error' : undefined}
            />
            {fieldError ? <FieldError id="code-error">{fieldError}</FieldError> : null}
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={busy} className="h-12 w-full text-base">{dict.verify}</Button>
      </form>
    );
  }

  return (
    <form onSubmit={submitPassword} noValidate className="flex flex-col gap-6">
      {alert}
      <FieldGroup>
        <Field data-invalid={Boolean(fieldError) || undefined}>
          <FieldLabel htmlFor="new-password">{dict.newPassword}</FieldLabel>
          <Input
            id="new-password" type="password" autoComplete="new-password" className="h-11"
            value={password} onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? 'new-password-error' : undefined}
          />
          {fieldError ? <FieldError id="new-password-error">{fieldError}</FieldError> : null}
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={busy} className="h-12 w-full text-base">{dict.updatePassword}</Button>
    </form>
  );
}
