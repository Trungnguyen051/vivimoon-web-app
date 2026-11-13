import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { OrderStatus } from '@/lib/orders/statuses';
import type { PaymentMethodType } from '@/lib/api/schemas/payments';
import type { Order } from '@/lib/api/schemas/orders';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type Step = keyof Dictionary['orderDetail']['steps'];

const STEPS: Step[] = ['placed', 'confirmed', 'packed', 'shipping', 'delivered'];

/** Five shopper-facing steps over the six progression statuses: the two carrier legs read as one "on the way". */
const STEP_OF: Partial<Record<OrderStatus, Step>> = {
  placed: 'placed', confirmed: 'confirmed', packed: 'packed',
  shipped: 'shipping', out_for_delivery: 'shipping', delivered: 'delivered',
};

/**
 * Horizontal stepper. Cancelled/returned are not a point on it — a single distinct end state (issue #11).
 * Given `payment` (the success page, #206), the second step is the payment rather than the
 * confirmation: done once paid, and for COD "Thanh toán khi nhận", settled at the door.
 */
export function OrderStatusTimeline({ status, payment, dict, className }: {
  status: OrderStatus;
  payment?: { method: PaymentMethodType; status: Order['payment']['status'] };
  dict: Dictionary;
  className?: string;
}) {
  const step = STEP_OF[status];
  if (!step) {
    return (
      <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
        {dict.orders.statuses[status]}
      </div>
    );
  }

  const current = STEPS.indexOf(step);
  const isDone = (i: number) =>
    payment && STEPS[i] === 'confirmed' ? payment.status === 'paid' || step === 'delivered' : i <= current;
  const labelOf = (s: Step) =>
    payment && s === 'confirmed' ? (payment.method === 'cod' ? dict.orderDetail.payOnDelivery : dict.orderDetail.paid) : dict.orderDetail.steps[s];

  return (
    <ol aria-label={dict.orderDetail.status} className={cn('flex items-start py-4', className)}>
      {STEPS.map((s, i) => {
        const done = isDone(i);
        return (
          <li
            key={s} aria-current={i === current ? 'step' : undefined} data-done={done}
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
              {labelOf(s)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
