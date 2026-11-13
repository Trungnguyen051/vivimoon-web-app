import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Review } from '@/lib/types';

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
  }),
}));

process.env.AUTH_COOKIE_SECRET = 'test-secret';

const { POST: upload } = await import('./route');
const { GET: serve } = await import('./[id]/route');
const { POST: createReview } = await import('@/app/api/orders/[id]/reviews/route');
const { GET: getProductReviews } = await import('@/app/api/products/[slug]/reviews/route');
const { signSession } = await import('@/lib/auth/cookie');
const { resetMockOrdersState } = await import('@/lib/api/resources/orders/mock');
const { resetMockReviewsState, moderateReview } = await import('@/lib/api/resources/catalog/mock');

const MB = 1024 * 1024;
const signIn = (userId = 'u-001') => jar.set('vivimoon_session', signSession(userId));

const bytes = (head: number[] | string, size = 64) => {
  const out = new Uint8Array(size);
  out.set(typeof head === 'string' ? [...head].map((c) => c.charCodeAt(0)) : head);
  return out;
};
const JPEG = (size?: number) => bytes([0xff, 0xd8, 0xff, 0xe0], size);
const PNG = () => bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP = () => bytes('RIFF\0\0\0\0WEBP');

/** A minimal mp4: an `ftyp` box, then a version-0 `mvhd` with a timescale of 1000. */
function MP4(seconds?: number, size = 128) {
  const out = bytes('\0\0\0\x14ftypisom', size);
  if (seconds !== undefined) {
    const view = new DataView(out.buffer);
    out.set([...'mvhd'].map((c) => c.charCodeAt(0)), 24);
    view.setUint32(40, 1000); // 24 + 4 type + 4 version/flags + 8 dates
    view.setUint32(44, seconds * 1000);
  }
  return out;
}

type Upload = { data: Uint8Array; name: string; type: string };
const file = (data: Uint8Array, name: string, type: string): Upload => ({ data, name, type });

/** Encoded by hand: jsdom's FormData and File don't survive a Node Request body, and the route reads Node's. */
async function send(...files: Upload[]) {
  const boundary = 'review-media-boundary';
  const body = Buffer.concat([
    ...files.flatMap((f) => [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${f.name}"\r\nContent-Type: ${f.type}\r\n\r\n`),
      f.data,
      Buffer.from('\r\n'),
    ]),
    Buffer.from(`--${boundary}--\r\n`),
  ]);
  const res = await upload(new Request('http://x/api/reviews/media', {
    method: 'POST', body, headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  }));
  return { res, body: await res.json() };
}

describe('POST /api/reviews/media', () => {
  beforeEach(() => { jar.clear(); resetMockReviewsState(); });

  it('401s a guest', async () => {
    expect((await send(file(JPEG(), 'a.jpg', 'image/jpeg'))).res.status).toBe(401);
  });

  it.each([
    ['a jpg', JPEG(), 'image/jpeg', 'image'],
    ['a png', PNG(), 'image/png', 'image'],
    ['a webp', WEBP(), 'image/webp', 'image'],
    ['an mp4', MP4(12), 'video/mp4', 'video'],
  ])('keeps %s and serves it back by its reference', async (_name, data, type, kind) => {
    signIn();
    const { res, body } = await send(file(data, 'x', type));
    expect(res.status).toBe(201);
    expect(body.data).toMatchObject({ type: kind, url: `/api/reviews/media/${body.data.id}` });

    const served = await serve(new Request(`http://x${body.data.url}`), { params: Promise.resolve({ id: body.data.id }) });
    expect(served.headers.get('content-type')).toBe(type);
    expect(new Uint8Array(await served.arrayBuffer())).toEqual(data);
  });

  it('goes by what the file is, not the type the browser declared', async () => {
    signIn();
    const gif = bytes('GIF89a');
    const { res, body } = await send(file(gif, 'a.jpg', 'image/jpeg'));
    expect(res.status).toBe(400);
    expect(body.error).toMatchObject({ code: 'validation_failed', field: 'file.type' });
    expect(body.error.message).toMatch(/jpg, png, webp or mp4/i);
    // A real jpg declared as something else is still a jpg.
    expect((await send(file(JPEG(), 'a.bin', 'application/octet-stream'))).res.status).toBe(201);
  });

  it('refuses a photo over 5 MB and a video over 50 MB', async () => {
    signIn();
    expect((await send(file(JPEG(5 * MB), 'ok.jpg', 'image/jpeg'))).res.status).toBe(201);
    const photo = await send(file(JPEG(5 * MB + 1), 'big.jpg', 'image/jpeg'));
    expect(photo.res.status).toBe(400);
    expect(photo.body.error.message).toMatch(/5 MB/);
    const video = await send(file(MP4(undefined, 50 * MB + 1), 'big.mp4', 'video/mp4'));
    expect(video.res.status).toBe(400);
    expect(video.body.error.message).toMatch(/50 MB/);
  });

  it('refuses a video over 30 seconds when its header says so, and takes one whose length is unknown', async () => {
    signIn();
    expect((await send(file(MP4(30), 'ok.mp4', 'video/mp4'))).res.status).toBe(201);
    const long = await send(file(MP4(31), 'long.mp4', 'video/mp4'));
    expect(long.res.status).toBe(400);
    expect(long.body.error).toMatchObject({ field: 'file.duration', message: expect.stringMatching(/30 seconds/) });
    expect((await send(file(MP4(), 'unknown.mp4', 'video/mp4'))).res.status).toBe(201);
  });

  it('takes exactly one file per request', async () => {
    signIn();
    expect((await send()).res.status).toBe(400);
    expect((await send(file(JPEG(), 'a.jpg', 'image/jpeg'), file(PNG(), 'b.png', 'image/png'))).res.status).toBe(400);
  });

  it('404s an unknown reference', async () => {
    const res = await serve(new Request('http://x/api/reviews/media/m-nope'), { params: Promise.resolve({ id: 'm-nope' }) });
    expect(res.status).toBe(404);
  });
});

