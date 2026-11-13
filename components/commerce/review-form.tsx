'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, Star } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { REVIEW_TEXT_LIMITS, type ReviewCreate, type ReviewTag } from '@/lib/api/schemas/catalog';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils/cn';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { ReviewMediaField, type MediaState } from './review-media-field';

const TAGS: ReviewTag[] = ['sensitiveEyes', 'allDay', 'beginner', 'myopic'];
const SUB_RATINGS = ['comfort', 'colorMatch', 'easeOfWear'] as const;
type SubRatingKey = (typeof SUB_RATINGS)[number];
const { bodyMin: BODY_MIN, bodyMax: BODY_MAX, maxTags: MAX_TAGS, titleMax: TITLE_MAX } = REVIEW_TEXT_LIMITS;

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));

type ReviewFormDict = Pick<Dictionary, 'writeReview' | 'reviews'>;

/** Five native radios drawn as stars: arrow keys, labels and the required state come with them. */
function StarInput({ name, legend, value, onChange, dict, size = 'lg', errorId }: {
  name: string; legend: React.ReactNode; value: number | undefined; onChange: (n: number) => void;
  dict: ReviewFormDict['writeReview']; size?: 'lg' | 'sm'; errorId?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={errorId}>
      <legend className="pb-2 text-[13px] font-medium leading-5">{legend}</legend>
      <div className="flex items-center gap-3">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded-sm p-0.5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
              <input
                type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)}
                aria-label={fill(dict.star, { n })} className="sr-only"
              />
              <Star
                aria-hidden
                className={cn(
                  size === 'lg' ? 'size-8' : 'size-6',
                  value !== undefined && n <= value ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40',
                )}
              />
            </label>
          ))}
        </div>
        {value !== undefined ? (
          <span className="text-[13px] leading-5 text-muted-foreground">{dict.starWords[value as 1 | 2 | 3 | 4 | 5]}</span>
        ) : null}
      </div>
    </fieldset>
  );
}

/**
 * A member's Review of one order line (#227). Submit stays disabled until the form is valid, and each
 * field's error shows once the member has touched it; the stars' error once they've touched anything.
 */
