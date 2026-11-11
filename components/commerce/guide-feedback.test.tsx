import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuideFeedback } from './guide-feedback';
import { apiRequest } from '@/lib/api/client';
import { vi as viDict } from '@/lib/i18n/dictionaries/vi';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));
const mockedApiRequest = vi.mocked(apiRequest);

const dict = viDict.support.guide;
const SLUG = 'cach-deo-va-thao-lens';

function renderFeedback() {
  render(<GuideFeedback guideSlug={SLUG} dict={dict} />);
  return {
    yes: () => screen.getByRole('button', { name: dict.feedbackYes }),
    no: () => screen.getByRole('button', { name: dict.feedbackNo }),
  };
}

describe('GuideFeedback', () => {
  beforeEach(() => mockedApiRequest.mockReset());

  it('asks the question with both answers live', () => {
    const { yes, no } = renderFeedback();

    expect(screen.getByText(dict.feedbackQuestion)).toBeInTheDocument();
    expect(yes()).toBeEnabled();
    expect(no()).toBeEnabled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it.each([
    [dict.feedbackYes, true],
    [dict.feedbackNo, false],
  ])('posts %s as helpful=%s and closes the question', async (label, helpful) => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: { guideSlug: SLUG, helpful } });
    renderFeedback();

    await userEvent.click(screen.getByRole('button', { name: label }));

    expect(mockedApiRequest).toHaveBeenCalledWith('/api/support/guide-feedback', {
      method: 'POST', body: { guideSlug: SLUG, helpful },
    });
    expect(await screen.findByRole('status')).toHaveTextContent(dict.feedbackThanks);
  });

  it('disables both answers once a vote lands, so the reader can see it did', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: { guideSlug: SLUG, helpful: true } });
    const { yes, no } = renderFeedback();

    await userEvent.click(yes());

    expect(yes()).toBeDisabled();
    expect(no()).toBeDisabled();
    await userEvent.click(no());
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
  });

  /**
   * The thing this ticket says it must not do. A control that goes quiet on a failed
   * request tells a reader their answer was recorded when it was not — so the question
   * stays open and says what happened.
   */
  it('does not pretend when the vote fails to record', async () => {
    mockedApiRequest.mockResolvedValue({ ok: false, error: { code: 'internal', message: 'Something went wrong.' } });
    const { yes, no } = renderFeedback();

    await userEvent.click(yes());

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(dict.feedbackError);
    // English-only envelope copy never reaches the Vietnamese storefront (#64).
    expect(alert).not.toHaveTextContent('Something went wrong');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    // Still answerable — the reader has not voted yet.
    expect(yes()).toBeEnabled();
    expect(no()).toBeEnabled();
  });

  it('lets a failed vote be retried, and clears the failure when it lands', async () => {
    mockedApiRequest.mockResolvedValueOnce({ ok: false, error: { code: 'internal', message: 'x' } });
    const { yes } = renderFeedback();
    await userEvent.click(yes());
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    mockedApiRequest.mockResolvedValueOnce({ ok: true, data: { guideSlug: SLUG, helpful: true } });
    await userEvent.click(yes());

    expect(await screen.findByRole('status')).toHaveTextContent(dict.feedbackThanks);
    // Both regions are mounted from the start, so a cleared failure is an empty one.
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  /**
   * No identity to remember a vote against, and storing it locally would be a dedup
   * that works on one device — which reads as a guarantee and is not one.
   */
  it('remembers nothing across a reload', async () => {
    mockedApiRequest.mockResolvedValue({ ok: true, data: { guideSlug: SLUG, helpful: true } });
    const { unmount } = render(<GuideFeedback guideSlug={SLUG} dict={dict} />);
    await userEvent.click(screen.getByRole('button', { name: dict.feedbackYes }));
    expect(await screen.findByRole('status')).toHaveTextContent(dict.feedbackThanks);
    unmount();

    renderFeedback();
    expect(screen.getByRole('button', { name: dict.feedbackYes })).toBeEnabled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(window.localStorage.length).toBe(0);
  });
});
