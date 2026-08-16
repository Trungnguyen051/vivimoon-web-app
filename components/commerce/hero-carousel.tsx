'use client';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function HeroCarousel({ slides }: { slides: { image: string; href: string; alt: string }[] }) {
  const [ref, embla] = useEmblaCarousel({ loop: true });
  return (
    <div className="relative">
      <div className="overflow-hidden" ref={ref}>
        <div className="flex">
          {slides.map((s) => (
            <Link key={s.href} href={s.href} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[21/9] w-full">
                <Image src={s.image} alt={s.alt} fill className="object-cover" priority />
              </div>
            </Link>
          ))}
        </div>
      </div>
      <button aria-label="Previous slide" onClick={() => embla?.scrollPrev()} className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button aria-label="Next slide" onClick={() => embla?.scrollNext()} className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
