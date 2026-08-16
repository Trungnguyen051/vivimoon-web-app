import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex', className)} aria-label={`Rating ${rating} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('h-4 w-4', i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')}
        />
      ))}
    </div>
  );
}
