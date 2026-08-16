import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex', className)} aria-label={`Rating ${rating} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('size-3.5', i <= Math.round(rating) ? 'fill-foreground text-foreground' : 'fill-transparent text-muted-foreground/40')}
        />
      ))}
    </div>
  );
}
