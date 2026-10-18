'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, Play } from 'lucide-react';
import { PillLink } from '@/components/ui/pill-link';
import { cn } from '@/lib/utils/cn';

/** `id` is the card's identity: title, image and tags are all content and any can repeat. */
export type ContentCard = { id: string; image: string; title: string; tags: string[]; href: string };

export function ContentCarousel({
  title, items, avatar, moreLabel, moreHref, slideLabel,
}: {
  title: string;
  items: ContentCard[];
  avatar: string;
  moreLabel: string;
  moreHref: string;
  /** Prefix for each dot's label, e.g. "Go to slide" — the number alone says nothing about what the control does. */
  slideLabel: string;
}) {
  const [ref, embla] = useEmblaCarousel({ align: 'start', dragFree: true });
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const sync = () => {
      setSnaps(embla.scrollSnapList());
      setSelected(embla.selectedScrollSnap());
    };
    sync();
    embla.on('select', sync).on('reInit', sync);
    return () => {
      embla.off('select', sync).off('reInit', sync);
    };
  }, [embla]);

  const scrollTo = useCallback((i: number) => embla?.scrollTo(i), [embla]);

  return (
    <section className="space-y-10">
      <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>

      <div className="overflow-hidden" ref={ref}>
        <div className="flex gap-4">
          {items.map((it) => (
            <Link
              key={it.id}
              href={it.href}
              className="group min-w-0 flex-[0_0_70%] sm:flex-[0_0_45%] lg:flex-[0_0_23%]"
            >
              <div className="relative aspect-[208/370] overflow-hidden rounded">
                {/* Decorative: the card states the title in text, so alt here would double the link's accessible name. */}
                <Image src={it.image} alt="" fill className="object-cover" sizes="(max-width:640px) 70vw, 23vw" />
                <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                  <Play className="size-4 fill-current" />
                </span>
              </div>
              <div className="mt-3 flex items-start gap-3 rounded bg-[#1a1a1a] p-5">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-full">
                  <Image src={avatar} alt="" fill className="object-cover" />
                </span>
                <div className="flex-1 space-y-4">
                  <p className="line-clamp-2 text-sm text-white">{it.title}</p>
                  <div className="flex flex-wrap gap-1">
                    {it.tags.map((tag, i) => (
                      <span key={`${it.id}-${i}`} className="rounded-full bg-[#e5e5e5] px-3 py-1 text-xs text-[#1a1a1a]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="size-5 shrink-0 text-white/70" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots replace the arrows the design doesn't have: they show how far along the
          strip you are, and still advance it when clicked. */}
      {snaps.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${slideLabel} ${i + 1}/${snaps.length}`}
              aria-current={i === selected ? 'true' : undefined}
              onClick={() => scrollTo(i)}
              className={cn(
                'size-2 rounded-full transition-colors',
                i === selected ? 'bg-foreground' : 'bg-foreground/25 hover:bg-foreground/50',
              )}
            />
          ))}
        </div>
      ) : null}

      <div className="flex justify-center">
        <PillLink href={moreHref}>{moreLabel}</PillLink>
      </div>
    </section>
  );
}
