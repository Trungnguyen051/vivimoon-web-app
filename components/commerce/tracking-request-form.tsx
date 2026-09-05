'use client';
import { useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api/client';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { TrackingAck } from '@/lib/api/schemas/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TrackingRequestForm({ dict }: { dict: Dictionary['tracking'] }) {
  const [code, setCode] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [busy, setBusy] = useState(false);
  const [ack, setAck] = useState<TrackingAck | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await apiRequest<TrackingAck>('/api/orders/track', {
      method: 'POST', body: { code, identifier },
    });
    setBusy(false);
    // Same envelope either way (issue #11) — nothing here branches on
    // whether the order actually existed.
    if (result.ok) setAck(result.data);
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="tracking-code">{dict.code}</FieldLabel>
          <Input id="tracking-code" value={code} onChange={(e) => setCode(e.target.value)} required className="h-11" />
        </Field>
        <Field>
          <FieldLabel htmlFor="tracking-identifier">{dict.identifier}</FieldLabel>
          <Input
            id="tracking-identifier" type="text" autoComplete="username" value={identifier}
            onChange={(e) => setIdentifier(e.target.value)} required className="h-11"
          />
        </Field>
        <Button type="submit" disabled={busy} className="h-12 text-base">{dict.submit}</Button>
      </form>

      {ack ? (
        <Alert>
          <AlertDescription className="flex flex-col gap-2">
            <span>{ack.message}</span>
            {ack.devLink ? (
              <span>
                {dict.devLinkNote}:{' '}
                <Link href={ack.devLink} className="underline underline-offset-4">
                  {ack.devLink}
                </Link>
              </span>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
