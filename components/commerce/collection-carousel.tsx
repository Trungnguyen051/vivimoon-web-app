'use client';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { ProductCard } from './product-card';

export function CollectionCarousel({
  title, products, locale, seeMoreHref, seeMoreLabel,
}: {
  title: string; products: Product[]; locale: Locale; seeMoreHref: string; seeMoreLabel: string;
}) {
  const [ref, embla] = useEmblaCarousel({ align: 'start', dragFree: true });
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href={seeMoreHref} className="text-sm hover:underline">{seeMoreLabel}</Link>
      </div>
      <div className="relative">
        <div className="overflow-hidden" ref={ref}>
          <div className="flex gap-4">
            {products.map((p) => (
              <div key={p.id} className="min-w-0 flex-[0_0_60%] sm:flex-[0_0_40%] lg:flex-[0_0_23%]">
                <ProductCard product={p} locale={locale} />
              </div>
            ))}
          </div>
        </div>
        <button aria-label="Previous slide" onClick={() => embla?.scrollPrev()} className="absolute -left-3 top-1/3 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"><ChevronLeft className="h-5 w-5" /></button>
        <button aria-label="Next slide" onClick={() => embla?.scrollNext()} className="absolute -right-3 top-1/3 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </section>
  );
}
