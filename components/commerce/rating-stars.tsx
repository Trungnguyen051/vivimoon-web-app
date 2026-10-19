import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/** `label` is the dictionary's word for a rating — the stars have no text of their own to fall back on. */
export function RatingStars({ rating, label, outOfLabel, className }: { rating: number; label: string; outOfLabel: string; className?: string }) {
  return (
    // role="img": aria-label on a role-less element is ignored, so without this the
    // stars announce nothing — the label would be translated and never spoken.
    <div role="img" className={cn('flex', className)} aria-label={`${label} ${rating} ${outOfLabel} 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('size-3.5', i <= Math.round(rating) ? 'fill-foreground text-foreground' : 'fill-transparent text-muted-foreground/40')}
        />
      ))}
    </div>
  );
}
