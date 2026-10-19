'use client';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PillLink } from '@/components/ui/pill-link';

/**
 * `id` is the slide's identity. Deliberately explicit: href, image and alt are
 * all content, and any of them can legitimately repeat across slides — two
 * creatives for one collection share an href, a seasonal re-crop shares an
 * image. Keying on content is what broke CategoryGrid in #30.
 */
type Slide = { id: string; image: string; href: string; alt: string };

/** Icon-only controls have no visible text, so their labels are the whole accessible name. */
export type CarouselLabels = { previous: string; next: string; goToSlide: string };

export function HeroCarousel({ slides, ctaLabel, labels }: { slides: Slide[]; ctaLabel: string; labels: CarouselLabels }) {
  const [ref, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on('init', onSelect);
    embla.on('reInit', onSelect);
    embla.on('select', onSelect);
    return () => {
      embla.off('init', onSelect);
      embla.off('reInit', onSelect);
      embla.off('select', onSelect);
    };
  }, [embla, onSelect]);

  return (
    <div className="relative overflow-hidden">
      <div className="overflow-hidden" ref={ref}>
        <div className="flex">
          {slides.map((s, i) => (
            <div key={s.id} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[3/4] w-full sm:aspect-[16/9] lg:aspect-[9/4]">
                <Image src={s.image} alt="" fill className="object-cover" priority={i === 0} sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                {/* Image is full-bleed, copy is not: this inner wrapper matches
                    PageContainer so the headline lines up with the sections below. */}
                <div className="absolute inset-0 flex flex-col justify-end py-6 md:py-12">
                  <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4">
                    <h2 className="max-w-md text-3xl font-semibold tracking-tight text-white md:text-5xl">
                      {s.alt}
                    </h2>
                    <PillLink href={s.href} variant="light">{ctaLabel}</PillLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label={labels.previous}
        onClick={() => embla?.scrollPrev()}
        className="absolute left-4 top-1/2 md:left-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        aria-label={labels.next}
        onClick={() => embla?.scrollNext()}
        className="absolute right-4 top-1/2 md:right-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`${labels.goToSlide} ${i + 1}`}
            aria-current={selected === i}
            onClick={() => embla?.scrollTo(i)}
            className={cn(
              'h-1.5 rounded-full bg-white/60 transition-all',
              selected === i ? 'w-6 bg-white' : 'w-1.5 hover:bg-white/80',
            )}
          />
        ))}
      </div>
    </div>
  );
}
