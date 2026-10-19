import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EmblaCarouselType } from 'embla-carousel';

/** Shared prev/next controls for the embla-backed homepage carousels (CollectionCarousel, ContentCarousel). */
export function CarouselNav({ embla, previousLabel, nextLabel }: { embla: EmblaCarouselType | undefined; previousLabel: string; nextLabel: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        aria-label={previousLabel}
        onClick={() => embla?.scrollPrev()}
        className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        aria-label={nextLabel}
        onClick={() => embla?.scrollNext()}
        className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
