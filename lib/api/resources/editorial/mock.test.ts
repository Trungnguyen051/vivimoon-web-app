import { describe, it, expect } from 'vitest';
import { mockEditorial } from './mock';

describe('mockEditorial', () => {
  it('lists articles newest first', async () => {
    const dates = (await mockEditorial.listArticles()).map((a) => a.publishedAt);

    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('finds an article by slug, and nothing for an unknown one', async () => {
    const [first] = await mockEditorial.listArticles();

    expect((await mockEditorial.getArticleBySlug(first.slug))?.slug).toBe(first.slug);
    expect(await mockEditorial.getArticleBySlug('nope')).toBeNull();
  });

  it('does not expose its own array for callers to sort in place', async () => {
    const once = await mockEditorial.listArticles();
    once.reverse();

    expect((await mockEditorial.listArticles()).map((a) => a.slug)).not.toEqual(once.map((a) => a.slug));
  });
});