describe('media on a Review', () => {
  beforeEach(() => { jar.clear(); resetMockOrdersState(); resetMockReviewsState(); signIn(); });

  const VALID = { rating: 5, body: 'Đeo cả ngày đi làm vẫn êm, không khô mắt chút nào.', lineKey: 'l2' };
  async function create(body: Record<string, unknown>) {
    const res = await createReview(
      new Request('http://x/api/orders/order-seed-10/reviews', { method: 'POST', body: JSON.stringify({ ...VALID, ...body }) }),
      { params: Promise.resolve({ id: 'order-seed-10' }) },
    );
    return { res, body: await res.json() };
  }
  async function publicReviews(query = ''): Promise<Review[]> {
    const res = await getProductReviews(
      new Request(`http://x/api/products/breeze-daily-clear/reviews${query}`), { params: Promise.resolve({ slug: 'breeze-daily-clear' }) },
    );
    return (await res.json()).data;
  }
  const ids = async (...files: Upload[]) => Promise.all(files.map(async (f) => (await send(f)).body.data.id as string));

  it('attaches uploaded photos and a video, shown once approved and found by the media filter', async () => {
    const [photo, video] = await ids(file(JPEG(), 'a.jpg', 'image/jpeg'), file(MP4(10), 'b.mp4', 'video/mp4'));
    const { res, body } = await create({ media: [photo, video] });
    expect(res.status).toBe(201);
    moderateReview(body.data.id, 'approved');

    const shown = (await publicReviews('?hasMedia=true')).find((r) => r.id === body.data.id);
    expect(shown?.media).toEqual([
      { type: 'image', url: `/api/reviews/media/${photo}` },
      { type: 'video', url: `/api/reviews/media/${video}` },
    ]);
  });

  it('refuses more than 5 photos or more than 1 video', async () => {
    const photos = await ids(...Array.from({ length: 6 }, (_, i) => file(JPEG(), `${i}.jpg`, 'image/jpeg')));
    expect((await create({ media: photos })).res.status).toBe(400);
    const videos = await ids(file(MP4(5), 'a.mp4', 'video/mp4'), file(MP4(5), 'b.mp4', 'video/mp4'));
    const { res, body } = await create({ media: videos });
    expect(res.status).toBe(400);
    expect(body.error.field).toBe('media');
    expect((await create({ media: [...photos.slice(0, 5), videos[0]] })).res.status).toBe(201);
  });

  it('refuses a reference that is unknown or someone else\'s', async () => {
    signIn('u-002');
    const [theirs] = await ids(file(JPEG(), 'a.jpg', 'image/jpeg'));
    signIn();
    expect((await create({ media: [theirs] })).res.status).toBe(400);
    expect((await create({ media: ['m-nope'] })).res.status).toBe(400);
  });
});
