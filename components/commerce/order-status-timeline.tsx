import { cn } from '@/lib/utils/cn';
import type { OrderStatus } from '@/lib/orders/statuses';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const PROGRESSION: OrderStatus[] = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

/** Cancelled/returned are not a point on the progression — a single distinct end state (issue #11). */
const TERMINAL_DISTINCT: OrderStatus[] = ['cancelled', 'returned'];

export function OrderStatusTimeline({ status, dict }: { status: OrderStatus; dict: Dictionary['orders'] }) {
  if (TERMINAL_DISTINCT.includes(status)) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
        {dict.statuses[status]}
      </div>
    );
  }

  const currentIndex = PROGRESSION.indexOf(status);

  return (
    <ol className="flex flex-col gap-3">
      {PROGRESSION.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <li key={step} className="flex items-center gap-3">
            <span className={cn('size-2.5 shrink-0 rounded-full', done ? 'bg-primary' : 'bg-muted')} />
            <span className={cn('text-sm', done ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              {dict.statuses[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
