import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/** A clip already resolved to one locale by the page; `views` is already formatted. */
export type ProductVideoCard = { id: string; title: string; poster: string; url: string; views: string };

/**
 * "Lens trên mắt thật" — this product's VIVIMOON TV clips (CONTEXT.md). Each card
 * plays where the clip lives; the strip hides for a product with none.
 */
export function ProductVideos({
  videos, productLabel, moreHref, dict,
}: {
  videos: ProductVideoCard[];
  /** "Sandkiss · 190K" — the product the clips merchandise. */
  productLabel: string;
  moreHref: string;
  dict: Dictionary['pdp']['videos'];
}) {
  if (videos.length === 0) return null;

  return (
    <section className="flex flex-col gap-5 md:gap-10">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between md:gap-4">
        <div className="space-y-1 md:space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">{dict.title}</h2>
          <p className="text-sm text-muted-foreground md:text-base">{dict.subtitle}</p>
        </div>
        <Link href={moreHref} className="group inline-flex items-center gap-1 text-sm font-medium hover:text-primary md:text-base">
          {dict.more}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Scrolls inside itself on a phone; the page never does. */}
      <ul className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {videos.map((v) => (
          <li key={v.id} className="flex w-[140px] shrink-0 snap-start flex-col gap-1.5 md:w-auto md:gap-3">
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.play.replace('{title}', v.title)}
              className="group relative flex flex-col gap-1.5"
            >
              <span className="relative block aspect-[322/520] overflow-hidden rounded-xl bg-muted">
                <Image src={v.poster} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 140px, 25vw" />
                <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm md:size-13">
                  <Play className="size-4 fill-current" aria-hidden />
                </span>
              </span>
              {/* Below the poster on a phone, a chip over it from md up. */}
              <span className="text-xs text-muted-foreground md:absolute md:inset-x-0 md:bottom-4 md:flex md:justify-center">
                <span className="md:inline-flex md:items-center md:gap-1.5 md:rounded-full md:bg-background/95 md:px-3 md:py-1.5 md:font-medium md:text-foreground">
                  {productLabel}
                  <ChevronRight className="hidden size-3.5 md:block" aria-hidden />
                </span>
              </span>
            </a>
            <p className="text-sm font-medium leading-snug md:text-base">{v.title}</p>
            <p className="text-xs text-muted-foreground md:text-sm">{dict.views.replace('{n}', v.views)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
