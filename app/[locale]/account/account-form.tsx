'use client';
import { useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore } from '@/features/session/session-store';
import type { User } from '@/lib/api/schemas/auth';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AccountForm({ user, dict }: { user: User; dict: Dictionary['account'] }) {
  const setUser = useSessionStore((s) => s.setUser);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? '');
  const [dob, setDob] = useState(user.dob ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);
    setSaved(false);

    const next: Record<string, string> = {};
    if (!name.trim()) next.name = dict.errors.name;
    if (password && password.length < 8) next.password = dict.errors.password;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Only send what has a value — a blank password must not be sent at all,
    // or it would be read as an intent to set an empty one.
    const patch: Record<string, string> = { name: name.trim() };
    if (email) patch.email = email;
    if (dob) patch.dob = dob;
    if (password) patch.password = password;

    setBusy(true);
    const result = await apiRequest<User>('/api/account', { method: 'PATCH', body: patch });
    setBusy(false);
    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    setUser(result.data);
    setPassword('');
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {serverError ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}
      {saved ? <Alert><AlertDescription>{dict.saved}</AlertDescription></Alert> : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="phone">{dict.phone}</FieldLabel>
          <Input id="phone" type="tel" readOnly value={user.phone} className="h-11 bg-muted" />
          <p className="text-sm text-muted-foreground">{dict.phoneLocked}</p>
        </Field>

        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="name">{dict.name}</FieldLabel>
          <Input
            id="name" type="text" autoComplete="name" className="h-11"
            value={name} onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name ? <FieldError id="name-error">{errors.name}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">{dict.email}</FieldLabel>
          <Input
            id="email" type="email" autoComplete="email" className="h-11"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="dob">{dict.dob}</FieldLabel>
          <Input
            id="dob" type="date" autoComplete="bday" className="h-11"
            value={dob} onChange={(e) => setDob(e.target.value)}
          />
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <FieldLabel htmlFor="new-password">{dict.newPassword}</FieldLabel>
          <Input
            id="new-password" type="password" autoComplete="new-password" className="h-11"
            value={password} onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <p className="text-sm text-muted-foreground">{dict.passwordHint}</p>
          {errors.password ? <FieldError id="password-error">{errors.password}</FieldError> : null}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={busy} className="h-12 w-full text-base sm:w-auto sm:px-10">
        {dict.save}
      </Button>
    </form>
  );
}
