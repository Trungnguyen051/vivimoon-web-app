import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(JSON.parse(init.body)).toEqual({ lineKey: 'l2', rating: 5, subRatings: { comfort: 4 }, tags: ['allDay'], body: TEXT });
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
