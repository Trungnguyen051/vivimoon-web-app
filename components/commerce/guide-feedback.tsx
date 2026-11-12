'use client';
import { useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { GuideFeedback as Vote } from '@/lib/api/schemas/support';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Whether a Guide helped (#124).
 *
 * Deliberately small, and deliberately honest. The buttons disable once a vote lands
 * so the reader can see it registered — but only once it *has* landed: a control that
 * goes quiet on a failed request tells a reader their answer was recorded when it was
 * not, which is the one thing this ticket says it must not do.
 *
 * Nothing is remembered across reloads. There is no identity to remember it against,
 * and storing it locally would be a dedup that only works on one device — which reads
 * as a guarantee and is not one.
 */
export function GuideFeedback({ guideSlug, dict }: { guideSlug: string; dict: Dictionary['support']['guide'] }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  async function vote(helpful: boolean) {
    if (busy || done) return;

    setBusy(true);
    setFailed(false);
    const result = await apiRequest<Vote>('/api/support/guide-feedback', {
      method: 'POST', body: { guideSlug, helpful },
    });
    setBusy(false);

    /* Only a recorded vote closes the question.

       Spec #118 said to disable both buttons after a vote; this disables them only once
       one is stored (ratified in #159). Locking the buttons on a failure would throw the
       vote away and leave the reader no way to try again — the spec's rule written for
       the path where everything works. */
    if (result.ok) setDone(true);
    else setFailed(true);
  }

  return (
    <section className="flex flex-col items-start gap-4 rounded-xl border p-6">
      <p className="text-base font-medium">{dict.feedbackQuestion}</p>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" size="lg" disabled={busy || done} onClick={() => vote(true)}>
          {dict.feedbackYes}
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={busy || done} onClick={() => vote(false)}>
          {dict.feedbackNo}
        </Button>
      </div>

      {/* Mounted from the start so the thanks is announced reliably rather than
          appearing with its text already in it. */}
      <div role="status" aria-live="polite">
        {done ? (
          <Alert role="presentation">
            <AlertDescription>{dict.feedbackThanks}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      {/* Mounted from the start too. The thanks had this and the failure did not,
          which is backwards: the failure is the case that actually needs announcing,
          because the reader has to vote again. An assertive region inserted with its
          text already in it can go unannounced. */}
      <div role="alert" aria-live="assertive">
        {failed ? (
          <Alert role="presentation" variant="destructive">
            {/* The envelope's own message is English-only, so it is never shown (#64). */}
            <AlertDescription>{dict.feedbackError}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </section>
  );
}
