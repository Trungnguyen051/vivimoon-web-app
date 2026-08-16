'use client';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={seeMoreHref}
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {seeMoreLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="hidden items-center gap-1.5 md:flex">
            <button
              aria-label="Previous"
              onClick={() => embla?.scrollPrev()}
              className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              aria-label="Next"
              onClick={() => embla?.scrollNext()}
              className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden" ref={ref}>
        <div className="flex gap-5">
          {products.map((p) => (
            <div key={p.id} className="min-w-0 flex-[0_0_60%] sm:flex-[0_0_38%] lg:flex-[0_0_23%]">
              <ProductCard product={p} locale={locale} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
