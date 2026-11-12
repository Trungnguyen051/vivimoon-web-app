import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { OrderStatus } from '@/lib/orders/statuses';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type Step = keyof Dictionary['orderDetail']['steps'];

const STEPS: Step[] = ['placed', 'confirmed', 'packed', 'shipping', 'delivered'];

/** Five shopper-facing steps over the six progression statuses: the two carrier legs read as one "on the way". */
const STEP_OF: Partial<Record<OrderStatus, Step>> = {
  placed: 'placed', confirmed: 'confirmed', packed: 'packed',
  shipped: 'shipping', out_for_delivery: 'shipping', delivered: 'delivered',
};

/** Horizontal stepper. Cancelled/returned are not a point on it — a single distinct end state (issue #11). */
export function OrderStatusTimeline({ status, dict }: { status: OrderStatus; dict: Dictionary }) {
  const step = STEP_OF[status];
  if (!step) {
    return (
      <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
        {dict.orders.statuses[status]}
      </div>
    );
  }

  const current = STEPS.indexOf(step);

  return (
    <ol aria-label={dict.orderDetail.status} className="flex items-start py-4">
      {STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <li
            key={s} aria-current={i === current ? 'step' : undefined}
            className="relative flex flex-1 flex-col items-center gap-2 text-center"
          >
            {/* Connector from the previous circle's centre to this one's; the circles sit on top of its ends. */}
            {i > 0 ? (
              <span aria-hidden className={cn('absolute right-1/2 top-3.5 h-px w-full', done ? 'bg-foreground' : 'bg-border')} />
            ) : null}
            <span
              aria-hidden
              className={cn(
                'relative z-10 flex size-7 items-center justify-center rounded-full',
                done ? 'bg-foreground text-background' : 'border bg-background',
              )}
            >
              {done ? <Check className="size-4" /> : null}
            </span>
            <span className={cn('text-xs leading-4 sm:text-sm sm:leading-5', done ? 'font-medium' : 'text-muted-foreground')}>
              {dict.orderDetail.steps[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
