'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Slide = { image: string; href: string; alt: string };

export function HeroCarousel({ slides, ctaLabel }: { slides: Slide[]; ctaLabel: string }) {
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
    <div className="relative overflow-hidden rounded-2xl">
      <div className="overflow-hidden" ref={ref}>
        <div className="flex">
          {slides.map((s) => (
            <div key={s.href} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[3/4] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
                <Image src={s.image} alt={s.alt} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end gap-4 p-6 md:p-12">
                  <h2 className="max-w-md text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    {s.alt}
                  </h2>
                  <Link
                    href={s.href}
                    className="inline-flex h-11 w-fit items-center rounded-full bg-white px-6 text-sm font-medium text-black transition-transform hover:-translate-y-px"
                  >
                    {ctaLabel}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label="Previous slide"
        onClick={() => embla?.scrollPrev()}
        className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => embla?.scrollNext()}
        className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.href}
            aria-label={`Go to slide ${i + 1}`}
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
