import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ReviewForm } from './review-form';

const dict = getDictionary('vi');
const t = dict.writeReview;
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
const TEXT = 'Đeo cả ngày đi làm vẫn êm, không khô mắt.';

function renderForm() {
  render(
    <ReviewForm
      orderId="order-seed-10" lineKey="l2" orderHref="/vi/account/orders/order-seed-10" productHref="/vi/product/breeze-daily-clear"
      dict={{ writeReview: t, reviews: dict.reviews }}
    />,
  );
  return userEvent.setup();
}

const submit = () => screen.getByRole('button', { name: t.submit });
const body = () => screen.getByLabelText(new RegExp(t.body));

afterEach(() => { vi.unstubAllGlobals(); });

describe('ReviewForm', () => {
  it('labels every star input', () => {
    renderForm();
    expect(screen.getAllByRole('radio', { name: '5 trên 5 sao' })).toHaveLength(4); // overall + 3 sub-ratings
    expect(screen.getByRole('group', { name: new RegExp(t.overall) })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: dict.reviews.subRatings.comfort })).toBeInTheDocument();
  });

  it('keeps submit disabled until there are stars and 20 characters of text', async () => {
    const user = renderForm();
    expect(submit()).toBeDisabled();
    await user.type(body(), TEXT);
    expect(submit()).toBeDisabled();
    await user.click(screen.getAllByRole('radio', { name: '4 trên 5 sao' })[0]);
    expect(submit()).toBeEnabled();
  });

  it('announces the missing stars and short text once touched', async () => {
    const user = renderForm();
    await user.type(body(), 'Quá ngắn');
    await user.tab();
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alerts).toContain(t.errors.rating);
    expect(alerts).toContain('Viết tối thiểu 20 ký tự (còn 12)');
    expect(body()).toHaveAttribute('aria-invalid', 'true');
  });

  it('counts characters live and flags text over 1000', async () => {
    const user = renderForm();
    await user.type(body(), 'Mười ký tự');
    expect(screen.getByText('10/1000 ký tự')).toBeInTheDocument();
    await user.clear(body());
    await user.click(body());
    await user.paste('a'.repeat(1001));
    await user.tab();
    expect(screen.getAllByRole('alert').map((a) => a.textContent)).toContain(t.errors.bodyLong);
  });

  it('allows at most three wearer tags', async () => {
    const user = renderForm();
    const tags = ['sensitiveEyes', 'allDay', 'beginner', 'myopic'] as const;
    for (const tag of tags.slice(0, 3)) await user.click(screen.getByRole('checkbox', { name: dict.reviews.tags[tag] }));
    expect(screen.getByRole('checkbox', { name: dict.reviews.tags.myopic })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: dict.reviews.tags.allDay }));
    expect(screen.getByRole('checkbox', { name: dict.reviews.tags.myopic })).toBeEnabled();
  });

  it('sends the Review and confirms it is being checked', async () => {
    const fetch = vi.fn().mockResolvedValue(json({ ok: true, data: { id: 'r-1', status: 'pending' } }));
    vi.stubGlobal('fetch', fetch);
    const user = renderForm();
    await user.click(screen.getAllByRole('radio', { name: '5 trên 5 sao' })[0]);
    await user.click(screen.getAllByRole('radio', { name: '4 trên 5 sao' })[1]); // comfort
    await user.click(screen.getByRole('checkbox', { name: dict.reviews.tags.allDay }));
    await user.type(body(), TEXT);
    await user.click(submit());

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/orders/order-seed-10/reviews');
    expect(JSON.parse(init.body)).toEqual({ lineKey: 'l2', rating: 5, subRatings: { comfort: 4 }, tags: ['allDay'], body: TEXT, media: [] });
    expect(await screen.findByRole('status')).toHaveTextContent(t.sentTitle);
    expect(screen.getByRole('link', { name: t.backToOrder })).toHaveAttribute('href', '/vi/account/orders/order-seed-10');
  });

  it('shows the server\'s refusal and keeps the form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ok: false, error: { code: 'conflict', message: 'This line already has a review' } })));
    const user = renderForm();
    await user.click(screen.getAllByRole('radio', { name: '5 trên 5 sao' })[0]);
    await user.type(body(), TEXT);
    await user.click(submit());
    expect(await screen.findByText('This line already has a review')).toBeInTheDocument();
    expect(submit()).toBeEnabled();
  });
});

/** Stands in for the browser's XMLHttpRequest, which the uploader uses for its progress events. */
class FakeXHR {
  static sent: FakeXHR[] = [];
  upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  responseType = '';
  response: unknown = null;
  url = '';
  body: FormData | null = null;
  open(_method: string, url: string) { this.url = url; }
  send(body: FormData) { this.body = body; FakeXHR.sent.push(this); }
  progress(fraction: number) { act(() => this.upload.onprogress?.({ lengthComputable: true, loaded: fraction * 100, total: 100 })); }
  async respond(json: unknown) { this.response = json; await act(async () => this.onload?.()); }
  async fail() { await act(async () => this.onerror?.()); }
}

