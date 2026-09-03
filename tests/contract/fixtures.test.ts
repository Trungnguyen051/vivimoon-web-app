/**
 * Contract conformance — mock side.
 *
 * Every fixture must satisfy the same schema the real API will be held to.
 * This is what stops mock data drifting from the contract we handed Vivimoon's
 * backend developer, and it is the local half of `npm run test:contract`.
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { products, collections, reviews, users, vouchers, orders } from '@/content/mock';
import { productSchema, collectionSchema, reviewSchema } from '@/lib/api/schemas/catalog';
import { userSchema } from '@/lib/api/schemas/auth';
import { voucherSchema } from '@/lib/api/schemas/cart';
import { orderSchema, orderStatusSchema } from '@/lib/api/schemas/orders';

function expectAllValid<T extends z.ZodTypeAny>(schema: T, rows: unknown[], label: string) {
  const failures: string[] = [];
  rows.forEach((row, i) => {
    const result = schema.safeParse(row);
    if (!result.success) {
      failures.push(`${label}[${i}]: ${result.error.issues.map((x) => `${x.path.join('.')} ${x.message}`).join('; ')}`);
    }
  });
  expect(failures, failures.join('\n')).toEqual([]);
}

describe('fixture conformance', () => {
  it('has fixtures to check', () => {
    expect(products.length).toBeGreaterThan(0);
    expect(collections.length).toBeGreaterThan(0);
    expect(reviews.length).toBeGreaterThan(0);
    expect(vouchers.length).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
  });

  it('every product satisfies productSchema', () => {
    expectAllValid(productSchema, products, 'product');
  });

  it('every collection satisfies collectionSchema', () => {
    expectAllValid(collectionSchema, collections, 'collection');
  });

  it('every review satisfies reviewSchema', () => {
    expectAllValid(reviewSchema, reviews, 'review');
  });

  it('collection productIds all resolve to a real product', () => {
    const ids = new Set(products.map((p) => p.id));
    const dangling = collections.flatMap((c) =>
      c.productIds.filter((id) => !ids.has(id)).map((id) => `${c.slug} -> ${id}`),
    );
    expect(dangling).toEqual([]);
  });

  it('review productIds all resolve to a real product', () => {
    const ids = new Set(products.map((p) => p.id));
    const dangling = reviews.filter((r) => !ids.has(r.productId)).map((r) => r.id);
    expect(dangling).toEqual([]);
  });

  it('variant ids are globally unique', () => {
    const all = products.flatMap((p) => p.variants.map((v) => v.id));
    expect(all.length).toBe(new Set(all).size);
  });

  it('product slugs are unique', () => {
    const slugs = products.map((p) => p.slug);
    expect(slugs.length).toBe(new Set(slugs).size);
  });

  it('every user satisfies userSchema', () => {
    expectAllValid(userSchema, users, 'user');
  });

  it('user phones are unique', () => {
    const phones = users.map((u) => u.phone);
    expect(phones.length).toBe(new Set(phones).size);
  });

  it('every voucher satisfies voucherSchema', () => {
    expectAllValid(voucherSchema, vouchers, 'voucher');
  });

  it('voucher codes are unique', () => {
    const codes = vouchers.map((v) => v.code);
    expect(codes.length).toBe(new Set(codes).size);
  });

  it('every order satisfies orderSchema', () => {
    expectAllValid(orderSchema, orders, 'order');
  });

  it('order codes are unique', () => {
    const codes = orders.map((o) => o.code);
    expect(codes.length).toBe(new Set(codes).size);
  });

  it('order ids resolve to a real user', () => {
    const ids = new Set(users.map((u) => u.id));
    const dangling = orders.filter((o) => o.userId && !ids.has(o.userId)).map((o) => o.id);
    expect(dangling).toEqual([]);
  });

  it('seed orders span every OrderStatus', () => {
    const statuses = new Set(orders.map((o) => o.status));
    for (const status of orderStatusSchema.options) {
      expect(statuses.has(status), `missing seeded order with status "${status}"`).toBe(true);
    }
  });
});
