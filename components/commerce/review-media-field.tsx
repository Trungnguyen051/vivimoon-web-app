'use client';
import { useEffect, useRef, useState } from 'react';
import { CircleAlert, ImagePlus, Play, RotateCw, X } from 'lucide-react';
import { uploadFile } from '@/lib/api/upload';
import { REVIEW_MEDIA_LIMITS, type ReviewMediaRef } from '@/lib/api/schemas/catalog';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { FieldError } from '@/components/ui/field';

type MediaDict = Pick<Dictionary['writeReview'], 'media' | 'optional'>;
type Kind = ReviewMediaRef['type'];
type Upload = {
  key: string; file: File; kind: Kind; preview: string;
  status: 'uploading' | 'done' | 'error'; progress: number; ref?: ReviewMediaRef; error?: string;
};
/** What the form needs from the grid: the references to send, and whether sending must wait. */
export type MediaState = { ids: string[]; blocked: 'uploading' | 'failed' | null };

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
const kindOf = (type: string): Kind | null =>
  (REVIEW_MEDIA_LIMITS.image.types as readonly string[]).includes(type) ? 'image' : type === 'video/mp4' ? 'video' : null;
const ACCEPT = [...REVIEW_MEDIA_LIMITS.image.types, ...REVIEW_MEDIA_LIMITS.video.types].join(',');

/**
 * The Review form's photos and video (#228). Each file uploads the moment it's added, one per request,
 * with its own progress, retry and remove. The browser's checks only give a quick message; the upload
 * route is the rule.
 */
export function ReviewMediaField({ dict, onChange }: { dict: MediaDict; onChange: (state: MediaState) => void }) {
  const t = dict.media;
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const nextKey = useRef(0);
  const previews = useRef(new Set<string>());

  const count = (kind: Kind) => uploads.filter((u) => u.kind === kind).length;
  const full = count('image') >= REVIEW_MEDIA_LIMITS.image.maxCount && count('video') >= REVIEW_MEDIA_LIMITS.video.maxCount;

  useEffect(() => {
    onChange({
      ids: uploads.flatMap((u) => (u.ref ? [u.ref.id] : [])),
      blocked: uploads.some((u) => u.status === 'uploading') ? 'uploading' : uploads.some((u) => u.status === 'error') ? 'failed' : null,
    });
  }, [uploads, onChange]);

  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const patch = (key: string, next: Partial<Upload>) =>
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...next } : u)));

  async function start({ key, file, kind }: Pick<Upload, 'key' | 'file' | 'kind'>) {
    patch(key, { status: 'uploading', progress: 0, error: undefined });
    setAnnouncement(fill(t.uploading, { name: file.name }));
    const result = await uploadFile<ReviewMediaRef>('/api/reviews/media', file, (progress) => patch(key, { progress }));
    if (result.ok) {
      patch(key, { status: 'done', progress: 1, ref: result.data });
      setAnnouncement(fill(t.uploaded, { name: file.name }));
    } else {
      const reasons: Record<string, string> = {
        'file.type': t.reasons.type, 'file.size': kind === 'image' ? t.reasons.imageSize : t.reasons.videoSize, 'file.duration': t.reasons.duration,
      };
      patch(key, { status: 'error', error: reasons[result.error.field ?? ''] ?? t.reasons.other });
    }
  }

  function add(files: File[]) {
    const errors: string[] = [];
    const accepted: Upload[] = [];
    const taken = { image: count('image'), video: count('video') };
    for (const file of files) {
      const kind = kindOf(file.type);
      if (!kind) { errors.push(fill(t.errors.type, { name: file.name })); continue; }
      const limit = REVIEW_MEDIA_LIMITS[kind];
      if (file.size > limit.maxBytes) { errors.push(fill(kind === 'image' ? t.errors.imageSize : t.errors.videoSize, { name: file.name })); continue; }
      if (taken[kind] >= limit.maxCount) { errors.push(kind === 'image' ? t.errors.imageCount : t.errors.videoCount); continue; }
      taken[kind]++;
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      accepted.push({ key: `u${nextKey.current++}`, file, kind, preview, status: 'uploading', progress: 0 });
    }
    setRejected([...new Set(errors)]);
    setUploads((list) => [...list, ...accepted]);
    accepted.forEach(start);
  }

  function remove(upload: Upload) {
    URL.revokeObjectURL(upload.preview);
    previews.current.delete(upload.preview);
    setUploads((list) => list.filter((u) => u.key !== upload.key));
    setAnnouncement(fill(t.removed, { name: upload.file.name }));
  }

  return (
    <section className="flex flex-col gap-3 border border-t-0 px-4 py-5 md:px-6" aria-labelledby="review-media-label">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 id="review-media-label" className="text-[13px] font-medium leading-5">
          {t.label} <span className="font-normal text-muted-foreground">{dict.optional}</span>
        </h3>
        <p className="text-xs tabular-nums leading-4 text-muted-foreground">
          {fill(t.count, { images: count('image'), videos: count('video') })}
        </p>
      </div>
      <p className="text-xs leading-4 text-muted-foreground">{t.hint}</p>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {uploads.map((u) => (
          <li key={u.key} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {u.kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element -- a local blob preview, nothing to optimise
              <img src={u.preview} alt="" className="size-full object-cover" />
            ) : (
              <>
                <video src={u.preview} muted playsInline preload="metadata" className="size-full object-cover" />
                <span aria-hidden className="absolute bottom-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-background/90">
                  <Play className="size-3 fill-current" />
                </span>
              </>
            )}

            {u.status === 'uploading' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/45 px-3 text-background">
                <span aria-hidden className="text-xs font-medium tabular-nums">{Math.round(u.progress * 100)}%</span>
                <div
                  role="progressbar" aria-label={fill(t.uploading, { name: u.file.name })}
                  aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(u.progress * 100)}
                  className="h-1 w-full overflow-hidden rounded-full bg-background/30"
                >
                  <div className="h-full bg-background transition-[width]" style={{ width: `${u.progress * 100}%` }} />
                </div>
              </div>
            ) : null}

            {u.status === 'error' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/90 p-2 text-center">
                <CircleAlert aria-hidden className="size-5 text-destructive" />
                <p role="alert" className="line-clamp-2 text-[11px] leading-[14px] text-destructive">
                  <span className="sr-only">{fill(t.failed, { name: u.file.name })}: </span>{u.error}
                </p>
                <button
                  type="button" onClick={() => start(u)} aria-label={fill(t.retry, { name: u.file.name })}
                  className="inline-flex h-7 items-center gap-1 rounded-full border bg-background px-2.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <RotateCw aria-hidden className="size-3" />
                  <span aria-hidden>{t.retryShort}</span>
                </button>
              </div>
            ) : null}

            <button
              type="button" onClick={() => remove(u)} aria-label={fill(t.remove, { name: u.file.name })}
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </li>
        ))}

        {full ? null : (
          <li className="aspect-square">
            <label className="flex size-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-input bg-background px-2 text-center text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted hover:text-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
              <ImagePlus aria-hidden className="size-5" />
              <span className="text-xs leading-4">{t.add}</span>
              <input
                type="file" accept={ACCEPT} multiple className="sr-only"
                onChange={(e) => { add([...(e.target.files ?? [])]); e.target.value = ''; }}
              />
            </label>
          </li>
        )}
      </ul>

      {rejected.map((message) => <FieldError key={message}>{message}</FieldError>)}
      <p aria-live="polite" className="sr-only">{announcement}</p>
    </section>
  );
}
