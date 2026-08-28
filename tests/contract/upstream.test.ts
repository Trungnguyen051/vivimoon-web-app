/**
 * Contract conformance — upstream side.
 *
 * Skipped unless UPSTREAM_API_BASE_URL is set, so CI stays green without a
 * live backend. Run this against Vivimoon's API before flipping a resource to
 * upstream: green here means that resource is safe to cut over, and red names
 * the exact endpoint and field that disagrees with the contract.
 *
 *   UPSTREAM_API_BASE_URL=https://api.vivimoon.vn npm run test:contract:upstream
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { upstreamFetch } from '@/lib/api/upstream/fetch';
import { productSchema, collectionSchema, reviewSchema } from '@/lib/api/schemas/catalog';

const configured = Boolean(process.env.UPSTREAM_API_BASE_URL);
const describeUpstream = configured ? describe : describe.skip;

describeUpstream('catalog contract against the live API', () => {
  it('GET /products returns products matching the contract', async () => {
    const list = await upstreamFetch('/products', z.array(productSchema));
    expect(list.length).toBeGreaterThan(0);
  });

  it('GET /products supports the type filter', async () => {
    const list = await upstreamFetch('/products?type=colored', z.array(productSchema));
    expect(list.every((p) => p.type === 'colored')).toBe(true);
  });

  it('GET /products/:slug returns one product matching the contract', async () => {
    const [first] = await upstreamFetch('/products', z.array(productSchema));
    const one = await upstreamFetch(`/products/${first.slug}`, productSchema);
    expect(one.slug).toBe(first.slug);
  });

  it('GET /products/:slug/reviews matches the contract', async () => {
    const [first] = await upstreamFetch('/products', z.array(productSchema));
    await upstreamFetch(`/products/${first.slug}/reviews`, z.array(reviewSchema));
  });

  it('GET /collections matches the contract', async () => {
    const list = await upstreamFetch('/collections', z.array(collectionSchema));
    expect(list.length).toBeGreaterThan(0);
  });

  it('collection productIds resolve against the live catalogue', async () => {
    const [collection] = await upstreamFetch('/collections', z.array(collectionSchema));
    const products = await upstreamFetch('/products', z.array(productSchema));
    const ids = new Set(products.map((p) => p.id));
    expect(collection.productIds.filter((id) => !ids.has(id))).toEqual([]);
  });
});