export function ReviewForm({ orderId, lineKey, orderHref, productHref, dict }: {
  orderId: string; lineKey: string; orderHref: string; productHref: string; dict: ReviewFormDict;
}) {
  const t = dict.writeReview;
  const [rating, setRating] = useState<number>();
  const [subRatings, setSubRatings] = useState<Partial<Record<SubRatingKey, number>>>({});
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [touched, setTouched] = useState({ body: false, any: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [media, setMedia] = useState<MediaState>({ ids: [], blocked: null });

  const length = body.trim().length;
  const errors = {
    rating: rating === undefined ? t.errors.rating : undefined,
    body: length < BODY_MIN ? fill(t.errors.bodyShort, { n: BODY_MIN - length }) : length > BODY_MAX ? t.errors.bodyLong : undefined,
  };
  // A failed upload blocks too: the member retries or removes it rather than losing it unnoticed.
  const valid = !errors.rating && !errors.body && !media.blocked;
  const showRatingError = touched.any && errors.rating;
  const showBodyError = touched.body && errors.body;

  function toggleTag(tag: ReviewTag) {
    setTouched((s) => ({ ...s, any: true }));
    setTags((current) => (current.includes(tag) ? current.filter((x) => x !== tag) : [...current, tag]));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const payload: ReviewCreate = { lineKey, rating: rating!, subRatings, tags, title: title || undefined, body, media: media.ids };
    const result = await apiRequest<{ id: string }>(`/api/orders/${encodeURIComponent(orderId)}/reviews`, { method: 'POST', body: payload });
    setBusy(false);
    if (!result.ok) return setError(result.error.message);
    setSent(true);
  }

  if (sent) {
    return (
      <section role="status" className="flex flex-col items-center gap-3 border px-6 py-10 text-center">
        <CircleCheck aria-hidden className="size-10 text-emerald-600" />
        <h3 className="font-heading text-lg uppercase leading-6">{t.sentTitle}</h3>
        <p className="max-w-[420px] text-[13px] leading-5 text-muted-foreground">{t.sentBody}</p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Link href={orderHref} className={buttonVariants({ size: 'xl' })}>{t.backToOrder}</Link>
          <Link href={productHref} className={buttonVariants({ variant: 'outline', size: 'xl' })}>{t.viewProduct}</Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      {error ? (
        <Alert variant="destructive" className="mb-4 border-destructive/40">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-1 border px-4 py-5 md:px-6">
        <StarInput
          name="rating" dict={t} value={rating} errorId={showRatingError ? 'rating-error' : undefined}
          onChange={(n) => { setRating(n); setTouched((s) => ({ ...s, any: true })); }}
          legend={<>{t.overall} <span aria-hidden className="text-destructive">*</span></>}
        />
        {showRatingError ? <FieldError id="rating-error">{errors.rating}</FieldError> : null}
      </section>

      <section className="grid gap-5 border border-t-0 px-4 py-5 md:px-6">
        <h3 className="text-[13px] font-medium leading-5">
          {t.details} <span className="font-normal text-muted-foreground">{t.optional}</span>
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {SUB_RATINGS.map((key) => (
            <StarInput
              key={key} name={key} size="sm" dict={t} value={subRatings[key]}
              legend={<span className="font-normal text-muted-foreground">{dict.reviews.subRatings[key]}</span>}
              onChange={(n) => { setSubRatings((s) => ({ ...s, [key]: n })); setTouched((s) => ({ ...s, any: true })); }}
            />
          ))}
        </div>
      </section>

      <fieldset className="flex flex-col gap-3 border border-t-0 px-4 py-5 md:px-6">
        <legend className="float-left w-full text-[13px] font-medium leading-5">
          {t.tags} <span className="font-normal text-muted-foreground">{t.optional}</span>
        </legend>
        <p className="text-xs leading-4 text-muted-foreground">{t.tagsHint}</p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const checked = tags.includes(tag);
            const disabled = !checked && tags.length >= MAX_TAGS;
            return (
              <label
                key={tag}
                className={cn(
                  'inline-flex cursor-pointer items-center rounded-full border px-4 py-2 text-[13px] leading-5 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                  checked ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-muted',
                  disabled && 'cursor-not-allowed opacity-40 hover:bg-background',
                )}
              >
                <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={() => toggleTag(tag)} />
                {dict.reviews.tags[tag]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <section className="flex flex-col gap-5 border border-t-0 px-4 py-5 md:px-6">
        <Field>
          <FieldLabel htmlFor="review-title">
            {t.titleLabel} <span className="font-normal text-muted-foreground">{t.optional}</span>
          </FieldLabel>
          <Input
            id="review-title" value={title} maxLength={TITLE_MAX} placeholder={t.titlePlaceholder}
            onChange={(e) => setTitle(e.target.value)} onBlur={() => setTouched((s) => ({ ...s, any: true }))}
          />
        </Field>
        <Field data-invalid={Boolean(showBodyError) || undefined}>
          <FieldLabel htmlFor="review-body">
            {t.body} <span aria-hidden className="text-destructive">*</span>
          </FieldLabel>
          <textarea
            id="review-body" rows={6} value={body} required placeholder={t.bodyPlaceholder}
            aria-invalid={Boolean(showBodyError) || undefined}
            aria-describedby={showBodyError ? 'review-body-count review-body-error' : 'review-body-count'}
            onChange={(e) => setBody(e.target.value)} onBlur={() => setTouched({ body: true, any: true })}
            className="min-h-32 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
          />
          <div className="flex items-start justify-between gap-3">
            {showBodyError ? <FieldError id="review-body-error">{errors.body}</FieldError> : <span />}
            <FieldDescription id="review-body-count" className={cn('shrink-0 tabular-nums', length > BODY_MAX && 'text-destructive')}>
              {fill(t.counter, { n: length })}
            </FieldDescription>
          </div>
        </Field>
      </section>

      <ReviewMediaField dict={t} onChange={setMedia} />

      <div className="flex flex-col gap-2 pt-5 sm:flex-row sm:items-center sm:justify-end">
        {media.blocked ? (
          <p id="review-media-blocked" className="text-xs leading-4 text-muted-foreground sm:mr-auto">
            {media.blocked === 'uploading' ? t.media.waiting : t.media.fixFailed}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Link href={orderHref} className={buttonVariants({ variant: 'outline', size: 'xl' })}>{t.backToOrder}</Link>
          <Button
            type="submit" size="xl" disabled={!valid || busy}
            aria-describedby={media.blocked ? 'review-media-blocked' : undefined}
          >
            {busy ? t.sending : t.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}
