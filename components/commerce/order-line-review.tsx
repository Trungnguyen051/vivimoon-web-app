'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api/client';
import type { LineReview } from '@/lib/api/schemas/catalog';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils/cn';
import { Button, buttonVariants } from '@/components/ui/button';

const TONE = {
  pending: 'bg-secondary text-primary',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-destructive/10 text-destructive',
} as const;

/** The Review action on a member's order line: write one, or see where it stands and delete it. */
export function OrderLineReview({ review, writeHref, productHref, dict }: {
  review: LineReview; writeHref: string; productHref: string; dict: Dictionary['writeReview']['line'];
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const action = cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-none border-foreground');

  if (review.status === 'none') {
    return <Link href={writeHref} className={action}>{dict.write}</Link>;
  }

  async function remove() {
    setBusy(true);
    setError(null);
    const result = await apiRequest(`/api/reviews/${encodeURIComponent(review.reviewId!)}`, { method: 'DELETE' });
    setBusy(false);
    if (!result.ok) return setError(result.error.message);
    setConfirming(false);
    router.refresh();
  }

  const status = review.status;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {status === 'approved' ? (
          <Link href={`${productHref}#reviews`} className={cn('px-2 py-0.5 text-xs leading-4 underline-offset-4 hover:underline', TONE.approved)}>
            {dict.approved}
          </Link>
        ) : (
          <span className={cn('px-2 py-0.5 text-xs leading-4', TONE[status])}>{dict[status]}</span>
        )}
        {status === 'rejected' ? (
          <Link href={writeHref} className="text-xs leading-4 underline underline-offset-4">{dict.rewrite}</Link>
        ) : null}
        {confirming ? (
          <span className="flex items-center gap-2 text-xs leading-4">
            {dict.confirmDelete}
            <Button type="button" size="xs" variant="destructive" disabled={busy} onClick={remove}>{dict.confirm}</Button>
            <Button type="button" size="xs" variant="ghost" disabled={busy} onClick={() => setConfirming(false)}>{dict.cancel}</Button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="text-xs leading-4 text-muted-foreground underline-offset-4 hover:underline">
            {dict.delete}
          </button>
        )}
      </div>
      {status === 'rejected' && review.reason ? (
        <p className="text-xs leading-4 text-muted-foreground">{dict.reason.replace('{reason}', review.reason)}</p>
      ) : null}
      {error ? <p role="alert" className="text-xs leading-4 text-destructive">{error}</p> : null}
    </div>
  );
}
