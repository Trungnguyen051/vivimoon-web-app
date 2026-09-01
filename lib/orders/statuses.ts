/**
 * PROVISIONAL — real carrier statuses pending Vivimoon's fulfillment
 * integration (spec §11). Owner: Vivimoon. Order history and live tracking
 * are M3; M2 only ever produces `placed` at creation time.
 */
export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
