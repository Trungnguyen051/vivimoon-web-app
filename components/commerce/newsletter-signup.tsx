'use client';
import { useRef, useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { SubscriptionAck } from '@/lib/api/schemas/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * The weekly digest sign-up at the foot of the Knowledge index (#132).
 *
 * Four states, and the two that usually go missing are the ones held by tests here: a
 * pending button that cannot be fired twice, and a failure that says so rather than
 * doing nothing. A form that silently swallows a failed request is worse than one that
 * refuses, because the shopper believes they subscribed.
 *
 * `noValidate` hands validation to the route rather than the browser: the route already
 * names the offending field in its envelope, and a browser bubble would say something
 * different in a language the dictionary does not own.
 */
export function NewsletterSignup({ dict }: { dict: Dictionary['newsletter'] }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* `busy` alone does not block a second submit fired before the first's re-render
     commits; this is updated synchronously so the second call sees it immediately.
     Same guard as `sign-up-form.tsx` and `quiz-flow.tsx`. */
  const isSubmittingRef = useRef(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setBusy(true);
    setError(null);
    /* Cleared too, or a second submit after a success renders the confirmation and the
       failure together — both alerts, disagreeing, in the same section. */
    setDone(false);
    const result = await apiRequest<SubscriptionAck>('/api/newsletter', {
      method: 'POST', body: { email },
    });
    isSubmittingRef.current = false;
    setBusy(false);

    if (result.ok) {
      setDone(true);
      setEmail('');
      return;
    }
    /* Branch on the code, never on the envelope's message. Those messages are authored
       in English — by the schema for a rejected address, by `apiRequest` for a request
       that never arrived — and showing either one puts English on the Vietnamese
       storefront. That is the regression #64 exists to stop, one form over. */
    setError(result.error.code === 'validation_failed' ? dict.invalid : dict.error);
  }

  return (
    <section className="flex flex-col gap-6 rounded-xl border p-6 md:p-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{dict.title}</h2>
        <p className="max-w-2xl text-muted-foreground">{dict.subtitle}</p>
      </div>

      {/* Stacked on a phone, side by side from the small breakpoint up. */}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="flex-1" data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="newsletter-email">{dict.emailLabel}</FieldLabel>
          <Input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.emailPlaceholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'newsletter-error' : undefined}
            className="h-11"
          />
        </Field>
        <Button type="submit" disabled={busy} size="xl" className="sm:w-auto">
          {busy ? dict.pending : dict.submit}
        </Button>
      </form>

      {/* The live region is always mounted and filled on success, rather than appearing
          with its text already in it: a polite region that does not exist until its
          content does is announced unreliably, and a shopper who has just submitted is
          looking at the button rather than at the line beneath it. */}
      <div role="status" aria-live="polite">
        {done ? (
          /* The live region above carries the semantics, so this is drawing only.
             `Alert` defaults to `role="alert"`, which here would be a second, assertive
             announcement of the same sentence — and indistinguishable from the failure. */
          <Alert role="presentation">
            <AlertDescription>{dict.success}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      {error ? (
        <Alert role="alert" id="newsletter-error" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
