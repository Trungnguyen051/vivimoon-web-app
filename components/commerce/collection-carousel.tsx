'use client';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { ProductCard } from './product-card';
import { CarouselNav } from './carousel-nav';

export function CollectionCarousel({
  title, products, locale, dict, seeMoreHref, seeMoreLabel,
}: {
  title: string; products: Product[]; locale: Locale; dict: Dictionary; seeMoreHref: string; seeMoreLabel: string;
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
          <div className="hidden md:flex">
            <CarouselNav embla={embla} />
          </div>
        </div>
      </div>
      <div className="overflow-hidden" ref={ref}>
        <div className="flex gap-5">
          {products.map((p) => (
            <div key={p.id} className="min-w-0 flex-[0_0_60%] sm:flex-[0_0_38%] lg:flex-[0_0_23%]">
              <ProductCard product={p} locale={locale} dict={dict} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