describe('ReviewForm photos and video', () => {
  const m = t.media;
  const photo = (name = 'mat.jpg', size = 1000) => new File([new Uint8Array(size)], name, { type: 'image/jpeg' });
  const clip = (name = 'clip.mp4', size = 1000) => new File([new Uint8Array(size)], name, { type: 'video/mp4' });
  const picker = () => screen.getByLabelText(m.add) as HTMLInputElement;
  const ref = (id: string, type = 'image') => ({ ok: true, data: { id, type, url: `/api/reviews/media/${id}` } });

  beforeEach(() => {
    FakeXHR.sent = [];
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:preview', revokeObjectURL: () => {} }));
  });

  async function fillValid(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getAllByRole('radio', { name: '5 trên 5 sao' })[0]);
    await user.type(body(), TEXT);
  }

  it('uploads each file as it is added, one per request, with announced progress', async () => {
    const user = renderForm();
    await user.upload(picker(), [photo('a.jpg'), clip('b.mp4')]);
    expect(FakeXHR.sent.map((x) => [x.url, (x.body!.get('file') as File).name])).toEqual([
      ['/api/reviews/media', 'a.jpg'], ['/api/reviews/media', 'b.mp4'],
    ]);
    FakeXHR.sent[0].progress(0.4);
    expect(screen.getByRole('progressbar', { name: 'Đang tải lên a.jpg' })).toHaveAttribute('aria-valuenow', '40');
    await FakeXHR.sent[0].respond(ref('m-1'));
    expect(screen.queryByRole('progressbar', { name: 'Đang tải lên a.jpg' })).not.toBeInTheDocument();
    expect(screen.getByText('Đã tải lên a.jpg')).toBeInTheDocument();
    expect(screen.getByText('1/5 ảnh · 1/1 video')).toBeInTheDocument();
  });

  it('blocks sending while an upload runs, then sends the references', async () => {
    const fetch = vi.fn().mockResolvedValue(json({ ok: true, data: { id: 'r-1', status: 'pending' } }));
    vi.stubGlobal('fetch', fetch);
    const user = renderForm();
    await fillValid(user);
    await user.upload(picker(), [photo('a.jpg'), clip('b.mp4')]);
    expect(submit()).toBeDisabled();
    expect(screen.getByText(m.waiting)).toBeInTheDocument();
    await FakeXHR.sent[0].respond(ref('m-1'));
    expect(submit()).toBeDisabled();
    await FakeXHR.sent[1].respond(ref('m-2', 'video'));
    expect(submit()).toBeEnabled();
    await user.click(submit());
    expect(JSON.parse(fetch.mock.calls[0][1].body).media).toEqual(['m-1', 'm-2']);
  });

  it('shows a failed upload with its reason, and retries just that file', async () => {
    const user = renderForm();
    await fillValid(user);
    await user.upload(picker(), clip('a.mp4'));
    await FakeXHR.sent[0].respond({ ok: false, error: { code: 'validation_failed', message: 'A video can be up to 30 seconds', field: 'file.duration' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Không tải lên được a.mp4: Video dài quá 30 giây');
    expect(submit()).toBeDisabled();
    expect(screen.getByText(m.fixFailed)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Thử lại a.mp4' }));
    expect(FakeXHR.sent).toHaveLength(2);
    expect((FakeXHR.sent[1].body!.get('file') as File).name).toBe('a.mp4');
    await FakeXHR.sent[1].respond(ref('m-1', 'video'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(submit()).toBeEnabled();
  });

  it('treats a network failure as a failed upload', async () => {
    const user = renderForm();
    await user.upload(picker(), photo('a.jpg'));
    await FakeXHR.sent[0].fail();
    expect(screen.getByRole('alert')).toHaveTextContent(m.reasons.other);
    expect(screen.getByRole('button', { name: 'Thử lại a.jpg' })).toBeInTheDocument();
  });

  it('removes one file and leaves the rest', async () => {
    const fetch = vi.fn().mockResolvedValue(json({ ok: true, data: { id: 'r-1', status: 'pending' } }));
    vi.stubGlobal('fetch', fetch);
    const user = renderForm();
    await fillValid(user);
    await user.upload(picker(), [photo('a.jpg'), photo('b.jpg')]);
    await FakeXHR.sent[0].respond(ref('m-1'));
    await FakeXHR.sent[1].respond({ ok: false, error: { code: 'internal', message: 'Lỗi' } });
    await user.click(screen.getByRole('button', { name: 'Xóa b.jpg' }));
    expect(screen.queryByRole('button', { name: 'Xóa b.jpg' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xóa a.jpg' })).toBeInTheDocument();
    expect(screen.getByText('Đã xóa b.jpg')).toBeInTheDocument();
    await user.click(submit());
    expect(JSON.parse(fetch.mock.calls[0][1].body).media).toEqual(['m-1']);
  });

  it('refuses the wrong type and oversized files before uploading, with a clear message', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(
      <ReviewForm
        orderId="order-seed-10" lineKey="l2" orderHref="/vi/account/orders/order-seed-10" productHref="/vi/product/breeze-daily-clear"
        dict={{ writeReview: t, reviews: dict.reviews }}
      />,
    );
    await user.upload(picker(), [
      new File(['x'], 'anh.gif', { type: 'image/gif' }),
      photo('to.jpg', 5 * 1024 * 1024 + 1),
      clip('dai.mp4', 50 * 1024 * 1024 + 1),
    ]);
    expect(FakeXHR.sent).toHaveLength(0);
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alerts).toEqual([
      'anh.gif: chỉ nhận ảnh JPG, PNG, WEBP hoặc video MP4',
      'to.jpg: mỗi ảnh tối đa 5 MB',
      'dai.mp4: video tối đa 50 MB',
    ]);
  });

  it('takes at most 5 photos and 1 video, then hides the add tile', async () => {
    const user = renderForm();
    await user.upload(picker(), [...Array.from({ length: 6 }, (_, i) => photo(`${i}.jpg`)), clip('a.mp4'), clip('b.mp4')]);
    expect(FakeXHR.sent).toHaveLength(6);
    expect(screen.getAllByRole('alert').map((a) => a.textContent)).toEqual([m.errors.imageCount, m.errors.videoCount]);
    expect(screen.queryByLabelText(m.add)).not.toBeInTheDocument();
  });
});
