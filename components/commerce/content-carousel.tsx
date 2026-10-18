'use client';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, Play } from 'lucide-react';
import { CarouselNav } from './carousel-nav';

export type ContentCard = { image: string; title: string; tags: string[] };

export function ContentCarousel({
  title, subtitle, items, avatar,
}: {
  title: string;
  subtitle: string;
  items: ContentCard[];
  avatar: string;
}) {
  const [ref, embla] = useEmblaCarousel({ align: 'start', dragFree: true });

  return (
    <section className="space-y-10">
      <div className="mx-auto max-w-xl space-y-3 text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="overflow-hidden" ref={ref}>
        <div className="flex gap-4">
          {items.map((it) => (
            <div key={it.image} className="min-w-0 flex-[0_0_70%] sm:flex-[0_0_45%] lg:flex-[0_0_23%]">
              <div className="relative aspect-[208/370] overflow-hidden rounded">
                <Image src={it.image} alt={it.title} fill className="object-cover" sizes="(max-width:640px) 70vw, 23vw" />
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
                    {it.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#e5e5e5] px-3 py-1 text-xs text-[#1a1a1a]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="size-5 shrink-0 text-white/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <CarouselNav embla={embla} />
      </div>
    </section>
  );
}
