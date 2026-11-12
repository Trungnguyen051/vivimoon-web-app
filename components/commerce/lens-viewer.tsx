'use client';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { LensGallery, MakeupTone } from '@/lib/api/schemas/catalog';
import { cn } from '@/lib/utils/cn';

const TABS = ['eye', 'face', 'closeUp', 'sunlight', 'video'] as const;
type Tab = (typeof TABS)[number];
type Slide = { tab: Tab; image: string; video?: { url: string; title: string } };

/** A clip already resolved to one locale by the page. */
export type ViewerVideo = { id: string; poster: string; url: string; title: string };

/**
 * The PDP gallery (Lens Viewer, CONTEXT.md): one strip of slides across the views
 * Vân lens / Người mẫu / Cận mắt / Dưới nắng / Video. A tab jumps to its first slide
 * and the arrows walk the whole strip, so the counter counts every slide. A view with
 * nothing in it gets no tab; a product with no gallery shows its own images alone.
 *
 * Desktop draws the tabs as a vertical thumbnail column; a phone draws them as chips
 * under the image, with that view's thumbnails beneath. One set of buttons serves both.
 *
 * Takes everything as props — `components/` never fetches.
 */
export function LensViewer({
  gallery, images, videos, tones, alt, dict, imageLabel, common, favorite,
}: {
  gallery: LensGallery | null;
  /** The product's own images: the Vân lens view when there is no gallery. */
  images: string[];
  videos: ViewerVideo[];
  tones: { tone: MakeupTone; image: string }[];
  alt: string;
  dict: Dictionary['viewer'];
  imageLabel: string;
  common: Pick<Dictionary['common'], 'previous' | 'next'>;
  /** The favourite toggle, laid over the image on a phone. */
  favorite?: ReactNode;
}) {
  const c = gallery?.contexts;
  const byTab: Record<Tab, Slide[]> = {
    eye: (c?.eye.length ? c.eye : images).map((image) => ({ tab: 'eye', image })),
    face: (c?.face ?? []).map((image) => ({ tab: 'face', image })),
    closeUp: (c?.closeUp ?? []).map((image) => ({ tab: 'closeUp', image })),
    sunlight: (c?.sunlight ?? []).map((image) => ({ tab: 'sunlight', image })),
    video: videos.map((v) => ({ tab: 'video', image: v.poster, video: { url: v.url, title: v.title } })),
  };
  const tabs = TABS.filter((tab) => byTab[tab].length > 0);
  const slides = tabs.flatMap((tab) => byTab[tab]);

  const [index, setIndex] = useState(0);
  const [tone, setTone] = useState<MakeupTone | null>(null);
  const slide = slides[index] ?? slides[0];
  const toneImage = tones.find((t) => t.tone === tone)?.image;

  const go = (next: number) => {
    setTone(null);
    setIndex((next + slides.length) % slides.length);
  };
  const firstOf = (tab: Tab) => slides.findIndex((s) => s.tab === tab);
  const activeTab = tone ? null : slide.tab;

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-4">
      <div className="flex min-w-0 flex-col gap-3 md:grid md:grid-cols-[88px_minmax(0,1fr)] md:gap-4">
        <div
          data-testid="lens-viewer-main"
          className={cn(
            'relative -mx-4 aspect-square overflow-hidden bg-muted md:row-start-1 md:mx-0 md:rounded-xl',
            tabs.length > 1 ? 'md:col-start-2' : 'md:col-span-2',
          )}
        >
          <Image
            key={toneImage ?? slide.image}
            src={toneImage ?? slide.image}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 45vw"
            loading="eager"
          />
          <span className="absolute left-3 top-3 bg-foreground/85 px-2 py-1 text-[11px] font-medium text-background md:left-4 md:top-4 md:text-xs">
            {tone ? dict.toneLabels[tone] : dict.captions[slide.tab]}
          </span>
          {favorite ? <div className="absolute right-3 top-3 md:hidden">{favorite}</div> : null}

          {slide.video && !tone ? (
            <a
              href={slide.video.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={slide.video.title}
              className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm transition-transform hover:scale-105"
            >
              <Play className="size-6 fill-current" aria-hidden />
            </a>
          ) : null}

          <div className="absolute inset-x-3 bottom-3 flex items-center justify-end md:inset-x-4 md:bottom-4 md:justify-between">
            {slides.length > 1 ? (
              <button type="button" aria-label={common.previous} onClick={() => go(index - 1)} className="hidden size-9 items-center justify-center bg-background/80 transition-colors hover:bg-background md:flex">
                <ChevronLeft className="size-5" />
              </button>
            ) : null}
            <span className="bg-background/80 px-2 py-0.5 text-xs tabular-nums md:px-2.5 md:py-1 md:text-sm">
              {index + 1} / {slides.length}
            </span>
            {slides.length > 1 ? (
              <button type="button" aria-label={common.next} onClick={() => go(index + 1)} className="hidden size-9 items-center justify-center bg-background/80 transition-colors hover:bg-background md:flex">
                <ChevronRight className="size-5" />
              </button>
            ) : null}
          </div>
        </div>

        {tabs.length > 1 ? (
          <div role="group" aria-label={dict.views} className="flex min-w-0 gap-1 overflow-x-auto md:col-start-1 md:row-start-1 md:flex-col md:gap-3 md:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={activeTab === tab}
                onClick={() => go(firstOf(tab))}
                className={cn(
                  'group relative shrink-0 rounded-full border px-[7px] py-1 text-xs transition-colors md:size-[88px] md:overflow-hidden md:rounded-lg md:p-0',
                  activeTab === tab
                    ? 'border-foreground bg-foreground text-background md:bg-muted md:ring-2 md:ring-foreground md:ring-offset-2 md:ring-offset-background'
                    : 'border-border hover:bg-muted md:hover:border-foreground',
                )}
              >
                <Image src={byTab[tab][0].image} alt="" fill className="hidden object-cover md:block" sizes="88px" />
                <span className="relative md:absolute md:inset-x-0 md:bottom-0 md:flex md:flex-col md:items-center md:gap-1 md:bg-gradient-to-t md:from-black/70 md:to-transparent md:px-1 md:pb-1.5 md:pt-5 md:text-white">
                  {tab === 'video' ? <Play className="hidden size-4 fill-current md:block" aria-hidden /> : null}
                  {dict.tabs[tab]}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {/* A phone browses the active view's images under the tabs. */}
        {slide && byTab[slide.tab].length > 1 ? (
          <div className="flex min-w-0 gap-2 overflow-x-auto md:hidden">
            {byTab[slide.tab].map((s, i) => {
              const at = firstOf(slide.tab) + i;
              return (
                <button
                  key={`${s.image}-${i}`}
                  type="button"
                  aria-label={`${imageLabel} ${i + 1}: ${alt}`}
                  aria-current={!tone && at === index}
                  onClick={() => go(at)}
                  className={cn('relative size-14 shrink-0 overflow-hidden rounded-lg border-2 border-transparent', !tone && at === index && 'border-foreground')}
                >
                  <Image src={s.image} alt="" fill className="object-cover" sizes="56px" />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {tones.length > 0 ? (
        <div className="flex min-w-0 flex-col gap-2.5">
          <p className="text-sm font-medium">{dict.tones}</p>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {tones.map((t) => (
              <button
                key={t.tone}
                type="button"
                aria-pressed={tone === t.tone}
                onClick={() => setTone(tone === t.tone ? null : t.tone)}
                className={cn(
                  'rounded-full border px-[7px] py-1 text-xs transition-colors md:px-3.5 md:py-1.5 md:text-sm',
                  tone === t.tone ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted',
                )}
              >
                {dict.toneLabels[t.tone]}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
